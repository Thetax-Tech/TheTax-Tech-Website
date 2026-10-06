"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Check, FileText, ImagePlus, Loader2, Search, Upload, X } from "lucide-react";
import { btn, Input } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export type MediaItem = { id: string; url: string; name: string; alt: string | null; mimeType: string; width: number | null; height: number | null; size: number };

export async function uploadFiles(files: FileList | File[]): Promise<MediaItem[]> {
  const fd = new FormData();
  Array.from(files).forEach((f) => fd.append("files", f));
  const res = await fetch("/api/admin/media", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  (data.errors as string[] | undefined)?.forEach((e) => toast.error(e));
  if (!res.ok && !data.items?.length) throw new Error(data.error ?? "Upload failed");
  return data.items ?? [];
}

const isImage = (url: string) => /\.(webp|png|jpe?g|gif|avif|svg)$/i.test(url);

/** Thumbnail + "choose" button that opens the media library modal. */
export function MediaPicker({
  value,
  onChange,
  multiple,
  values = [],
  onChangeMany,
  compact,
}: {
  value?: string | null;
  onChange?: (url: string | null) => void;
  multiple?: boolean;
  values?: string[];
  onChangeMany?: (urls: string[]) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (multiple) {
    return (
      <div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {values.map((url, i) => (
            <div key={url + i} className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-surface-2">
              <Image src={url} alt="" fill sizes="160px" className="object-cover" />
              <button type="button" aria-label="Remove image" onClick={() => onChangeMany?.(values.filter((_, idx) => idx !== i))} className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100">
                <X className="size-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setOpen(true)} className="grid aspect-square place-items-center rounded-lg border border-dashed border-line-strong text-subtle transition-colors hover:border-brand hover:text-brand-ink">
            <span className="flex flex-col items-center gap-1 text-xs">
              <ImagePlus className="size-6" /> Add images
            </span>
          </button>
        </div>
        {open && <MediaLibraryModal multiple onClose={() => setOpen(false)} onSelect={(items) => onChangeMany?.([...values, ...items.map((i) => i.url)])} />}
      </div>
    );
  }

  return (
    <div className={cn("flex gap-3", compact ? "items-center" : "flex-col items-start")}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-lg border border-dashed border-line-strong bg-surface-2 text-subtle hover:border-brand", compact ? "size-16" : "aspect-video w-full max-w-xs")}
      >
        {value ? (
          isImage(value) ? <Image src={value} alt="" fill sizes="320px" className="object-cover" /> : <FileText className="size-6" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-xs">
            <ImagePlus className="size-6" /> {!compact && "Choose image"}
          </span>
        )}
      </button>
      <div className={cn("flex gap-1", compact && "flex-col")}>
        <button type="button" className={btn.secondary} onClick={() => setOpen(true)}>
          {value ? "Change" : "Choose"}
        </button>
        {value && (
          <button type="button" className={cn(btn.ghost, "text-red-500")} onClick={() => onChange?.(null)}>
            Remove
          </button>
        )}
      </div>
      {open && <MediaLibraryModal onClose={() => setOpen(false)} onSelect={(items) => onChange?.(items[0]?.url ?? null)} />}
    </div>
  );
}

export function MediaLibraryModal({ onClose, onSelect, multiple }: { onClose: () => void; onSelect: (items: MediaItem[]) => void; multiple?: boolean }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<MediaItem[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (query: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/media?q=${encodeURIComponent(query)}`);
    const data = await res.json().catch(() => ({ items: [] }));
    setItems(data.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(q), 250);
    return () => clearTimeout(t);
  }, [q, load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded = await uploadFiles(files);
      setItems((cur) => [...uploaded, ...cur]);
      setSelected((s) => (multiple ? [...s, ...uploaded] : uploaded.slice(0, 1)));
      if (uploaded.length) toast.success(`Uploaded ${uploaded.length} file(s)`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function toggle(item: MediaItem) {
    setSelected((s) => (s.some((x) => x.id === item.id) ? s.filter((x) => x.id !== item.id) : multiple ? [...s, item] : [item]));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Media library">
      <button aria-label="Close" className="absolute inset-0 bg-black/60" onClick={onClose} type="button" />
      <div
        className="relative flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-line bg-bg-elevated shadow-2xl"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFiles(e.dataTransfer.files);
        }}
      >
        <header className="flex items-center gap-3 border-b border-line p-4">
          <h2 className="font-semibold">Media library</h2>
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-9" />
          </div>
          <button type="button" className={btn.primary} onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="animate-spin" /> : <Upload />} Upload
          </button>
          <input ref={fileRef} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={(e) => onFiles(e.target.files)} />
          <button type="button" className={btn.ghost} onClick={onClose} aria-label="Close">
            <X />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-subtle" /></div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line-strong py-20 text-center text-sm text-muted">No media yet. Drag & drop files here or click Upload.</div>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {items.map((m) => {
                const on = selected.some((s) => s.id === m.id);
                return (
                  <li key={m.id}>
                    <button type="button" onClick={() => toggle(m)} onDoubleClick={() => { onSelect([m]); onClose(); }} className={cn("relative block aspect-square w-full overflow-hidden rounded-lg border-2 bg-surface-2", on ? "border-brand" : "border-transparent hover:border-line-strong")}>
                      {isImage(m.url) ? <Image src={m.url} alt={m.alt ?? m.name} fill sizes="180px" className="object-cover" /> : <FileText className="m-auto size-8 text-subtle" />}
                      {on && <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-brand text-on-brand"><Check className="size-4" /></span>}
                    </button>
                    <p className="mt-1 truncate text-xs text-subtle">{m.name}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <footer className="flex items-center justify-between gap-3 border-t border-line p-4">
          <p className="text-sm text-subtle">{selected.length ? `${selected.length} selected` : "Tip: drag & drop files to upload"}</p>
          <button type="button" className={btn.primary} disabled={!selected.length} onClick={() => { onSelect(selected); onClose(); }}>
            {multiple ? "Add selected" : "Use image"}
          </button>
        </footer>
      </div>
    </div>
  );
}
