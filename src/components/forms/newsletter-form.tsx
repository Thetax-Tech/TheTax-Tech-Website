"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

export function NewsletterForm() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState("loading");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: new FormData(form).get("email"), website: new FormData(form).get("website") }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok) {
      setState("done");
      setMessage("Thanks — you're subscribed!");
      form.reset();
    } else {
      setState("error");
      setMessage(data.error || "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-3">
      <div className="flex rounded-full border border-line-strong bg-surface p-1 focus-within:border-brand">
        <label htmlFor="newsletter-email" className="sr-only">Email address</label>
        <input id="newsletter-email" name="email" type="email" required placeholder="you@company.com" autoComplete="email" className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-subtle" />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <button type="submit" disabled={state === "loading"} aria-label="Subscribe" className="grid size-9 place-items-center rounded-full bg-brand text-on-brand transition-transform hover:scale-105 disabled:opacity-60">
          {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : state === "done" ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
        </button>
      </div>
      <p role="status" aria-live="polite" className={state === "error" ? "mt-2 text-xs text-red-400" : "mt-2 text-xs text-subtle"}>
        {message}
      </p>
    </form>
  );
}
