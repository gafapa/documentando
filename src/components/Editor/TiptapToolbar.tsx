import React, { useRef } from 'react';
import { useEditorState } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CheckSquare,
  Code,
  Code2,
  Columns3,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Rows3,
  SquareSlash,
  Strikethrough,
  Table2,
  Trash2,
  Underline as UnderlineIcon,
  Unlink
} from 'lucide-react';
import { getImageSizeErrorMessage, insertImageFromFile } from './imageUpload';

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
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editorState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      canInsertTable: currentEditor.can().chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
      canSetLink: currentEditor.can().chain().focus().setLink({ href: 'https://example.com' }).run(),
      canToggleBlockquote: currentEditor.can().chain().focus().toggleBlockquote().run(),
      canToggleBold: currentEditor.can().chain().focus().toggleBold().run(),
      canToggleBulletList: currentEditor.can().chain().focus().toggleBulletList().run(),
      canToggleCode: currentEditor.can().chain().focus().toggleCode().run(),
      canToggleCodeBlock: currentEditor.can().chain().focus().toggleCodeBlock().run(),
      canToggleOrderedList: currentEditor.can().chain().focus().toggleOrderedList().run(),
      canToggleTaskList: currentEditor.can().chain().focus().toggleTaskList().run(),
      hasTable: currentEditor.isActive('table'),
      hasImage: currentEditor.isActive('image'),
      isAlignCenter: currentEditor.isActive({ textAlign: 'center' }),
      isAlignJustify: currentEditor.isActive({ textAlign: 'justify' }),
      isAlignLeft: currentEditor.isActive({ textAlign: 'left' }),
      isAlignRight: currentEditor.isActive({ textAlign: 'right' }),
      isBlockquote: currentEditor.isActive('blockquote'),
      isBold: currentEditor.isActive('bold'),
      isBulletList: currentEditor.isActive('bulletList'),
      isCode: currentEditor.isActive('code'),
      isCodeBlock: currentEditor.isActive('codeBlock'),
      isHeading1: currentEditor.isActive('heading', { level: 1 }),
      isHeading2: currentEditor.isActive('heading', { level: 2 }),
      isHeading3: currentEditor.isActive('heading', { level: 3 }),
      isItalic: currentEditor.isActive('italic'),
      isLink: currentEditor.isActive('link'),
      isOrderedList: currentEditor.isActive('orderedList'),
      isParagraph: currentEditor.isActive('paragraph'),
      isStrike: currentEditor.isActive('strike'),
      isTaskList: currentEditor.isActive('taskList'),
      isUnderline: currentEditor.isActive('underline'),
      linkHref: currentEditor.getAttributes('link').href as string | undefined,
    }),
  });

  const headingValue = editorState.isHeading1
    ? 'h1'
    : editorState.isHeading2
      ? 'h2'
      : editorState.isHeading3
        ? 'h3'
        : 'paragraph';

  const handleSetLink = () => {
    const nextHref = window.prompt('Enter a URL', editorState.linkHref ?? 'https://');
    if (nextHref === null) {
      return;
    }

    const normalizedHref = nextHref.trim();
    if (!normalizedHref) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: normalizedHref }).run();
  };

  const handleInsertImageUrl = () => {
    const nextSource = window.prompt('Enter an image URL', 'https://');
    if (nextSource === null) {
      return;
    }

    const normalizedSource = nextSource.trim();
    if (!normalizedSource) {
      return;
    }

    editor.chain().focus().setImage({ src: normalizedSource, alt: 'Inserted image' }).run();
  };

  const handleImageInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      try {
        await insertImageFromFile(editor, file);
      } catch (error) {
        alert(error instanceof Error ? error.message : getImageSizeErrorMessage());
      }
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  return (
    <div className="editor-toolbar glass-panel">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(event) => void handleImageInputChange(event)}
      />

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
        <ToolbarButton
          active={editorState.isCode}
          disabled={!editorState.canToggleCode}
          icon={<Code size={16} />}
          label="Inline code"
          onClick={() => editor.chain().focus().toggleCode().run()}
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
          active={editorState.isTaskList}
          disabled={!editorState.canToggleTaskList}
          icon={<CheckSquare size={16} />}
          label="Task list"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
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
        <ToolbarButton
          icon={<Minus size={16} />}
          label="Horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />
      </div>

      <div className="editor-toolbar__group">
        <ToolbarButton
          active={editorState.isAlignLeft}
          icon={<AlignLeft size={16} />}
          label="Align left"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        />
        <ToolbarButton
          active={editorState.isAlignCenter}
          icon={<AlignCenter size={16} />}
          label="Align center"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        />
        <ToolbarButton
          active={editorState.isAlignRight}
          icon={<AlignRight size={16} />}
          label="Align right"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        />
        <ToolbarButton
          active={editorState.isAlignJustify}
          icon={<AlignJustify size={16} />}
          label="Justify"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        />
      </div>

      <div className="editor-toolbar__group">
        <ToolbarButton
          active={editorState.isLink}
          disabled={!editorState.canSetLink}
          icon={<Link2 size={16} />}
          label="Set link"
          onClick={handleSetLink}
        />
        <ToolbarButton
          icon={<Unlink size={16} />}
          label="Remove link"
          onClick={() => editor.chain().focus().unsetLink().run()}
        />
      </div>

      <div className="editor-toolbar__group">
        <ToolbarButton
          active={editorState.hasImage}
          icon={<ImageIcon size={16} />}
          label="Upload image"
          onClick={() => imageInputRef.current?.click()}
        />
        <ToolbarButton
          icon={<Link2 size={16} />}
          label="Insert image from URL"
          onClick={handleInsertImageUrl}
        />
      </div>

      <div className="editor-toolbar__group">
        <ToolbarButton
          active={editorState.hasTable}
          disabled={!editorState.canInsertTable}
          icon={<Table2 size={16} />}
          label="Insert table"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        />
        <ToolbarButton
          disabled={!editorState.hasTable}
          icon={<Rows3 size={16} />}
          label="Add row"
          onClick={() => editor.chain().focus().addRowAfter().run()}
        />
        <ToolbarButton
          disabled={!editorState.hasTable}
          icon={<Columns3 size={16} />}
          label="Add column"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
        />
        <ToolbarButton
          disabled={!editorState.hasTable}
          icon={<Trash2 size={16} />}
          label="Delete table"
          onClick={() => editor.chain().focus().deleteTable().run()}
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
        <ToolbarButton
          icon={<SquareSlash size={16} />}
          label="Clear text color"
          onClick={() => editor.chain().focus().unsetColor().run()}
        />
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
