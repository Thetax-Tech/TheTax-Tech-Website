import { getPost } from "@/lib/data";
import { renderOgImage } from "@/lib/og";

export const revalidate = 3600;

/** Social share image for a blog post: /og/blog/<slug> */
export async function GET(_req: Request, ctx: RouteContext<"/og/blog/[slug]">) {
  const { slug } = await ctx.params;
  const post = await getPost(slug);
  if (!post) return new Response("Not found", { status: 404 });
  return renderOgImage({ title: post.title, eyebrow: post.category?.name ?? "Insights" });
}
