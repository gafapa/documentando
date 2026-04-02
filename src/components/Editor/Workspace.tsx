import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { QuillBinding } from 'y-quill';
import type { Awareness } from 'y-protocols/awareness';
import * as Y from 'yjs';

interface WorkspaceProps {
  yDoc: Y.Doc;
  awareness: Awareness;
  onEditorReady: (quill: Quill) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ yDoc, awareness, onEditorReady }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const bindingRef = useRef<QuillBinding | null>(null);

  function handlePaste(e: ClipboardEvent) {
    if (e.clipboardData && e.clipboardData.items) {
      for (const item of e.clipboardData.items) {
        if (item.type.startsWith('image/')) {
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
  }

  useEffect(() => {
    if (!editorRef.current || quillRef.current) {
      return;
    }

    const editorElement = editorRef.current;
    editorElement.innerHTML = '';

    const quill = new Quill(editorElement, {
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
        clipboard: {
          matchVisual: false
        }
      },
      placeholder: 'Escribe tu documento colaborativo aquí...'
    });

    quillRef.current = quill;
    onEditorReady(quill);

    const yText = yDoc.getText('quill-editor');
    bindingRef.current = new QuillBinding(yText, quill, awareness);
    quill.root.addEventListener('paste', handlePaste, true);

    return () => {
      quill.root.removeEventListener('paste', handlePaste, true);
      bindingRef.current?.destroy();
      bindingRef.current = null;
      quillRef.current = null;
      editorElement.innerHTML = '';
    };
  }, [awareness, onEditorReady, yDoc]);

  return (
    <div className="editor-shell">
      <div ref={editorRef} id="pdf-export-container" />
    </div>
  );
};
