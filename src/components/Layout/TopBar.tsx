import React from 'react';
import { Users, FileDown, FileUp, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ConnectedUser } from '../../services/collaboration';

interface TopBarProps {
  roomName: string;
  connectedUsers: ConnectedUser[];
  onImportClick: () => void;
  onExportWord: () => void;
  onExportPdf: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  roomName,
  connectedUsers,
  onImportClick,
  onExportWord,
  onExportPdf,
  fileInputRef,
  onFileChange
}) => {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-panel"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        margin: '16px',
        position: 'sticky',
        top: '16px',
        zIndex: 100
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--primary-dark)' }}>
          {roomName}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(59,130,246,0.1)', padding: '6px 12px', borderRadius: '20px' }}>
          <Users size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--primary)' }}>
            {connectedUsers.length} {connectedUsers.length === 1 ? 'estudiante' : 'estudiantes'} en línea
          </span>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <AnimatePresence>
            {connectedUsers.map((user, index) => (
              <motion.div
                key={user.clientId}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                title={user.name}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: user.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '2px solid white',
                  marginLeft: index > 0 ? '-10px' : '0'
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <input
          type="file"
          accept=".docx"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={onFileChange}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onImportClick}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '8px',
            background: 'white', border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)', fontWeight: 500
          }}
        >
          <FileUp size={16} /> Importar Docx
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onExportWord}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '8px',
            background: 'white', border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)', fontWeight: 500
          }}
        >
          <FileDown size={16} /> Exportar Word
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onExportPdf}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '8px',
            background: 'var(--primary)', border: 'none',
            color: 'white', fontWeight: 500
          }}
        >
          <Download size={16} /> Guardar PDF
        </motion.button>
      </div>
    </motion.div>
  );
};
