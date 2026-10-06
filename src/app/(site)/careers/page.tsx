import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Briefcase, MapPin } from "lucide-react";
import { getJobs, getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import { LeadForm } from "@/components/forms/lead-form";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export const revalidate = 300;

export function generateMetadata() {
  return buildMetadata({
    path: "/careers",
    title: "Careers — Jobs in Karachi at Theta X Tech",
    description: "Join Theta X Tech in Karachi. Open roles in AI automation, software engineering, design, digital marketing and BPO customer support.",
  });
}

export default async function CareersPage() {
  const [settings, jobs] = await Promise.all([getSettings(), getJobs()]);
  if (!settings.modules.careers) notFound();

  return (
    <>
      <PageHero
        crumbs={[{ name: "Careers", path: "/careers" }]}
        eyebrow="Careers"
        title="Build the future of work with us"
        lead="We're a growing team of engineers, designers, marketers and operations specialists in Karachi. Bring your curiosity — we'll bring the challenges."
      />
      <section className="pb-24">
        <div className="container-x">
          <h2 className="text-2xl font-semibold">Open positions</h2>
          {jobs.length > 0 ? (
            <Stagger as="ul" className="mt-8 divide-y divide-line border-y border-line">
              {jobs.map((j) => (
                <StaggerItem as="li" key={j.slug}>
                  <Link href={`/careers/${j.slug}`} className="group flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-brand-ink">{j.department}</p>
                      <h3 className="mt-1 text-xl font-semibold transition-colors group-hover:text-brand-ink sm:text-2xl">{j.title}</h3>
                      <p className="mt-2 max-w-2xl text-sm text-muted">{j.summary}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-subtle">
                      <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" />{j.location}</span>
                      <span className="inline-flex items-center gap-1.5"><Briefcase className="size-4" />{j.type}</span>
                      <span className="grid size-11 place-items-center rounded-full border border-line-strong transition-all group-hover:rotate-45 group-hover:border-brand group-hover:bg-brand group-hover:text-on-brand">
                        <ArrowUpRight className="size-5" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <p className="mt-6 text-muted">No open positions right now — but we&apos;re always happy to meet great people.</p>
          )}
        </div>
      </section>
      <section className="pb-28">
        <div className="container-x">
          <Reveal className="card mx-auto max-w-3xl p-6 sm:p-10">
            <h2 className="text-2xl font-semibold">Don&apos;t see your role? Send a general application</h2>
            <div className="mt-8">
              <LeadForm mode="CAREER" subject="General application" submitLabel="Send application" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
