import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { QuillBinding } from 'y-quill';
import * as Y from 'yjs';

interface WorkspaceProps {
  yDoc: Y.Doc;
  awareness: any;
  onEditorReady: (quill: Quill) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ yDoc, awareness, onEditorReady }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const bindingRef = useRef<any>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Solo inicializar una vez
    if (quillRef.current) return;

    // Inicializar Quill
    const quill = new Quill(editorRef.current, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'code-block'],
          [{ color: [] }, { background: [] }],
          ['clean']
        ],
        // Intercept images directly to compress or block them
        clipboard: {
          matchVisual: false
        }
      },
      placeholder: 'Escribe tu documento colaborativo aquí...'
    });

    quillRef.current = quill;
    onEditorReady(quill);

    // Obtener el tipo de Yjs para el texto
    const yText = yDoc.getText('quill-editor');

    // Vincular Yjs con Quill
    bindingRef.current = new QuillBinding(yText, quill, awareness);

    // Interceptar pegar para limitar imágenes a < 500kb o redimensionar
    quill.root.addEventListener('paste', handlePaste, true);

    return () => {
      quill.root.removeEventListener('paste', handlePaste, true);
      // bindingRef.current?.destroy();
      // Y-Quill binding cleanup not strictly needed for page lifetime, 
      // but good practice if changing rooms
    };
  }, [yDoc, awareness, onEditorReady]);

  const handlePaste = (e: ClipboardEvent) => {
    if (e.clipboardData && e.clipboardData.items) {
      for (const item of e.clipboardData.items) {
        if (item.type.indexOf('image') === 0) {
          const file = item.getAsFile();
          if (file && file.size > 500 * 1024) {
            e.preventDefault();
            e.stopPropagation();
            alert('La imagen excede el límite de 500KB para mantener la velocidad de la red P2P.');
            return;
          }
        }
      }
    }
  };

  return (
    <div style={{ width: '100%', paddingBottom: '40px' }}>
      <div 
        ref={editorRef} 
        id="pdf-export-container" /* ID para referenciar la exportación de html2pdf */
      />
    </div>
  );
};
