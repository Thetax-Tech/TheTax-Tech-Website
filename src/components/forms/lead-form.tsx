"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Mode = "CONTACT" | "QUOTE" | "CAREER";

const BUDGETS = ["Under PKR 250k / $1k", "PKR 250k–1M / $1k–4k", "PKR 1M–3M / $4k–10k", "PKR 3M+ / $10k+", "Not sure yet"];
const TIMELINES = ["ASAP", "Within 1 month", "1–3 months", "3+ months", "Just exploring"];

function Field({ label, name, error, required, children }: { label: string; name: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium">
        {label} {required && <span className="text-brand-ink" aria-hidden>*</span>}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls = (err?: string) =>
  cn(
    "w-full rounded-xl border bg-surface px-4 py-3 text-sm outline-none transition-colors placeholder:text-subtle focus:border-brand focus:ring-2 focus:ring-brand/20",
    err ? "border-red-400" : "border-line-strong",
  );

export function LeadForm({
  mode,
  services = [],
  defaultService,
  subject,
  submitLabel,
}: {
  mode: Mode;
  services?: { slug: string; name: string }[];
  defaultService?: string;
  subject?: string;
  submitLabel?: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(fd.entries());
    payload.type = mode;
    payload.consent = fd.get("consent") === "on";
    payload.sourceUrl = window.location.pathname;
    if (subject) payload.subject = subject;
    setState("loading");
    setErrors({});
    setFormError("");
    try {
      const res = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.fields ?? {});
        setFormError(data.error ?? "Something went wrong.");
        setState("idle");
        return;
      }
      setState("done");
      (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.("event", "generate_lead", { form: mode.toLowerCase() });
    } catch {
      setFormError("Network error — please try again or contact us on WhatsApp.");
      setState("idle");
    }
  }

  const aria = (n: string) => ({ "aria-invalid": Boolean(errors[n]) || undefined, "aria-describedby": errors[n] ? `${n}-error` : undefined });

  return (
    <AnimatePresence mode="wait">
      {state === "done" ? (
        <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-16 text-center" role="status">
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }} className="grid size-20 place-items-center rounded-full bg-brand text-on-brand">
            <CheckCircle2 className="size-10" />
          </motion.span>
          <h3 className="mt-6 text-2xl font-semibold">Thank you — message received!</h3>
          <p className="mt-3 max-w-sm text-muted">Our team will get back to you within one business day. For anything urgent, reach us on WhatsApp.</p>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={onSubmit} noValidate exit={{ opacity: 0, y: -10 }} className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" name="name" error={errors.name} required>
            <input id="name" name="name" autoComplete="name" required className={inputCls(errors.name)} {...aria("name")} />
          </Field>
          <Field label="Email" name="email" error={errors.email} required>
            <input id="email" name="email" type="email" autoComplete="email" required className={inputCls(errors.email)} {...aria("email")} />
          </Field>
          <Field label="Phone / WhatsApp" name="phone" error={errors.phone}>
            <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+92 3xx xxxxxxx" className={inputCls(errors.phone)} {...aria("phone")} />
          </Field>
          <Field label="Company" name="company" error={errors.company}>
            <input id="company" name="company" autoComplete="organization" className={inputCls(errors.company)} {...aria("company")} />
          </Field>

          {mode === "QUOTE" && (
            <>
              <div className="sm:col-span-2">
                <Field label="Service you need" name="service" error={errors.service} required>
                  <select id="service" name="service" defaultValue={defaultService ?? ""} required className={inputCls(errors.service)} {...aria("service")}>
                    <option value="" disabled>
                      Choose a service…
                    </option>
                    {services.map((s) => (
                      <option key={s.slug} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                    <option value="Other / Not sure">Other / Not sure</option>
                  </select>
                </Field>
              </div>
              <Field label="Estimated budget" name="budget" error={errors.budget}>
                <select id="budget" name="budget" defaultValue="" className={inputCls(errors.budget)}>
                  <option value="">Select…</option>
                  {BUDGETS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </Field>
              <Field label="Timeline" name="timeline" error={errors.timeline}>
                <select id="timeline" name="timeline" defaultValue="" className={inputCls(errors.timeline)}>
                  <option value="">Select…</option>
                  {TIMELINES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </>
          )}

          {mode === "CONTACT" && (
            <div className="sm:col-span-2">
              <Field label="Subject" name="subject" error={errors.subject}>
                <input id="subject" name="subject" className={inputCls(errors.subject)} {...aria("subject")} />
              </Field>
            </div>
          )}

          <div className="sm:col-span-2">
            <Field label={mode === "QUOTE" ? "Tell us about your project" : mode === "CAREER" ? "Why are you a great fit? (include a link to your CV / LinkedIn)" : "Message"} name="message" error={errors.message} required>
              <textarea id="message" name="message" rows={5} required className={cn(inputCls(errors.message), "resize-y")} {...aria("message")} />
            </Field>
          </div>

          {/* Honeypot */}
          <div className="hidden" aria-hidden>
            <label htmlFor="website">Website</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-start gap-3 text-sm text-muted">
              <input type="checkbox" name="consent" className="mt-0.5 size-4 accent-[var(--brand)]" required />
              <span>
                I agree to the{" "}
                <Link href="/privacy-policy" className="text-brand-ink underline underline-offset-2">
                  privacy policy
                </Link>{" "}
                and to being contacted about my enquiry.
              </span>
            </label>
            {errors.consent && <p className="mt-1.5 text-xs text-red-400">{errors.consent}</p>}
          </div>

          {formError && (
            <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-400 sm:col-span-2">
              {formError}
            </p>
          )}

          <div className="sm:col-span-2">
            <Button type="submit" size="lg" disabled={state === "loading"} className="w-full sm:w-auto">
              {state === "loading" ? (
                <>
                  <Loader2 className="animate-spin" /> Sending…
                </>
              ) : (
                <>
                  {submitLabel ?? (mode === "QUOTE" ? "Request my free quote" : "Send message")} <ArrowRight />
                </>
              )}
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
