import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, FileDown, FileUp, LogOut, Users } from 'lucide-react';
import { useI18n } from '../../i18n';
import type { ConnectedUser } from '../../services/collaboration';
import { LanguageSelect } from './LanguageSelect';

interface TopBarProps {
  roomName: string;
  connectedUsers: ConnectedUser[];
  onImportClick: () => void;
  onExportWord: () => void;
  onExportPdf: () => void;
  onLeaveDocument: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  roomName,
  connectedUsers,
  onImportClick,
  onExportWord,
  onExportPdf,
  onLeaveDocument,
  fileInputRef,
  onFileChange
}) => {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-panel topbar"
    >
      <div className="topbar__meta">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--primary-dark)' }}>
          {roomName}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(59,130,246,0.1)', padding: '6px 12px', borderRadius: '20px' }}>
          <Users size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--primary)' }}>
            {t.onlineUsers(connectedUsers.length)}
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

      <div className="topbar__actions">
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
          className="topbar__button topbar__button--secondary"
        >
          <FileUp size={16} /> {t.importDocx}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onExportWord}
          className="topbar__button topbar__button--secondary"
        >
          <FileDown size={16} /> {t.exportWord}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onExportPdf}
          className="topbar__button topbar__button--primary"
        >
          <Download size={16} /> {t.savePdf}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLeaveDocument}
          className="topbar__button topbar__button--secondary"
        >
          <LogOut size={16} /> {t.leaveDocument}
        </motion.button>

        <LanguageSelect inline showLabel={false} />
      </div>
    </motion.div>
  );
};
