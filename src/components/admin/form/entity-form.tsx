"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, ExternalLink, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import type { Field, FormAction, FormLayout, SubField } from "./types";
import { Input, Label, Panel, Select, Textarea, btn } from "@/components/admin/ui";
import { MediaPicker } from "@/components/admin/media-picker";
import { ICON_NAMES, Icon } from "@/components/ui/icon";
import { cn, slugify } from "@/lib/utils";

// The Tiptap editor is heavy — load it only on forms that actually have a rich-text field.
const RichTextEditor = dynamic(() => import("@/components/admin/rich-text-editor").then((m) => m.RichTextEditor), {
  ssr: false,
  loading: () => <div className="h-72 animate-pulse rounded-xl border border-line-strong bg-surface" />,
});

// ─────────────── path helpers (support "contact.phone" style names) ───────────────
function getPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}
function setPath(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const [head, ...rest] = path.split(".");
  if (!rest.length) return { ...obj, [head]: value };
  const child = (obj[head] && typeof obj[head] === "object" ? obj[head] : {}) as Record<string, unknown>;
  return { ...obj, [head]: setPath(child, rest.join("."), value) };
}

type Props = {
  layout: FormLayout;
  initial: Record<string, unknown>;
  action: FormAction;
  submitLabel?: string;
  deleteAction?: () => Promise<{ ok: boolean; error?: string; redirect?: string }>;
  deleteLabel?: string;
  previewHref?: string;
  viewHref?: string;
  /** Extra buttons in the action bar (e.g. Publish). Each sets a field then submits. */
  submitVariants?: { label: string; set: Record<string, unknown>; primary?: boolean }[];
};

