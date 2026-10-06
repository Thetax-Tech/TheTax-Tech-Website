/** Declarative field definitions used by <EntityForm>. All plain data (serialisable from server pages). */

type Base = { name: string; label: string; hint?: string; required?: boolean; placeholder?: string; full?: boolean };

export type SubField =
  | (Base & { type: "text" | "url" | "number" })
  | (Base & { type: "textarea"; rows?: number })
  | (Base & { type: "icon" })
  | (Base & { type: "image" });

export type Field =
  | (Base & { type: "text" | "email" | "url" | "number" | "password" | "color" | "datetime"; maxLength?: number })
  | (Base & { type: "textarea"; rows?: number; counter?: [number, number] })
  | (Base & { type: "slug"; from: string; prefix?: string })
  | (Base & { type: "select"; options: { value: string; label: string }[] })
  | (Base & { type: "multiselect"; options: { value: string; label: string }[] })
  | (Base & { type: "switch" })
  | (Base & { type: "icon" })
  | (Base & { type: "image" })
  | (Base & { type: "gallery" })
  | (Base & { type: "richtext" })
  | (Base & { type: "tags"; suggestions?: string[] })
  | (Base & { type: "list" }) // simple list of strings, one per line
  | (Base & { type: "repeater"; fields: SubField[]; addLabel?: string; itemLabel?: string })
  | (Base & { type: "seo"; pathPrefix: string; titleFrom?: string; descriptionFrom?: string })
  | { type: "heading"; name: string; label: string; hint?: string };

export type Section = { title: string; description?: string; fields: Field[] };
export type FormLayout = { main: Section[]; side?: Section[] };

export type FormResult = { ok: boolean; error?: string; fieldErrors?: Record<string, string>; redirect?: string; message?: string };
export type FormAction = (values: Record<string, unknown>) => Promise<FormResult>;
