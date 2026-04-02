import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';

// Generador de color aleatorio para el usuario
const generateRandomColor = () => {
  const colors = [
    '#f59e0b', '#ef4444', '#10b981', '#3b82f6', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export class CollaborationService {
  doc: Y.Doc;
  provider: any = null;
  persistence: any = null;
  awareness: any = null;
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
    // 1. Conexión P2P (WebRTC)
    // Usa los servidores de STUN/TURN públicos de y-webrtc por defecto
    this.provider = new WebrtcProvider(this.roomName, this.doc);
    
    // 2. Conectar al Awareness (Presencia visual)
    this.awareness = this.provider.awareness;
    
    // Actualizar estado local
    this.awareness.setLocalStateField('user', {
      name: this.userName,
      color: this.color
    });

    // 3. Persistencia local (IndexedDB)
    // Guardamos el documento temporalmente de forma local
    this.persistence = new IndexeddbPersistence(this.roomName, this.doc);
  }

  disconnect() {
    if (this.provider) {
      this.provider.disconnect();
      this.provider.destroy();
    }
  }

  getDoc() {
    return this.doc;
  }
}
