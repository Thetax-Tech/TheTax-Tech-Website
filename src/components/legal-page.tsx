import { getLegalPage } from "@/lib/data";
import { prepareHtml } from "@/lib/html";
import { formatDate } from "@/lib/utils";
import type { LegalKey } from "@/content/legal";
import { PageHero } from "@/components/page-hero";

export async function LegalPage({ k, path }: { k: LegalKey; path: string }) {
  const page = await getLegalPage(k);
  const { html } = prepareHtml(page.html);
  return (
    <>
      <PageHero crumbs={[{ name: page.title, path }]} eyebrow="Legal" title={page.title} lead={`Last updated: ${formatDate(page.updated)}`} />
      <section className="pb-28">
        <div className="container-x">
          <div className="prose-x max-w-3xl" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </section>
    </>
  );
}
