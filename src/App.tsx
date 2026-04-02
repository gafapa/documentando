import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { motion } from 'framer-motion';
import { Workspace } from './components/Editor/Workspace';
import { TopBar } from './components/Layout/TopBar';
import { FileProcessingService } from './services/fileProcessing';
import { CollaborationService, type ConnectedUser } from './services/collaboration';
import './index.css';

function App() {
  const [userName, setUserName] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [collaboration, setCollaboration] = useState<CollaborationService | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [isJoining, setIsJoining] = useState(false);

  const editorRef = useRef<Editor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onEditorReady = useCallback((editor: Editor | null) => {
    editorRef.current = editor;
  }, []);

  useEffect(() => {
    if (!collaboration?.awareness) {
      return;
    }

    const awareness = collaboration.awareness;
    const syncConnectedUsers = () => {
      setConnectedUsers(collaboration.getConnectedUsers());
    };

    syncConnectedUsers();
    awareness.on('change', syncConnectedUsers);

    return () => {
      awareness.off('change', syncConnectedUsers);
      collaboration.disconnect();
    };
  }, [collaboration]);

  const handleJoinRoom = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!userName.trim() || !roomInput.trim() || isJoining) {
      return;
    }

    const nextRoom = roomInput.trim().toLowerCase().replace(/\s+/g, '-');
    const nextUser = userName.trim();
    const nextCollaboration = new CollaborationService(nextRoom, nextUser);

    setIsJoining(true);

    try {
      await nextCollaboration.connect();
      setActiveRoom(nextRoom);
      setConnectedUsers(nextCollaboration.getConnectedUsers());
      setCollaboration(nextCollaboration);
    } catch (error) {
      nextCollaboration.disconnect();
      alert('No se pudo conectar a PeerJS Cloud para abrir la sala.');
      console.error(error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleImportDocx = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editorRef.current) {
      try {
        await FileProcessingService.importDocx(file, editorRef.current);
      } catch (error) {
        alert('Error importando el archivo.');
        console.error(error);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportWord = async () => {
    if (!editorRef.current || !activeRoom) {
      return;
    }

    try {
      const html = editorRef.current.getHTML();
      await FileProcessingService.exportDocx(html, `${activeRoom}.docx`);
    } catch (error) {
      alert('Error exportando el archivo.');
      console.error(error);
    }
  };

  const handleExportPdf = async () => {
    if (!activeRoom) {
      return;
    }

    const element = document.getElementById('pdf-export-container');
    if (!element) {
      return;
    }

    const editorContent = element.querySelector('.tiptap-document') as HTMLElement | null;

    try {
      if (editorContent) {
        await FileProcessingService.exportPdf(editorContent, `${activeRoom}.pdf`);
      } else {
        await FileProcessingService.exportPdf(element, `${activeRoom}.pdf`);
      }
    } catch (error) {
      alert('Error exportando el archivo.');
      console.error(error);
    }
  };

  if (!activeRoom) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '24px',
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-panel"
          style={{ padding: '40px', width: '100%', maxWidth: '400px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ color: 'var(--primary-dark)', fontSize: '2rem', marginBottom: '8px' }}>
              PeerScribe
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Editor colaborativo local-first
            </p>
          </div>

          <form onSubmit={(event) => void handleJoinRoom(event)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                Tu nombre
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Ana Garcia"
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  outline: 'none',
                  fontSize: '1rem',
                  background: 'rgba(255,255,255,0.8)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                ID de la clase o sala
              </label>
              <input
                type="text"
                required
                placeholder="Ej. historia-aula2"
                value={roomInput}
                onChange={(event) => setRoomInput(event.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  outline: 'none',
                  fontSize: '1rem',
                  background: 'rgba(255,255,255,0.8)',
                }}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isJoining}
              className="glass-panel"
              style={{
                background: 'var(--primary)',
                color: 'white',
                fontWeight: 600,
                padding: '14px',
                marginTop: '12px',
                fontSize: '1.1rem',
                border: 'none',
                boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
                opacity: isJoining ? 0.72 : 1,
              }}
            >
              {isJoining ? 'Conectando...' : 'Unirse al pizarron'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar
        roomName={activeRoom}
        connectedUsers={connectedUsers}
        onImportClick={handleImportDocx}
        onExportWord={handleExportWord}
        onExportPdf={handleExportPdf}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ flex: 1, padding: '0 16px', display: 'flex', justifyContent: 'center' }}
      >
        {collaboration?.provider && (
          <Workspace
            key={collaboration.roomName}
            yDoc={collaboration.doc}
            provider={collaboration.provider}
            user={{
              color: collaboration.color,
              name: collaboration.userName,
            }}
            onEditorReady={onEditorReady}
          />
        )}
      </motion.div>
    </div>
  );
}

export default App;
