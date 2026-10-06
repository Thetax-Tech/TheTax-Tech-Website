import { notFound } from "next/navigation";
import { Briefcase, MapPin } from "lucide-react";
import { getJob, getJobs, getSettings } from "@/lib/data";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { prepareHtml } from "@/lib/html";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/page-hero";
import { LeadForm } from "@/components/forms/lead-form";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getJobs()).map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: PageProps<"/careers/[slug]">) {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return {};
  return buildMetadata({ path: `/careers/${slug}`, title: `${job.title} — Careers`, description: job.summary });
}

export default async function JobPage({ params }: PageProps<"/careers/[slug]">) {
  const { slug } = await params;
  const [job, settings] = await Promise.all([getJob(slug), getSettings()]);
  if (!job || !settings.modules.careers) notFound();
  const { html } = prepareHtml(job.description);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: job.title,
          description: html || job.summary,
          datePosted: job.updatedAt.toISOString().slice(0, 10),
          employmentType: job.type.toUpperCase().replace(/[^A-Z]/g, "_"),
          hiringOrganization: { "@type": "Organization", name: settings.site.legalName, sameAs: absoluteUrl("/"), logo: absoluteUrl(settings.site.icon) },
          jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", streetAddress: settings.contact.street, addressLocality: settings.contact.city, addressCountry: settings.contact.countryCode } },
        }}
      />
      <PageHero
        crumbs={[
          { name: "Careers", path: "/careers" },
          { name: job.title, path: `/careers/${slug}` },
        ]}
        eyebrow={job.department ?? "Careers"}
        title={job.title}
        lead={
          <div className="flex flex-wrap gap-4 text-base">
            <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-brand-ink" />{job.location}</span>
            <span className="inline-flex items-center gap-1.5"><Briefcase className="size-4 text-brand-ink" />{job.type}</span>
          </div>
        }
      />
      <section className="pb-28">
        <div className="container-x grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="text-lg leading-relaxed text-fg/90">{job.summary}</p>
            {html && <div className="prose-x mt-8" dangerouslySetInnerHTML={{ __html: html }} />}
          </div>
          <div className="card h-fit p-6 sm:p-8 lg:sticky lg:top-28">
            <h2 className="text-xl font-semibold">Apply for this role</h2>
            <div className="mt-6">
              <LeadForm mode="CAREER" subject={job.title} submitLabel="Submit application" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
