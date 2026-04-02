import React from 'react';
import { useEditorState } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Code2,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Strikethrough,
  Underline as UnderlineIcon
} from 'lucide-react';

interface TiptapToolbarProps {
  editor: Editor;
}

interface ToolbarButtonProps {
  active?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const textColors = ['#111827', '#2563eb', '#0f766e', '#b45309', '#b91c1c', '#7c3aed'];
const highlightColors = ['#fef08a', '#bfdbfe', '#bbf7d0', '#fecaca'];

function ToolbarButton({ active = false, disabled = false, icon, label, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={`editor-tool${active ? ' is-active' : ''}`}
      disabled={disabled}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

export function TiptapToolbar({ editor }: TiptapToolbarProps) {
  const editorState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      canToggleBold: currentEditor.can().chain().focus().toggleBold().run(),
      canToggleBulletList: currentEditor.can().chain().focus().toggleBulletList().run(),
      canToggleOrderedList: currentEditor.can().chain().focus().toggleOrderedList().run(),
      canToggleBlockquote: currentEditor.can().chain().focus().toggleBlockquote().run(),
      canToggleCodeBlock: currentEditor.can().chain().focus().toggleCodeBlock().run(),
      isBlockquote: currentEditor.isActive('blockquote'),
      isBold: currentEditor.isActive('bold'),
      isBulletList: currentEditor.isActive('bulletList'),
      isCodeBlock: currentEditor.isActive('codeBlock'),
      isHeading1: currentEditor.isActive('heading', { level: 1 }),
      isHeading2: currentEditor.isActive('heading', { level: 2 }),
      isHeading3: currentEditor.isActive('heading', { level: 3 }),
      isItalic: currentEditor.isActive('italic'),
      isOrderedList: currentEditor.isActive('orderedList'),
      isParagraph: currentEditor.isActive('paragraph'),
      isStrike: currentEditor.isActive('strike'),
      isUnderline: currentEditor.isActive('underline'),
    }),
  });

  const headingValue = editorState.isHeading1
    ? 'h1'
    : editorState.isHeading2
      ? 'h2'
      : editorState.isHeading3
        ? 'h3'
        : 'paragraph';

  return (
    <div className="editor-toolbar glass-panel">
      <div className="editor-toolbar__group">
        <select
          aria-label="Text style"
          className="editor-select"
          value={headingValue}
          onChange={(event) => {
            const nextValue = event.target.value;
            const chain = editor.chain().focus();

            if (nextValue === 'paragraph') {
              chain.setParagraph().run();
              return;
            }

            chain.toggleHeading({ level: Number(nextValue.slice(1)) as 1 | 2 | 3 }).run();
          }}
        >
          <option value="paragraph">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
        <ToolbarButton
          active={editorState.isParagraph}
          icon={<Pilcrow size={16} />}
          label="Paragraph"
          onClick={() => editor.chain().focus().setParagraph().run()}
        />
        <ToolbarButton
          active={editorState.isHeading1}
          icon={<Heading1 size={16} />}
          label="Heading 1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <ToolbarButton
          active={editorState.isHeading2}
          icon={<Heading2 size={16} />}
          label="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          active={editorState.isHeading3}
          icon={<Heading3 size={16} />}
          label="Heading 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
      </div>

      <div className="editor-toolbar__group">
        <ToolbarButton
          active={editorState.isBold}
          disabled={!editorState.canToggleBold}
          icon={<Bold size={16} />}
          label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          active={editorState.isItalic}
          icon={<Italic size={16} />}
          label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          active={editorState.isUnderline}
          icon={<UnderlineIcon size={16} />}
          label="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          active={editorState.isStrike}
          icon={<Strikethrough size={16} />}
          label="Strike"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
      </div>

      <div className="editor-toolbar__group">
        <ToolbarButton
          active={editorState.isBulletList}
          disabled={!editorState.canToggleBulletList}
          icon={<List size={16} />}
          label="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          active={editorState.isOrderedList}
          disabled={!editorState.canToggleOrderedList}
          icon={<ListOrdered size={16} />}
          label="Ordered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          active={editorState.isBlockquote}
          disabled={!editorState.canToggleBlockquote}
          icon={<Quote size={16} />}
          label="Blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          active={editorState.isCodeBlock}
          disabled={!editorState.canToggleCodeBlock}
          icon={<Code2 size={16} />}
          label="Code block"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
      </div>

      <div className="editor-toolbar__group">
        <span className="editor-toolbar__label">Text</span>
        <div className="editor-swatches">
          {textColors.map((color) => (
            <button
              key={color}
              type="button"
              className="editor-swatch"
              aria-label={`Text color ${color}`}
              title={`Text color ${color}`}
              style={{ backgroundColor: color }}
              onClick={() => editor.chain().focus().setColor(color).run()}
            />
          ))}
        </div>
      </div>

      <div className="editor-toolbar__group">
        <span className="editor-toolbar__label">Highlight</span>
        <div className="editor-swatches">
          {highlightColors.map((color) => (
            <button
              key={color}
              type="button"
              className="editor-swatch editor-swatch--highlight"
              aria-label={`Highlight color ${color}`}
              title={`Highlight color ${color}`}
              style={{ backgroundColor: color }}
              onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
            />
          ))}
        </div>
        <ToolbarButton
          icon={<Highlighter size={16} />}
          label="Clear highlight"
          onClick={() => editor.chain().focus().unsetHighlight().run()}
        />
      </div>

      <div className="editor-toolbar__group">
        <ToolbarButton
          icon={<Eraser size={16} />}
          label="Clear formatting"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        />
      </div>
    </div>
  );
}
