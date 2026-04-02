import { Peer, type DataConnection, type PeerError, type PeerJSOption } from 'peerjs';
import * as Y from 'yjs';
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
  removeAwarenessStates
} from 'y-protocols/awareness';
import { IndexeddbPersistence } from 'y-indexeddb';

export interface ConnectedUser {
  clientId: number;
  color: string;
  name: string;
}

export interface CollaborationProvider {
  awareness: Awareness;
}

interface AwarenessUserState {
  user?: {
    color: string;
    name: string;
  };
}

interface AwarenessChanges {
  added: number[];
  updated: number[];
  removed: number[];
}

interface BasePeerMessage {
  type: 'sync-state' | 'doc-update' | 'awareness-update';
}

interface SyncStateMessage extends BasePeerMessage {
  type: 'sync-state';
  update: number[];
}

interface DocumentUpdateMessage extends BasePeerMessage {
  type: 'doc-update';
  update: number[];
}

interface AwarenessMessage extends BasePeerMessage {
  type: 'awareness-update';
  clientIds: number[];
  update: number[];
}

type PeerMessage = SyncStateMessage | DocumentUpdateMessage | AwarenessMessage;

const ROOM_PREFIX = 'peerscribe';
const PEER_HOST_SUFFIX = 'host';
const REMOTE_ORIGIN_PREFIX = 'remote:';
const RECONNECT_DELAY_MS = 1500;

