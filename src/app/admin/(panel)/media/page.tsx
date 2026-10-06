import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { MediaManager } from "./media-manager";

export const metadata = { title: "Media library" };

export default async function MediaPage({ searchParams }: PageProps<"/admin/media">) {
  await requireUser("media");
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const items = await db.media.findMany({
    where: query ? { OR: [{ name: { contains: query } }, { alt: { contains: query } }] } : {},
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  const totalSize = items.reduce((s, m) => s + m.size, 0);
  return (
    <>
      <PageHeader title="Media library" description={`${items.length} files · ${(totalSize / 1024 / 1024).toFixed(1)} MB. Images are auto-optimised to WebP on upload.`} />
      <MediaManager items={items.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))} query={query} />
    </>
  );
}
