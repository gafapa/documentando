import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import type { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';
import { TiptapToolbar } from './TiptapToolbar';

interface WorkspaceProps {
  yDoc: Y.Doc;
  provider: WebrtcProvider;
  user: {
    color: string;
    name: string;
  };
  onEditorReady: (editor: Editor | null) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ yDoc, provider, user, onEditorReady }) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        undoRedo: false,
      }),
      Collaboration.configure({
        fragment: yDoc.getXmlFragment('content'),
      }),
      CollaborationCaret.configure({
        provider,
        user,
      }),
      Placeholder.configure({
        placeholder: 'Start writing your collaborative document...',
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    editorProps: {
      attributes: {
        class: 'tiptap-document',
      },
      handlePaste(_view, event) {
        const items = event.clipboardData?.items;
        if (!items) {
          return false;
        }

        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file && file.size > 500 * 1024) {
              event.preventDefault();
              alert('Images above 500KB are blocked to keep the P2P session responsive.');
              return true;
            }
          }
        }

        return false;
      },
    },
  }, [provider, user.color, user.name, yDoc]);

  useEffect(() => {
    onEditorReady(editor);

    return () => {
      onEditorReady(null);
    };
  }, [editor, onEditorReady]);

  if (!editor) {
    return null;
  }

  return (
    <section className="editor-shell">
      <TiptapToolbar editor={editor} />
      <div className="editor-frame glass-panel">
        <div className="editor-document" id="pdf-export-container">
          <EditorContent editor={editor} />
        </div>
      </div>
    </section>
  );
};
