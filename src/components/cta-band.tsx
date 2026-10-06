import { ArrowRight } from "lucide-react";
import { getHomeSections, getSettings } from "@/lib/data";
import { ButtonLink } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";

function waLink(number: string, message: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

/** Final call-to-action band, editable in Admin → Content → Home → CTA. */
export async function CtaBand({ title, text }: { title?: string; text?: string }) {
  const [home, settings] = await Promise.all([getHomeSections(), getSettings()]);
  const cta = home.cta;
  if (!cta) return null;
  const secondaryHref = cta.secondaryCta.href === "whatsapp" ? waLink(settings.contact.whatsapp, settings.contact.whatsappMessage) : cta.secondaryCta.href;

  return (
    <section className="section">
      <div className="container-x">
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-brand/30 bg-gradient-to-br from-[#1a1206] via-[#0d0d10] to-[#0b0c10] px-6 py-16 text-center sm:px-12 sm:py-24">
          <div aria-hidden className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-80 w-[50rem] -translate-x-1/2 -translate-y-1/2 rounded-full blob [--blob-a:88%]" />
            <div className="absolute inset-0 bg-grid opacity-40 mask-radial [--grid-line:rgb(255_255_255/0.06)]" />
          </div>
          <h2 className="mx-auto max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
            <SplitText text={title ?? cta.title} inView />
          </h2>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-5 max-w-xl text-base text-white/70 sm:text-lg">{text ?? cta.text}</p>
          </Reveal>
          <Reveal delay={0.3} className="mt-10 flex flex-wrap justify-center gap-3">
            <Magnetic>
              <ButtonLink href={cta.primaryCta.href} size="lg">
                {cta.primaryCta.label} <ArrowRight />
              </ButtonLink>
            </Magnetic>
            <Magnetic>
              <ButtonLink href={secondaryHref} size="lg" variant="secondary" className="border-white/20 bg-white/5 text-white hover:text-brand">
                <WhatsAppIcon /> {cta.secondaryCta.label}
              </ButtonLink>
            </Magnetic>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
