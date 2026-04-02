import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
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
      Link.configure({
        openOnClick: false,
        protocols: ['http', 'https', 'mailto'],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
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
