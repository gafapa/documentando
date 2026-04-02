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
import { useI18n } from '../../i18n';
import { insertImageFromFile } from './imageUpload';

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
  const { t } = useI18n();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editorState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      canInsertTable: currentEditor.can().chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
      canSetLink: currentEditor.can().chain().focus().setLink({ href: t.linkDefault }).run(),
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
    const nextHref = window.prompt(t.linkPrompt, editorState.linkHref ?? t.linkDefault);
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
    const nextSource = window.prompt(t.imageUrlPrompt, t.imageUrlDefault);
    if (nextSource === null) {
      return;
    }

    const normalizedSource = nextSource.trim();
    if (!normalizedSource) {
      return;
    }

    editor.chain().focus().setImage({ src: normalizedSource, alt: t.imageDefaultAlt }).run();
  };

  const handleImageInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      try {
        await insertImageFromFile(editor, file, {
          invalidType: t.imageInvalidType,
          tooLarge: t.imageTooLarge,
          readFailed: t.imageReadFailed,
          convertFailed: t.imageConvertFailed,
        }, t.imageDefaultAlt);
      } catch (error) {
        alert(error instanceof Error ? error.message : t.imageInsertFailed);
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
          aria-label={t.toolbarTextStyle}
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
          <option value="paragraph">{t.toolbarParagraph}</option>
          <option value="h1">{t.toolbarHeading1}</option>
          <option value="h2">{t.toolbarHeading2}</option>
          <option value="h3">{t.toolbarHeading3}</option>
        </select>
        <ToolbarButton
          active={editorState.isParagraph}
          icon={<Pilcrow size={16} />}
          label={t.toolbarParagraph}
          onClick={() => editor.chain().focus().setParagraph().run()}
        />
        <ToolbarButton
          active={editorState.isHeading1}
          icon={<Heading1 size={16} />}
          label={t.toolbarHeading1}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <ToolbarButton
          active={editorState.isHeading2}
          icon={<Heading2 size={16} />}
          label={t.toolbarHeading2}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          active={editorState.isHeading3}
          icon={<Heading3 size={16} />}
          label={t.toolbarHeading3}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
      </div>

      <div className="editor-toolbar__group">
        <ToolbarButton
          active={editorState.isBold}
          disabled={!editorState.canToggleBold}
          icon={<Bold size={16} />}
          label={t.toolbarBold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          active={editorState.isItalic}
          icon={<Italic size={16} />}
          label={t.toolbarItalic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          active={editorState.isUnderline}
          icon={<UnderlineIcon size={16} />}
          label={t.toolbarUnderline}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          active={editorState.isStrike}
          icon={<Strikethrough size={16} />}
          label={t.toolbarStrike}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
        <ToolbarButton
          active={editorState.isCode}
          disabled={!editorState.canToggleCode}
          icon={<Code size={16} />}
          label={t.toolbarInlineCode}
          onClick={() => editor.chain().focus().toggleCode().run()}
        />
      </div>

      <div className="editor-toolbar__group">
        <ToolbarButton
          active={editorState.isBulletList}
          disabled={!editorState.canToggleBulletList}
          icon={<List size={16} />}
          label={t.toolbarBulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          active={editorState.isOrderedList}
          disabled={!editorState.canToggleOrderedList}
          icon={<ListOrdered size={16} />}
          label={t.toolbarOrderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          active={editorState.isTaskList}
          disabled={!editorState.canToggleTaskList}
          icon={<CheckSquare size={16} />}
          label={t.toolbarTaskList}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        />
        <ToolbarButton
          active={editorState.isBlockquote}
          disabled={!editorState.canToggleBlockquote}
          icon={<Quote size={16} />}
          label={t.toolbarBlockquote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          active={editorState.isCodeBlock}
          disabled={!editorState.canToggleCodeBlock}
          icon={<Code2 size={16} />}
          label={t.toolbarCodeBlock}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
        <ToolbarButton
          icon={<Minus size={16} />}
          label={t.toolbarHorizontalRule}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />
      </div>

      <div className="editor-toolbar__group">
        <ToolbarButton
          active={editorState.isAlignLeft}
          icon={<AlignLeft size={16} />}
          label={t.toolbarAlignLeft}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        />
        <ToolbarButton
          active={editorState.isAlignCenter}
          icon={<AlignCenter size={16} />}
          label={t.toolbarAlignCenter}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        />
        <ToolbarButton
          active={editorState.isAlignRight}
          icon={<AlignRight size={16} />}
          label={t.toolbarAlignRight}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        />
        <ToolbarButton
          active={editorState.isAlignJustify}
          icon={<AlignJustify size={16} />}
          label={t.toolbarJustify}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        />
      </div>

      <div className="editor-toolbar__group">
        <ToolbarButton
          active={editorState.isLink}
          disabled={!editorState.canSetLink}
          icon={<Link2 size={16} />}
          label={t.toolbarSetLink}
          onClick={handleSetLink}
        />
        <ToolbarButton
          icon={<Unlink size={16} />}
          label={t.toolbarRemoveLink}
          onClick={() => editor.chain().focus().unsetLink().run()}
        />
      </div>

      <div className="editor-toolbar__group">
        <ToolbarButton
          active={editorState.hasImage}
          icon={<ImageIcon size={16} />}
          label={t.toolbarUploadImage}
          onClick={() => imageInputRef.current?.click()}
        />
        <ToolbarButton
          icon={<Link2 size={16} />}
          label={t.toolbarInsertImageUrl}
          onClick={handleInsertImageUrl}
        />
      </div>

      <div className="editor-toolbar__group">
        <ToolbarButton
          active={editorState.hasTable}
          disabled={!editorState.canInsertTable}
          icon={<Table2 size={16} />}
          label={t.toolbarInsertTable}
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        />
        <ToolbarButton
          disabled={!editorState.hasTable}
          icon={<Rows3 size={16} />}
          label={t.toolbarAddRow}
          onClick={() => editor.chain().focus().addRowAfter().run()}
        />
        <ToolbarButton
          disabled={!editorState.hasTable}
          icon={<Columns3 size={16} />}
          label={t.toolbarAddColumn}
          onClick={() => editor.chain().focus().addColumnAfter().run()}
        />
        <ToolbarButton
          disabled={!editorState.hasTable}
          icon={<Trash2 size={16} />}
          label={t.toolbarDeleteTable}
          onClick={() => editor.chain().focus().deleteTable().run()}
        />
      </div>

      <div className="editor-toolbar__group">
        <span className="editor-toolbar__label">{t.toolbarText}</span>
        <div className="editor-swatches">
          {textColors.map((color) => (
            <button
              key={color}
              type="button"
              className="editor-swatch"
              aria-label={`${t.toolbarTextColorLabel} ${color}`}
              title={`${t.toolbarTextColorLabel} ${color}`}
              style={{ backgroundColor: color }}
              onClick={() => editor.chain().focus().setColor(color).run()}
            />
          ))}
        </div>
        <ToolbarButton
          icon={<SquareSlash size={16} />}
          label={t.toolbarClearTextColor}
          onClick={() => editor.chain().focus().unsetColor().run()}
        />
      </div>

      <div className="editor-toolbar__group">
        <span className="editor-toolbar__label">{t.toolbarHighlight}</span>
        <div className="editor-swatches">
          {highlightColors.map((color) => (
            <button
              key={color}
              type="button"
              className="editor-swatch editor-swatch--highlight"
              aria-label={`${t.toolbarHighlightColorLabel} ${color}`}
              title={`${t.toolbarHighlightColorLabel} ${color}`}
              style={{ backgroundColor: color }}
              onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
            />
          ))}
        </div>
        <ToolbarButton
          icon={<Highlighter size={16} />}
          label={t.toolbarClearHighlight}
          onClick={() => editor.chain().focus().unsetHighlight().run()}
        />
      </div>

      <div className="editor-toolbar__group">
        <ToolbarButton
          icon={<Eraser size={16} />}
          label={t.toolbarClearFormatting}
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        />
      </div>
    </div>
  );
}
