"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Code2, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Minus, Quote, Redo2, Strikethrough, Table2, Underline, Undo2, Film as YoutubeIcon, Code, Rows3, Columns3, Trash,
} from "lucide-react";
import { MediaLibraryModal } from "@/components/admin/media-picker";
import { cn } from "@/lib/utils";

/** TipTap editor: headings, lists, links, images (from media library), tables, YouTube embeds, code. */
export function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const [media, setMedia] = useState(false);
  const [source, setSource] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } } }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
      TableKit.configure({ table: { resizable: false } }),
      Youtube.configure({ nocookie: true, width: 640, height: 360 }),
      Placeholder.configure({ placeholder: "Start writing… Use H2 for main sections and H3 for sub-sections." }),
    ],
    content: value,
    editorProps: { attributes: { class: "prose-x min-h-[360px] px-5 py-4 outline-none" } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // keep in sync if the value is replaced externally (e.g. after save)
  useEffect(() => {
    if (editor && !editor.isFocused && value !== editor.getHTML()) editor.commands.setContent(value || "", { emitUpdate: false });
  }, [value, editor]);

  if (!editor) return <div className="h-[420px] animate-pulse rounded-xl border border-line-strong bg-surface-2" />;

  return (
    <div className="overflow-hidden rounded-xl border border-line-strong bg-bg focus-within:border-brand">
      <Toolbar editor={editor} onImage={() => setMedia(true)} source={source} onSource={() => setSource((s) => !s)} />
      {source ? (
        <textarea value={value} onChange={(e) => { onChange(e.target.value); editor.commands.setContent(e.target.value, { emitUpdate: false }); }} className="min-h-[360px] w-full bg-bg px-5 py-4 font-mono text-xs outline-none" aria-label="HTML source" />
      ) : (
        <div className="max-h-[70vh] overflow-y-auto">
          <EditorContent editor={editor} />
        </div>
      )}
      {media && (
        <MediaLibraryModal
          onClose={() => setMedia(false)}
          onSelect={(items) => {
            const m = items[0];
            if (m) editor.chain().focus().setImage({ src: m.url, alt: m.alt ?? m.name }).run();
          }}
        />
      )}
    </div>
  );
}

function Toolbar({ editor, onImage, source, onSource }: { editor: Editor; onImage: () => void; source: boolean; onSource: () => void }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      ul: e.isActive("bulletList"),
      ol: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      code: e.isActive("codeBlock"),
      link: e.isActive("link"),
      table: e.isActive("table"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const sep = <span className="mx-1 h-5 w-px bg-line-strong" />;
  const c = () => editor.chain().focus();

  function setLink() {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave empty to remove)", prev ?? "https://");
    if (url === null) return;
    if (!url) c().extendMarkRange("link").unsetLink().run();
    else c().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-line bg-surface px-2 py-1.5">
      <ToolButton blocked={source} label="Heading 2" on={s.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}><Heading2 /></ToolButton>
      <ToolButton blocked={source} label="Heading 3" on={s.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}><Heading3 /></ToolButton>
      {sep}
      <ToolButton blocked={source} label="Bold" on={s.bold} onClick={() => c().toggleBold().run()}><Bold /></ToolButton>
      <ToolButton blocked={source} label="Italic" on={s.italic} onClick={() => c().toggleItalic().run()}><Italic /></ToolButton>
      <ToolButton blocked={source} label="Underline" on={s.underline} onClick={() => c().toggleUnderline().run()}><Underline /></ToolButton>
      <ToolButton blocked={source} label="Strikethrough" on={s.strike} onClick={() => c().toggleStrike().run()}><Strikethrough /></ToolButton>
      <ToolButton blocked={source} label="Link" on={s.link} onClick={setLink}><Link2 /></ToolButton>
      {sep}
      <ToolButton blocked={source} label="Bullet list" on={s.ul} onClick={() => c().toggleBulletList().run()}><List /></ToolButton>
      <ToolButton blocked={source} label="Numbered list" on={s.ol} onClick={() => c().toggleOrderedList().run()}><ListOrdered /></ToolButton>
      <ToolButton blocked={source} label="Quote" on={s.quote} onClick={() => c().toggleBlockquote().run()}><Quote /></ToolButton>
      <ToolButton blocked={source} label="Code block" on={s.code} onClick={() => c().toggleCodeBlock().run()}><Code2 /></ToolButton>
      <ToolButton blocked={source} label="Divider" onClick={() => c().setHorizontalRule().run()}><Minus /></ToolButton>
      {sep}
      <ToolButton blocked={source} label="Insert image" onClick={onImage}><ImagePlus /></ToolButton>
      <ToolButton
        blocked={source}
        label="Embed YouTube video"
        onClick={() => {
          const url = window.prompt("YouTube URL");
          if (url) editor.commands.setYoutubeVideo({ src: url });
        }}
      >
        <YoutubeIcon />
      </ToolButton>
      <ToolButton blocked={source} label="Insert table" onClick={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 /></ToolButton>
      {s.table && (
        <>
          <ToolButton blocked={source} label="Add row" onClick={() => c().addRowAfter().run()}><Rows3 /></ToolButton>
          <ToolButton blocked={source} label="Add column" onClick={() => c().addColumnAfter().run()}><Columns3 /></ToolButton>
          <ToolButton blocked={source} label="Delete table" onClick={() => c().deleteTable().run()}><Trash /></ToolButton>
        </>
      )}
      {sep}
      <ToolButton blocked={source} label="Undo" disabled={!s.canUndo} onClick={() => c().undo().run()}><Undo2 /></ToolButton>
      <ToolButton blocked={source} label="Redo" disabled={!s.canRedo} onClick={() => c().redo().run()}><Redo2 /></ToolButton>
      <button type="button" onClick={onSource} className={cn("ml-auto inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted hover:bg-surface-2", source && "bg-brand/15 text-brand-ink")}>
        <Code className="size-3.5" /> HTML
      </button>
    </div>
  );
}

function ToolButton({ on, label, onClick, children, disabled, blocked }: { on?: boolean; label: string; onClick: () => void; children: React.ReactNode; disabled?: boolean; blocked?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={on}
      disabled={disabled || blocked}
      onClick={onClick}
      className={cn("grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-30 [&_svg]:size-4", on && "bg-brand/15 text-brand-ink")}
    >
      {children}
    </button>
  );
}
