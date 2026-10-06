"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, FileText, Loader2, Search, Trash2, Upload, X } from "lucide-react";
import { uploadFiles } from "@/components/admin/media-picker";
import { deleteMedia, updateMedia } from "@/app/admin/actions/content";
import { Input, Label, btn, inputClass } from "@/components/admin/ui";
import { cn, formatDate } from "@/lib/utils";

type Item = { id: string; url: string; name: string; alt: string | null; mimeType: string; width: number | null; height: number | null; size: number; createdAt: string };

export function MediaManager({ items, query }: { items: Item[]; query: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);
  const [pending, start] = useTransition();

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const up = await uploadFiles(files);
      if (up.length) toast.success(`Uploaded ${up.length} file(s)`);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <form className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <input name="q" defaultValue={query} placeholder="Search by name or alt text…" className={cn(inputClass, "pl-9")} />
          </form>
          <button type="button" className={btn.primary} onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="animate-spin" /> : <Upload />} Upload files
          </button>
          <input ref={fileRef} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={(e) => onFiles(e.target.files)} />
        </div>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            onFiles(e.dataTransfer.files);
          }}
          className={cn("min-h-64 rounded-2xl border-2 border-dashed p-3 transition-colors", drag ? "border-brand bg-brand/5" : "border-transparent")}
        >
          {items.length === 0 ? (
            <div className="grid place-items-center py-24 text-center text-sm text-muted">
              <Upload className="mb-3 size-8 text-subtle" />
              Drag & drop images here, or click “Upload files”.
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
              {items.map((m) => (
                <li key={m.id}>
                  <button type="button" onClick={() => setSelected(m)} className={cn("relative block aspect-square w-full overflow-hidden rounded-xl border-2 bg-surface-2", selected?.id === m.id ? "border-brand" : "border-transparent hover:border-line-strong")}>
                    {m.mimeType.startsWith("image/") ? <Image src={m.url} alt={m.alt ?? m.name} fill sizes="200px" className="object-cover" /> : <FileText className="absolute inset-0 m-auto size-10 text-subtle" />}
                  </button>
                  <p className="mt-1 truncate text-xs text-subtle">{m.name}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        {selected ? (
          <MediaDetails
            key={selected.id}
            item={selected}
            pending={pending}
            onClose={() => setSelected(null)}
            onSave={(data) =>
              start(async () => {
                await updateMedia(selected.id, data);
                toast.success("Saved");
                router.refresh();
              })
            }
            onDelete={() => {
              if (!confirm("Delete this file? Pages using it will show a broken image.")) return;
              start(async () => {
                const r = await deleteMedia(selected.id);
                if (!r.ok) return void toast.error(r.error);
                toast.success("Deleted");
                setSelected(null);
                router.refresh();
              });
            }}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-line-strong p-6 text-center text-sm text-muted">Select a file to rename it, edit alt text or copy its URL.</div>
        )}
      </aside>
    </div>
  );
}

function MediaDetails({ item, pending, onClose, onSave, onDelete }: { item: Item; pending: boolean; onClose: () => void; onSave: (d: { name: string; alt: string }) => void; onDelete: () => void }) {
  const [name, setName] = useState(item.name);
  const [alt, setAlt] = useState(item.alt ?? "");
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">File details</h2>
        <button type="button" className={btn.ghost} onClick={onClose} aria-label="Close">
          <X />
        </button>
      </div>
      {item.mimeType.startsWith("image/") && (
        <div className="relative mb-4 aspect-video overflow-hidden rounded-lg bg-surface-2">
          <Image src={item.url} alt={item.alt ?? ""} fill sizes="320px" className="object-contain" />
        </div>
      )}
      <dl className="mb-4 grid grid-cols-2 gap-2 text-xs text-subtle">
        <dt>Type</dt>
        <dd className="text-fg">{item.mimeType}</dd>
        {item.width && (
          <>
            <dt>Dimensions</dt>
            <dd className="text-fg">
              {item.width}×{item.height}
            </dd>
          </>
        )}
        <dt>Size</dt>
        <dd className="text-fg">{(item.size / 1024).toFixed(0)} KB</dd>
        <dt>Uploaded</dt>
        <dd className="text-fg">{formatDate(item.createdAt)}</dd>
      </dl>
      <div className="space-y-3">
        <div>
          <Label htmlFor="m-name">Name</Label>
          <Input id="m-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="m-alt" hint="Describe the image for SEO & accessibility">Alt text</Label>
          <Input id="m-alt" value={alt} onChange={(e) => setAlt(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Input readOnly value={item.url} aria-label="File URL" className="text-xs" />
          <button
            type="button"
            className={btn.secondary}
            aria-label="Copy URL"
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + item.url);
              toast.success("URL copied");
            }}
          >
            <Copy />
          </button>
        </div>
        <div className="flex justify-between gap-2 pt-2">
          <button type="button" className={btn.danger} onClick={onDelete} disabled={pending}>
            <Trash2 /> Delete
          </button>
          <button type="button" className={btn.primary} onClick={() => onSave({ name, alt })} disabled={pending}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
