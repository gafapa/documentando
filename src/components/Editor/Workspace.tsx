import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import * as Y from 'yjs';
import { useI18n } from '../../i18n';
import type { CollaborationProvider } from '../../services/collaboration';
import { canEmbedImageFile, insertImageFromFile } from './imageUpload';
import { TiptapToolbar } from './TiptapToolbar';

interface WorkspaceProps {
  yDoc: Y.Doc;
  provider: CollaborationProvider;
  user: {
    color: string;
    name: string;
  };
  onEditorReady: (editor: Editor | null) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ yDoc, provider, user, onEditorReady }) => {
  const { t } = useI18n();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: false,
        undoRedo: false,
      }),
      Collaboration.configure({
        fragment: yDoc.getXmlFragment('content'),
      }),
      CollaborationCaret.configure({
        provider,
        user,
        render: (caretUser) => {
          const cursor = document.createElement('span');
          const label = document.createElement('span');
          const marker = document.createElement('span');

          cursor.classList.add('collaboration-cursor');
          cursor.style.setProperty('--collaboration-user-color', caretUser.color ?? 'var(--primary-dark)');

          marker.classList.add('collaboration-cursor__marker');
          label.classList.add('collaboration-cursor__label');
          label.textContent = caretUser.name || t.guestUser;

          cursor.append(marker, label);
          return cursor;
        },
        selectionRender: (selectionUser) => ({
          nodeName: 'span',
          class: 'collaboration-selection',
          style: `--collaboration-user-color: ${selectionUser.color ?? 'var(--primary-dark)'}`,
          'data-user-name': selectionUser.name ?? t.guestUser,
        }),
      }),
      Placeholder.configure({
        placeholder: t.editorPlaceholder,
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
      Image.configure({
        allowBase64: true,
        resize: {
          enabled: true,
          minWidth: 160,
          minHeight: 120,
          alwaysPreserveAspectRatio: true,
        },
        HTMLAttributes: {
          class: 'editor-embedded-image',
        },
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
          if (!item.type.startsWith('image/')) {
            continue;
          }

          const file = item.getAsFile();
          if (!file) {
            continue;
          }

          event.preventDefault();

          if (!canEmbedImageFile(file)) {
            alert(t.imageTooLarge);
            return true;
          }

          if (!editor) {
            return true;
          }

          void insertImageFromFile(editor, file, {
            invalidType: t.imageInvalidType,
            tooLarge: t.imageTooLarge,
            readFailed: t.imageReadFailed,
            convertFailed: t.imageConvertFailed,
          }, t.imageDefaultAlt).catch((error) => {
            alert(error instanceof Error ? error.message : t.imagePasteFailed);
          });

          return true;
        }

        return false;
      },
      handleDrop(_view, event) {
        const files = Array.from(event.dataTransfer?.files ?? []);
        const imageFile = files.find((file) => file.type.startsWith('image/'));

        if (!imageFile) {
          return false;
        }

        event.preventDefault();

        if (!canEmbedImageFile(imageFile)) {
          alert(t.imageTooLarge);
          return true;
        }

        if (!editor) {
          return true;
        }

        void insertImageFromFile(editor, imageFile, {
          invalidType: t.imageInvalidType,
          tooLarge: t.imageTooLarge,
          readFailed: t.imageReadFailed,
          convertFailed: t.imageConvertFailed,
        }, t.imageDefaultAlt).catch((error) => {
          alert(error instanceof Error ? error.message : t.imageInsertFailed);
        });

        return true;
      },
    },
  }, [provider, t.editorPlaceholder, t.guestUser, t.imageConvertFailed, t.imageDefaultAlt, t.imageInsertFailed, t.imageInvalidType, t.imagePasteFailed, t.imageReadFailed, t.imageTooLarge, user.color, user.name, yDoc]);

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
