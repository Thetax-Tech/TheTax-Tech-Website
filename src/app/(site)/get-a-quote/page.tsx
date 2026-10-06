import { CalendarCheck, FileSearch, MessagesSquare, ShieldCheck } from "lucide-react";
import { getServices } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import { LeadForm } from "@/components/forms/lead-form";
import { Reveal } from "@/components/motion/reveal";

export function generateMetadata() {
  return buildMetadata({
    path: "/get-a-quote",
    title: "Get a Free Quote & Consultation",
    description:
      "Request a free consultation and transparent quote from Theta X Tech for AI automation, AI agents, BPO, web development, UI/UX design, digital marketing or graphic design.",
  });
}

const STEPS = [
  { icon: MessagesSquare, title: "Share your goals", text: "Tell us what you want to achieve — no technical jargon needed." },
  { icon: FileSearch, title: "We analyse & plan", text: "Our specialists review your needs and outline the best approach." },
  { icon: CalendarCheck, title: "Free consultation", text: "A 30-minute call to refine scope, timeline and budget." },
  { icon: ShieldCheck, title: "Transparent quote", text: "A clear, fixed-scope proposal. NDA available on request." },
];

export default async function QuotePage({ searchParams }: PageProps<"/get-a-quote">) {
  const [{ service }, services] = await Promise.all([searchParams, getServices()]);
  const preselected = services.find((s) => s.slug === service)?.name;

  return (
    <>
      <PageHero
        crumbs={[{ name: "Get a quote", path: "/get-a-quote" }]}
        eyebrow="Free consultation"
        title="Get a free quote in one business day"
        lead="Tell us about your project. We'll respond with ideas, a recommended approach and a transparent estimate — with no obligation."
      />
      <section className="pb-28">
        <div className="container-x grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <Reveal className="card p-6 sm:p-10">
            <LeadForm mode="QUOTE" services={services.map((s) => ({ slug: s.slug, name: s.name }))} defaultService={preselected} />
          </Reveal>
          <div>
            <h2 className="text-xl font-semibold">What happens next?</h2>
            <ol className="mt-6 space-y-6">
              {STEPS.map(({ icon: Ico, title, text }, i) => (
                <Reveal as="li" key={title} delay={i * 0.08} className="flex gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-line-strong text-brand-ink">
                    <Ico className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-semibold">
                      {i + 1}. {title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}