export function EntityForm({ layout, initial, action, submitLabel = "Save", deleteAction, deleteLabel = "Delete", previewHref, viewHref, submitVariants }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const [dirty, setDirty] = useState(false);
  const slugTouched = useMemo(() => new Set<string>(Object.keys(initial).filter((k) => Boolean(initial[k]))), [initial]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const allFields = [...layout.main, ...(layout.side ?? [])].flatMap((s) => s.fields);

  function update(name: string, value: unknown) {
    setDirty(true);
    setValues((v) => {
      let next = setPath(v, name, value);
      // auto-fill slugs from their source field until the slug is edited manually
      for (const f of allFields) {
        if (f.type === "slug" && f.from === name && !slugTouched.has(f.name)) next = setPath(next, f.name, slugify(String(value ?? "")));
      }
      return next;
    });
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  }

  function submit(extra?: Record<string, unknown>) {
    const payload = extra ? Object.entries(extra).reduce((acc, [k, v]) => setPath(acc, k, v), values) : values;
    if (extra) setValues(payload);
    start(async () => {
      try {
        const res = await action(payload);
        if (!res.ok) {
          setErrors(res.fieldErrors ?? {});
          toast.error(res.error ?? "Please fix the highlighted fields.");
          return;
        }
        setDirty(false);
        toast.success(res.message ?? "Saved");
        if (res.redirect) router.push(res.redirect);
        else router.refresh();
      } catch (e) {
        toast.error((e as Error).message || "Something went wrong");
      }
    });
  }

  function onDelete() {
    if (!deleteAction || !confirm("Delete permanently? This cannot be undone.")) return;
    start(async () => {
      const res = await deleteAction();
      if (!res.ok) return void toast.error(res.error ?? "Delete failed");
      setDirty(false);
      toast.success("Deleted");
      if (res.redirect) router.push(res.redirect);
    });
  }

  const renderSection = (s: FormLayout["main"][number]) => (
    <Panel key={s.title} title={s.title} description={s.description}>
      <div className="grid gap-5 sm:grid-cols-2">
        {s.fields.map((f) => (
          <div key={f.name} className={cn(("full" in f && f.full) || isWide(f) ? "sm:col-span-2" : "")}>
            <FieldControl field={f} value={getPath(values, f.name)} values={values} error={errors[f.name]} onChange={(v) => update(f.name, v)} onSlugEdit={() => slugTouched.add(f.name)} setField={update} />
          </div>
        ))}
      </div>
    </Panel>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="pb-24"
    >
      <div className={cn("grid gap-6", layout.side?.length && "lg:grid-cols-[1fr_340px]")}>
        <div className="min-w-0 space-y-6">{layout.main.map(renderSection)}</div>
        {layout.side && layout.side.length > 0 && <div className="space-y-6">{layout.side.map(renderSection)}</div>}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line glass lg:left-64">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-subtle">
            {dirty ? <span className="text-amber-600 dark:text-amber-400">● Unsaved changes</span> : <span>All changes saved</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {deleteAction && (
              <button type="button" onClick={onDelete} className={btn.danger} disabled={pending}>
                <Trash2 /> {deleteLabel}
              </button>
            )}
            {previewHref && (
              <a href={previewHref} target="_blank" className={btn.secondary}>
                Preview <ExternalLink />
              </a>
            )}
            {viewHref && (
              <a href={viewHref} target="_blank" className={btn.secondary}>
                View live <ExternalLink />
              </a>
            )}
            {submitVariants?.map((v) => (
              <button key={v.label} type="button" onClick={() => submit(v.set)} disabled={pending} className={v.primary ? btn.primary : btn.secondary}>
                {v.label}
              </button>
            ))}
            <button type="submit" className={submitVariants?.some((v) => v.primary) ? btn.secondary : btn.primary} disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Save />} {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function isWide(f: Field) {
  return ["textarea", "richtext", "repeater", "gallery", "seo", "heading", "list", "tags", "multiselect"].includes(f.type);
}

// ─────────────────────────── Field controls ───────────────────────────

function FieldControl({
  field: f,
  value,
  values,
  error,
  onChange,
  onSlugEdit,
  setField,
}: {
  field: Field;
  value: unknown;
  values: Record<string, unknown>;
  error?: string;
  onChange: (v: unknown) => void;
  onSlugEdit: () => void;
  setField: (name: string, v: unknown) => void;
}) {
  const id = `f-${f.name.replace(/\./g, "-")}`;
  const err = error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null;
  const hint = "hint" in f && f.hint && f.type !== "heading" ? <p className="mt-1 text-xs text-subtle">{f.hint}</p> : null;
  const str = value == null ? "" : String(value);

  switch (f.type) {
    case "heading":
      return (
        <div className="border-b border-line pb-2 pt-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-subtle">{f.label}</p>
          {f.hint && <p className="mt-1 text-xs text-subtle">{f.hint}</p>}
        </div>
      );
    case "textarea": {
      const len = str.length;
      const [min, max] = f.counter ?? [0, 0];
      return (
        <div>
          <Label htmlFor={id} hint={f.counter ? <span className={len && (len < min || len > max) ? "text-amber-600" : ""}>{len}/{max}</span> : undefined}>
            {f.label} {f.required && "*"}
          </Label>
          <Textarea id={id} rows={f.rows ?? 3} value={str} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} aria-invalid={Boolean(error)} />
          {hint}
          {err}
        </div>
      );
    }
    case "slug":
      return (
        <div>
          <Label htmlFor={id}>{f.label} {f.required && "*"}</Label>
          <div className="flex items-center rounded-lg border border-line-strong bg-bg focus-within:border-brand">
            {f.prefix && <span className="pl-3 text-sm text-subtle">{f.prefix}</span>}
            <input
              id={id}
              value={str}
              onChange={(e) => {
                onSlugEdit();
                onChange(slugify(e.target.value) + (e.target.value.endsWith("-") ? "-" : ""));
              }}
              className="w-full bg-transparent px-1 py-2 pr-3 text-sm outline-none"
            />
          </div>
          {hint}
          {err}
        </div>
      );
    case "select":
      return (
        <div>
          <Label htmlFor={id}>{f.label} {f.required && "*"}</Label>
          <Select id={id} value={str} onChange={(e) => onChange(e.target.value)}>
            {!f.required && <option value="">—</option>}
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          {hint}
          {err}
        </div>
      );
    case "multiselect": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div>
          <Label>{f.label}</Label>
          <div className="flex flex-wrap gap-2">
            {f.options.map((o) => {
              const on = arr.includes(o.value);
              return (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => onChange(on ? arr.filter((x) => x !== o.value) : [...arr, o.value])}
                  className={cn("rounded-full border px-3 py-1.5 text-sm transition-colors", on ? "border-brand bg-brand text-on-brand" : "border-line-strong hover:border-brand")}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          {hint}
          {err}
        </div>
      );
    }
    case "switch":
      return (
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-line px-4 py-3">
          <span>
            <span className="block text-sm font-medium">{f.label}</span>
            {"hint" in f && f.hint && <span className="block text-xs text-subtle">{f.hint}</span>}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(value)}
            onClick={() => onChange(!value)}
            className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", value ? "bg-brand" : "bg-line-strong")}
          >
            <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", value ? "left-[22px]" : "left-0.5")} />
          </button>
        </label>
      );
    case "icon":
      return <IconField id={id} label={f.label} value={str} onChange={onChange} />;
    case "image":
      return (
        <div>
          <Label>{f.label}</Label>
          <MediaPicker value={str || null} onChange={(v) => onChange(v ?? "")} />
          {hint}
          {err}
        </div>
      );
    case "gallery": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div>
          <Label>{f.label}</Label>
          <MediaPicker multiple values={arr} onChangeMany={onChange} />
          {hint}
        </div>
      );
    }
    case "richtext":
      return (
        <div>
          <Label>{f.label} {f.required && "*"}</Label>
          <RichTextEditor value={str} onChange={onChange} />
          {hint}
          {err}
        </div>
      );
    case "tags":
      return <TagsField id={id} label={f.label} value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} suggestions={f.suggestions} hint={f.hint} />;
    case "list": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div>
          <Label htmlFor={id} hint="One per line">{f.label}</Label>
          <Textarea id={id} rows={5} value={arr.join("\n")} onChange={(e) => onChange(e.target.value.split("\n"))} onBlur={() => onChange(arr.map((s) => s.trim()).filter(Boolean))} />
          {hint}
        </div>
      );
    }
    case "repeater":
      return <RepeaterField field={f} value={Array.isArray(value) ? (value as Record<string, unknown>[]) : []} onChange={onChange} error={error} />;
    case "seo":
      return <SeoField field={f} values={values} setField={setField} />;
    default: {
      const type = f.type === "datetime" ? "datetime-local" : f.type;
      let v = str;
      if (f.type === "datetime" && value) {
        const d = new Date(String(value));
        if (!Number.isNaN(d.getTime())) v = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      }
      return (
        <div>
          <Label htmlFor={id}>{f.label} {f.required && "*"}</Label>
          <div className={f.type === "color" ? "flex gap-2" : undefined}>
            {f.type === "color" && <input type="color" value={v || "#F7941D"} onChange={(e) => onChange(e.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-line-strong bg-bg" aria-label={`${f.label} picker`} />}
            <Input
              id={id}
              type={f.type === "color" ? "text" : type}
              value={v}
              placeholder={f.placeholder}
              maxLength={"maxLength" in f ? f.maxLength : undefined}
              autoComplete={f.type === "password" ? "new-password" : undefined}
              onChange={(e) => onChange(f.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : f.type === "datetime" ? (e.target.value ? new Date(e.target.value).toISOString() : "") : e.target.value)}
              aria-invalid={Boolean(error)}
            />
          </div>
          {hint}
          {err}
        </div>
      );
    }
  }
}

function IconField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-line-strong text-brand-ink">
          <Icon name={value || "sparkles"} className="size-5" />
        </span>
        <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          {ICON_NAMES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

function TagsField({ id, label, value, onChange, suggestions = [], hint }: { id: string; label: string; value: string[]; onChange: (v: string[]) => void; suggestions?: string[]; hint?: string }) {
  const [draft, setDraft] = useState("");
  const add = (t: string) => {
    const tag = t.trim().replace(/,$/, "");
    if (tag && !value.some((v) => v.toLowerCase() === tag.toLowerCase())) onChange([...value, tag]);
    setDraft("");
  };
  const unused = suggestions.filter((s) => !value.includes(s));
  return (
    <div>
      <Label htmlFor={id} hint="Press Enter or comma to add">{label}</Label>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line-strong bg-bg p-2 focus-within:border-brand">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-brand/15 px-2.5 py-1 text-xs font-medium text-brand-ink">
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((x) => x !== t))}>
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          list={`${id}-list`}
          onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value) : setDraft(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={() => draft && add(draft)}
          className="min-w-32 flex-1 bg-transparent px-1 text-sm outline-none"
        />
        <datalist id={`${id}-list`}>
          {unused.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
      {hint && <p className="mt-1 text-xs text-subtle">{hint}</p>}
    </div>
  );
}

function RepeaterField({ field, value, onChange, error }: { field: Extract<Field, { type: "repeater" }>; value: Record<string, unknown>[]; onChange: (v: unknown) => void; error?: string }) {
  const set = (i: number, key: string, v: unknown) => onChange(value.map((item, idx) => (idx === i ? { ...item, [key]: v } : item)));
  const move = (i: number, d: number) => {
    const next = [...value];
    const [it] = next.splice(i, 1);
    next.splice(i + d, 0, it);
    onChange(next);
  };
  const blank = () => Object.fromEntries(field.fields.map((sf) => [sf.name, ""]));
  return (
    <div>
      <Label hint={`${value.length} item${value.length === 1 ? "" : "s"}`}>{field.label}</Label>
      <ol className="space-y-3">
        {value.map((item, i) => (
          <li key={i} className="rounded-xl border border-line bg-bg p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-subtle">
                {field.itemLabel ?? "Item"} {i + 1}
              </span>
              <span className="flex gap-1">
                <button type="button" className={btn.ghost} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                  <ChevronUp />
                </button>
                <button type="button" className={btn.ghost} disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                  <ChevronDown />
                </button>
                <button type="button" className={cn(btn.ghost, "text-red-500")} onClick={() => onChange(value.filter((_, idx) => idx !== i))} aria-label="Remove">
                  <Trash2 />
                </button>
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {field.fields.map((sf) => (
                <div key={sf.name} className={sf.type === "textarea" || sf.full ? "sm:col-span-2" : ""}>
                  <SubFieldControl sf={sf} value={item[sf.name]} onChange={(v) => set(i, sf.name, v)} />
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <button type="button" className={cn(btn.secondary, "mt-3")} onClick={() => onChange([...value, blank()])}>
        <Plus /> {field.addLabel ?? "Add item"}
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SubFieldControl({ sf, value, onChange }: { sf: SubField; value: unknown; onChange: (v: unknown) => void }) {
  const str = value == null ? "" : String(value);
  if (sf.type === "textarea")
    return (
      <div>
        <Label>{sf.label}</Label>
        <Textarea rows={sf.rows ?? 2} value={str} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  if (sf.type === "icon") return <IconField id={`sf-${sf.name}`} label={sf.label} value={str} onChange={onChange} />;
  if (sf.type === "image")
    return (
      <div>
        <Label>{sf.label}</Label>
        <MediaPicker value={str || null} onChange={(v) => onChange(v ?? "")} compact />
      </div>
    );
  return (
    <div>
      <Label>{sf.label}</Label>
      <Input type={sf.type} value={str} placeholder={sf.placeholder} onChange={(e) => onChange(sf.type === "number" ? Number(e.target.value) : e.target.value)} />
    </div>
  );
}

/** SEO title/description editor with live Google snippet preview and length guidance. */
function SeoField({ field, values, setField }: { field: Extract<Field, { type: "seo" }>; values: Record<string, unknown>; setField: (n: string, v: unknown) => void }) {
  const title = String(values.seoTitle ?? "");
  const desc = String(values.seoDescription ?? "");
  const fallbackTitle = field.titleFrom ? String(values[field.titleFrom] ?? "") : "";
  const fallbackDesc = field.descriptionFrom ? String(values[field.descriptionFrom] ?? "") : "";
  const shownTitle = title || fallbackTitle;
  const shownDesc = desc || fallbackDesc;
  const slug = String(values.slug ?? "");
  const tone = (len: number, min: number, max: number) => (len === 0 ? "text-subtle" : len < min || len > max ? "text-amber-600" : "text-emerald-600");
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="seoTitle" hint={<span className={tone(title.length, 30, 60)}>{title.length}/60</span>}>
          SEO title
        </Label>
        <Input id="seoTitle" value={title} placeholder={fallbackTitle} onChange={(e) => setField("seoTitle", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="seoDescription" hint={<span className={tone(desc.length, 120, 160)}>{desc.length}/160</span>}>
          Meta description
        </Label>
        <Textarea id="seoDescription" rows={3} value={desc} placeholder={fallbackDesc.slice(0, 160)} onChange={(e) => setField("seoDescription", e.target.value)} />
      </div>
      <div className="rounded-xl border border-line bg-white p-4 text-left dark:bg-[#202124]">
        <p className="text-xs text-[#4d5156] dark:text-[#bdc1c6]">thetaxtech.com.pk › {field.pathPrefix.replace(/^\//, "").replace(/\/$/, "")}{slug ? ` › ${slug}` : ""}</p>
        <p className="mt-1 truncate text-lg text-[#1a0dab] dark:text-[#8ab4f8]">{shownTitle ? `${shownTitle} | Theta X Tech` : "Page title"}</p>
        <p className="mt-1 line-clamp-2 text-sm text-[#4d5156] dark:text-[#bdc1c6]">{shownDesc || "Meta description shown in search results."}</p>
      </div>
      <div>
        <Label>Social share image (Open Graph)</Label>
        <MediaPicker value={(values.ogImage as string) || null} onChange={(v) => setField("ogImage", v ?? "")} compact />
        <p className="mt-1 text-xs text-subtle">1200×630 recommended. Falls back to the cover image or an auto-generated card.</p>
      </div>
    </div>
  );
}