const generateRandomColor = () => {
  const colors = [
    '#f59e0b', '#ef4444', '#10b981', '#3b82f6',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const normalizeRoomName = (roomName: string) => {
  const normalized = roomName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'room';
};

const getPeerOptions = (): PeerJSOption => {
  const host = import.meta.env.VITE_PEER_HOST?.trim();

  if (!host) {
    return {};
  }

  const portValue = import.meta.env.VITE_PEER_PORT?.trim();
  const parsedPort = portValue ? Number(portValue) : undefined;
  const secureValue = import.meta.env.VITE_PEER_SECURE?.trim();
  const secure = secureValue ? secureValue === 'true' : undefined;
  const path = import.meta.env.VITE_PEER_PATH?.trim() || '/';

  return {
    host,
    path,
    port: Number.isFinite(parsedPort) ? parsedPort : undefined,
    secure,
  };
};

const isRemoteOrigin = (origin: unknown) =>
  typeof origin === 'string' && origin.startsWith(REMOTE_ORIGIN_PREFIX);

const isPeerUnavailableIdError = (error: unknown): error is PeerError<'unavailable-id'> =>
  typeof error === 'object' &&
  error !== null &&
  'type' in error &&
  error.type === 'unavailable-id';

const isPeerMessage = (value: unknown): value is PeerMessage => {
  if (typeof value !== 'object' || value === null || !('type' in value)) {
    return false;
  }

  const message = value as Partial<PeerMessage>;
  return message.type === 'sync-state'
    || message.type === 'doc-update'
    || message.type === 'awareness-update';
};

const toNumberArray = (value: Uint8Array) => Array.from(value);

const toUint8Array = (value: number[]) => Uint8Array.from(value);

const waitForPeerOpen = (peer: Peer) =>
  new Promise<string>((resolve, reject) => {
    const handleOpen = (peerId: string) => {
      cleanup();
      resolve(peerId);
    };

    const handleError = (error: PeerError<string>) => {
      cleanup();
      reject(error);
    };

    const handleClose = () => {
      cleanup();
      reject(new Error('Peer closed before opening.'));
    };

    const cleanup = () => {
      peer.off('open', handleOpen);
      peer.off('error', handleError);
      peer.off('close', handleClose);
    };

    peer.on('open', handleOpen);
    peer.on('error', handleError);
    peer.on('close', handleClose);
  });

const waitForConnectionOpen = (connection: DataConnection) =>
  new Promise<void>((resolve, reject) => {
    const handleOpen = () => {
      cleanup();
      resolve();
    };

    const handleError = (error: PeerError<string>) => {
      cleanup();
      reject(error);
    };

    const handleClose = () => {
      cleanup();
      reject(new Error('Peer connection closed before opening.'));
    };

    const cleanup = () => {
      connection.off('open', handleOpen);
      connection.off('error', handleError);
      connection.off('close', handleClose);
    };

    connection.on('open', handleOpen);
    connection.on('error', handleError);
    connection.on('close', handleClose);
  });

export class CollaborationService {
  doc: Y.Doc;
  provider: CollaborationProvider | null = null;
  persistence: IndexeddbPersistence | null = null;
  awareness: Awareness | null = null;
  roomName: string;
  userName: string;
  color: string;

  private readonly hostPeerId: string;
  private readonly peerOptions: PeerJSOption;
  private peer: Peer | null = null;
  private hostConnection: DataConnection | null = null;
  private guestConnections = new Map<string, DataConnection>();
  private remoteClientIdsByPeer = new Map<string, Set<number>>();
  private reconnectTimeout: number | null = null;
  private isHost = false;
  private isDestroyed = false;

  constructor(roomName: string, userName: string) {
    const normalizedRoom = normalizeRoomName(roomName);

    this.doc = new Y.Doc();
    this.roomName = `${ROOM_PREFIX}-${normalizedRoom}`;
    this.hostPeerId = `${this.roomName}-${PEER_HOST_SUFFIX}`;
    this.userName = userName;
    this.color = generateRandomColor();
    this.peerOptions = getPeerOptions();
  }

  async connect() {
    this.isDestroyed = false;
    this.awareness = new Awareness(this.doc);
    this.awareness.setLocalStateField('user', {
      color: this.color,
      name: this.userName,
    });

    this.provider = {
      awareness: this.awareness,
    };
    this.persistence = new IndexeddbPersistence(this.roomName, this.doc);

    this.doc.on('update', this.handleDocumentUpdate);
    this.awareness.on('update', this.handleAwarenessUpdate);

    try {
      await this.initializePeerTopology();
    } catch (error) {
      this.disconnect();
      throw error;
    }
  }

  disconnect() {
    this.isDestroyed = true;
    this.clearReconnectTimeout();

    this.doc.off('update', this.handleDocumentUpdate);
    this.awareness?.off('update', this.handleAwarenessUpdate);
    this.awareness?.destroy();

    this.hostConnection?.close();
    this.hostConnection = null;

    for (const connection of this.guestConnections.values()) {
      connection.close();
    }

    this.guestConnections.clear();
    this.remoteClientIdsByPeer.clear();

    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    if (this.persistence) {
      void this.persistence.destroy();
      this.persistence = null;
    }

    this.provider = null;
    this.awareness = null;
  }

  getConnectedUsers(): ConnectedUser[] {
    if (!this.awareness) {
      return [];
    }

    return Array.from(this.awareness.getStates().entries())
      .flatMap(([clientId, state]) => {
        const user = (state as AwarenessUserState).user;
        if (!user) {
          return [];
        }

        return [{
          clientId,
          color: user.color,
          name: user.name,
        }];
      })
      .sort((left, right) => left.clientId - right.clientId);
  }

  private async initializePeerTopology() {
    const hostPeer = new Peer(this.hostPeerId, this.peerOptions);

    try {
      await waitForPeerOpen(hostPeer);
      if (this.isDestroyed) {
        hostPeer.destroy();
        return;
      }

      this.peer = hostPeer;
      this.isHost = true;
      this.registerPeerListeners(hostPeer);
      return;
    } catch (error) {
      hostPeer.destroy();

      if (!isPeerUnavailableIdError(error)) {
        throw error;
      }
    }

    const guestPeer = new Peer(this.peerOptions);
    await waitForPeerOpen(guestPeer);

    if (this.isDestroyed) {
      guestPeer.destroy();
      return;
    }

    this.peer = guestPeer;
    this.isHost = false;
    this.registerPeerListeners(guestPeer);
    await this.connectToHostPeer();
  }

  private registerPeerListeners(peer: Peer) {
    peer.on('error', this.handlePeerError);
    peer.on('disconnected', this.handlePeerDisconnected);
    peer.on('close', this.handlePeerClosed);

    if (this.isHost) {
      peer.on('connection', this.handleIncomingConnection);
    }
  }

  private handlePeerError = (error: PeerError<string>) => {
    if (this.isDestroyed) {
      return;
    }

    console.error('PeerJS error:', error);
  };

  private handlePeerDisconnected = () => {
    if (this.isDestroyed) {
      return;
    }

    console.warn('Disconnected from the PeerJS rendezvous server.');
  };

  private handlePeerClosed = () => {
    if (this.isDestroyed) {
      return;
    }

    console.warn('PeerJS session closed.');
  };

  private connectToHostPeer = async () => {
    if (!this.peer) {
      throw new Error('Guest peer is not ready.');
    }

    const connection = this.peer.connect(this.hostPeerId, {
      label: this.roomName,
      reliable: true,
      metadata: {
        roomName: this.roomName,
      },
    });

    this.attachHostConnection(connection);
    await waitForConnectionOpen(connection);
    this.hostConnection = connection;
    this.sendLocalAwareness(connection);
  };

  private handleIncomingConnection = (connection: DataConnection) => {
    this.attachGuestConnection(connection);
  };

  private attachGuestConnection(connection: DataConnection) {
    connection.on('open', () => {
      if (this.isDestroyed) {
        connection.close();
        return;
      }

      this.guestConnections.set(connection.peer, connection);
      this.sendSyncState(connection);
      this.sendAwarenessSnapshot(connection);
    });

    connection.on('data', (data) => {
      const message = this.parseMessage(data);
      if (!message) {
        return;
      }

      this.handleGuestMessage(connection.peer, message);
    });

    connection.on('close', () => {
      if (this.isDestroyed) {
        return;
      }

      this.guestConnections.delete(connection.peer);
      this.removeTrackedAwareness(connection.peer, 'connection-close');
    });

    connection.on('error', (error) => {
      if (this.isDestroyed) {
        return;
      }

      console.error(`Guest connection error (${connection.peer}):`, error);
    });
  }

  private attachHostConnection(connection: DataConnection) {
    connection.on('data', (data) => {
      const message = this.parseMessage(data);
      if (!message) {
        return;
      }

      this.handleHostMessage(message);
    });

    connection.on('close', () => {
      if (this.isDestroyed) {
        return;
      }

      this.hostConnection = null;
      this.clearAllRemoteAwareness('host-disconnected');
      this.scheduleRecovery();
    });

    connection.on('error', (error) => {
      if (this.isDestroyed) {
        return;
      }

      console.error('Host connection error:', error);
    });
  }

  private handleGuestMessage(peerId: string, message: PeerMessage) {
    switch (message.type) {
      case 'sync-state':
        return;
      case 'doc-update':
        Y.applyUpdate(this.doc, toUint8Array(message.update), `${REMOTE_ORIGIN_PREFIX}${peerId}`);
        this.broadcastToGuests(message, peerId);
        return;
      case 'awareness-update':
        this.applyRemoteAwareness(peerId, message);
        this.broadcastToGuests(message, peerId);
        return;
      default:
        return;
    }
  }

  private handleHostMessage(message: PeerMessage) {
    switch (message.type) {
      case 'sync-state':
        Y.applyUpdate(this.doc, toUint8Array(message.update), `${REMOTE_ORIGIN_PREFIX}${this.hostPeerId}`);
        return;
      case 'doc-update':
        Y.applyUpdate(this.doc, toUint8Array(message.update), `${REMOTE_ORIGIN_PREFIX}${this.hostPeerId}`);
        return;
      case 'awareness-update':
        this.applyRemoteAwareness(this.hostPeerId, message);
        return;
      default:
        return;
    }
  }

  private handleDocumentUpdate = (update: Uint8Array, origin: unknown) => {
    if (this.isDestroyed || isRemoteOrigin(origin)) {
      return;
    }

    const message: DocumentUpdateMessage = {
      type: 'doc-update',
      update: toNumberArray(update),
    };

    if (this.isHost) {
      this.broadcastToGuests(message);
      return;
    }

    this.sendToHost(message);
  };

  private handleAwarenessUpdate = (
    { added, updated, removed }: AwarenessChanges,
    origin: unknown
  ) => {
    if (this.isDestroyed || !this.awareness || isRemoteOrigin(origin)) {
      return;
    }

    const clientIds = [...added, ...updated, ...removed];
    if (clientIds.length === 0) {
      return;
    }

    const message: AwarenessMessage = {
      type: 'awareness-update',
      clientIds,
      update: toNumberArray(encodeAwarenessUpdate(this.awareness, clientIds)),
    };

    if (this.isHost) {
      this.broadcastToGuests(message);
      return;
    }

    this.sendToHost(message);
  };

  private sendSyncState(connection: DataConnection) {
    const message: SyncStateMessage = {
      type: 'sync-state',
      update: toNumberArray(Y.encodeStateAsUpdate(this.doc)),
    };

    connection.send(message);
  }

  private sendAwarenessSnapshot(connection: DataConnection) {
    if (!this.awareness) {
      return;
    }

    const clientIds = Array.from(this.awareness.getStates().keys());
    if (clientIds.length === 0) {
      return;
    }

    const message: AwarenessMessage = {
      type: 'awareness-update',
      clientIds,
      update: toNumberArray(encodeAwarenessUpdate(this.awareness, clientIds)),
    };

    connection.send(message);
  }

  private sendLocalAwareness(connection: DataConnection) {
    if (!this.awareness) {
      return;
    }

    const clientIds = [this.awareness.clientID];
    const message: AwarenessMessage = {
      type: 'awareness-update',
      clientIds,
      update: toNumberArray(encodeAwarenessUpdate(this.awareness, clientIds)),
    };

    connection.send(message);
  }

  private sendToHost(message: PeerMessage) {
    if (!this.hostConnection?.open) {
      return;
    }

    this.hostConnection.send(message);
  }

  private broadcastToGuests(message: PeerMessage, excludedPeerId?: string) {
    for (const [peerId, connection] of this.guestConnections.entries()) {
      if (peerId === excludedPeerId || !connection.open) {
        continue;
      }

      connection.send(message);
    }
  }

  private applyRemoteAwareness(peerId: string, message: AwarenessMessage) {
    if (!this.awareness) {
      return;
    }

    applyAwarenessUpdate(
      this.awareness,
      toUint8Array(message.update),
      `${REMOTE_ORIGIN_PREFIX}${peerId}`
    );
    this.trackRemoteClientIds(peerId, message.clientIds);
  }

  private trackRemoteClientIds(peerId: string, clientIds: number[]) {
    if (!this.awareness) {
      return;
    }

    const trackedClientIds = this.remoteClientIdsByPeer.get(peerId) ?? new Set<number>();

    for (const clientId of clientIds) {
      if (this.awareness.getStates().has(clientId)) {
        trackedClientIds.add(clientId);
      } else {
        trackedClientIds.delete(clientId);
      }
    }

    if (trackedClientIds.size === 0) {
      this.remoteClientIdsByPeer.delete(peerId);
      return;
    }

    this.remoteClientIdsByPeer.set(peerId, trackedClientIds);
  }

  private removeTrackedAwareness(peerId: string, origin: string) {
    if (!this.awareness) {
      return;
    }

    const trackedClientIds = this.remoteClientIdsByPeer.get(peerId);
    if (trackedClientIds && trackedClientIds.size > 0) {
      removeAwarenessStates(this.awareness, Array.from(trackedClientIds), origin);
    }

    this.remoteClientIdsByPeer.delete(peerId);
  }

  private clearAllRemoteAwareness(origin: string) {
    if (!this.awareness) {
      return;
    }

    const remoteClientIds = Array.from(this.awareness.getStates().keys())
      .filter((clientId) => clientId !== this.awareness?.clientID);

    if (remoteClientIds.length > 0) {
      removeAwarenessStates(this.awareness, remoteClientIds, origin);
    }

    this.remoteClientIdsByPeer.clear();
  }

  private scheduleRecovery() {
    if (this.isDestroyed || this.reconnectTimeout !== null) {
      return;
    }

    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectTimeout = null;
      void this.recoverSession();
    }, RECONNECT_DELAY_MS);
  }

  private async recoverSession() {
    if (this.isDestroyed) {
      return;
    }

    this.peer?.destroy();
    this.peer = null;
    this.hostConnection = null;
    this.guestConnections.clear();
    this.isHost = false;

    try {
      await this.initializePeerTopology();
    } catch (error) {
      console.error('Failed to recover the collaboration session:', error);
      this.scheduleRecovery();
    }
  }

  private clearReconnectTimeout() {
    if (this.reconnectTimeout === null) {
      return;
    }

    window.clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = null;
  }

  private parseMessage(value: unknown) {
    if (!isPeerMessage(value)) {
      return null;
    }

    return value;
  }
}
