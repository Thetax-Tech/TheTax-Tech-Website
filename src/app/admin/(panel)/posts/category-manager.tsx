"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus } from "lucide-react";
import { deleteCategory, saveCategory } from "@/app/admin/actions/posts";
import { DeleteButton } from "@/components/admin/list-controls";
import { Input, Panel, btn } from "@/components/admin/ui";

type Cat = { id: string; name: string; slug: string; description: string | null; count: number };

export function CategoryManager({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Partial<Cat> | null>(null);
  const [pending, start] = useTransition();

  function save() {
    if (!editing) return;
    start(async () => {
      const r = await saveCategory({ id: editing.id, name: editing.name ?? "", slug: editing.slug ?? "", description: editing.description ?? "" });
      if (!r.ok) return void toast.error(r.error);
      toast.success("Category saved");
      setEditing(null);
      router.refresh();
    });
  }

  return (
    <Panel
      title="Categories"
      description="Group articles by topic. Each category gets its own SEO landing page."
      actions={
        <button type="button" className={btn.secondary} onClick={() => setEditing({ name: "", slug: "", description: "" })}>
          <Plus /> Add category
        </button>
      }
    >
      {editing && (
        <div className="mb-4 grid gap-3 rounded-xl border border-brand/40 p-4 sm:grid-cols-[1fr_1fr_2fr_auto]">
          <Input placeholder="Name" value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} aria-label="Category name" />
          <Input placeholder="slug (auto)" value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} aria-label="Category slug" />
          <Input placeholder="Description (for SEO)" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} aria-label="Category description" />
          <div className="flex gap-2">
            <button type="button" className={btn.primary} onClick={save} disabled={pending}>Save</button>
            <button type="button" className={btn.ghost} onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}
      <ul className="divide-y divide-line">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-3 py-2.5">
            <span className="flex-1">
              <span className="font-medium">{c.name}</span> <span className="text-xs text-subtle">/blog/category/{c.slug} · {c.count} posts</span>
            </span>
            <button type="button" className={btn.ghost} onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}>
              <Pencil />
            </button>
            <DeleteButton iconOnly action={deleteCategory.bind(null, c.id)} confirmText={`Delete "${c.name}"? Posts in it will become uncategorised.`} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
