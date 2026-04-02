import * as Y from 'yjs';
import type { Awareness } from 'y-protocols/awareness';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';

export interface ConnectedUser {
  clientId: number;
  color: string;
  name: string;
}

interface AwarenessUserState {
  user?: {
    color: string;
    name: string;
  };
}

const DEFAULT_SIGNALING_PORT = '4444';

const generateRandomColor = () => {
  const colors = [
    '#f59e0b', '#ef4444', '#10b981', '#3b82f6',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const getDefaultSignalingUrl = () => {
  if (typeof window === 'undefined') {
    return `ws://localhost:${DEFAULT_SIGNALING_PORT}`;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = window.location.hostname || 'localhost';
  const port = import.meta.env.VITE_SIGNALING_PORT?.trim() || DEFAULT_SIGNALING_PORT;

  return `${protocol}://${host}:${port}`;
};

const getSignalingUrls = () => {
  const configuredUrls = import.meta.env.VITE_SIGNALING_URLS
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return configuredUrls?.length ? configuredUrls : [getDefaultSignalingUrl()];
};

export class CollaborationService {
  doc: Y.Doc;
  provider: WebrtcProvider | null = null;
  persistence: IndexeddbPersistence | null = null;
  awareness: Awareness | null = null;
  roomName: string;
  userName: string;
  color: string;

  constructor(roomName: string, userName: string) {
    this.doc = new Y.Doc();
    this.roomName = `peerscribe-${roomName}`;
    this.userName = userName;
    this.color = generateRandomColor();
  }

  connect() {
    this.provider = new WebrtcProvider(this.roomName, this.doc, {
      signaling: getSignalingUrls(),
    });

    this.awareness = this.provider.awareness;
    this.awareness.setLocalStateField('user', {
      color: this.color,
      name: this.userName,
    });

    this.persistence = new IndexeddbPersistence(this.roomName, this.doc);
  }

  disconnect() {
    this.awareness?.setLocalState(null);

    if (this.provider) {
      this.provider.disconnect();
      this.provider.destroy();
      this.provider = null;
    }

    if (this.persistence) {
      void this.persistence.destroy();
      this.persistence = null;
    }

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
}
