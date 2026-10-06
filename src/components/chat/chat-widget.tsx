"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Loader2, MessageCircle, Send, UserRound, X } from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";
import { cn } from "@/lib/utils";

type Card = { slug: string; title: string; category: string; image: string | null; result: string | null; url: string; isSample: boolean };
type Msg = { role: "user" | "assistant"; text: string; cards?: Card[] | null; pending?: boolean; form?: boolean };

const KEY = "tx-chat-id";

/** Floating AI assistant. Streams replies from /api/chat (server-sent events). */
export function ChatWidget({ name, greeting, quickReplies, online, defaultOpen = false }: { name: string; greeting: string; quickReplies: string[]; online: boolean; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [teaser, setTeaser] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const [form, setForm] = useState<null | { handoff: boolean }>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const restored = useRef(false);

  // Restore the previous conversation (if any) the first time the panel opens
  useEffect(() => {
    if (!open || restored.current) return;
    restored.current = true;
    let id: string | null = null;
    try {
      id = localStorage.getItem(KEY);
    } catch {}
    if (!id) return;
    fetch(`/api/chat?conversationId=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((d: { messages: Msg[] }) => {
        if (d.messages?.length) {
          setConvId(id);
          setMsgs(d.messages.filter((m) => m.text || m.cards?.length));
        }
      })
      .catch(() => {});
  }, [open]);

  // Gentle teaser once per session
  useEffect(() => {
    let seen = false;
    try {
      seen = Boolean(sessionStorage.getItem("tx-chat-teaser"));
    } catch {}
    if (seen) return;
    const t = window.setTimeout(() => {
      setTeaser(true);
      try {
        sessionStorage.setItem("tx-chat-teaser", "1");
      } catch {}
    }, 9000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, form]);

  useEffect(() => {
    document.documentElement.classList.toggle("chat-open", open);
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || busy) return;
      setInput("");
      setBusy(true);
      setMsgs((m) => [...m, { role: "user", text: message }, { role: "assistant", text: "", pending: true }]);
      const patchLast = (fn: (m: Msg) => Msg) => setMsgs((list) => list.map((m, i) => (i === list.length - 1 ? fn(m) : m)));
      try {
        const res = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ conversationId: convId, message, page: window.location.pathname }) });
        if (!res.ok || !res.body) {
          const d = await res.json().catch(() => ({}));
          patchLast((m) => ({ ...m, pending: false, text: d.error ?? "Sorry, something went wrong. Please try again." }));
          return;
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const events = buf.split("\n\n");
          buf = events.pop() ?? "";
          for (const raw of events) {
            const line = raw.trim();
            if (!line.startsWith("data:")) continue;
            const ev = JSON.parse(line.slice(5));
            if (ev.type === "text") patchLast((m) => ({ ...m, pending: false, text: m.text + ev.delta }));
            else if (ev.type === "cards") patchLast((m) => ({ ...m, pending: false, cards: [...(m.cards ?? []), ...ev.cards] }));
            else if (ev.type === "form") setForm({ handoff: false });
            else if (ev.type === "error") patchLast((m) => ({ ...m, pending: false, text: (m.text ? m.text + "\n\n" : "") + ev.message }));
            else if (ev.type === "done" && ev.conversationId) {
              setConvId(ev.conversationId);
              try {
                localStorage.setItem(KEY, ev.conversationId);
              } catch {}
            }
          }
        }
        patchLast((m) => ({ ...m, pending: false }));
      } catch {
        patchLast((m) => ({ ...m, pending: false, text: "Connection lost — please try again." }));
      } finally {
        setBusy(false);
      }
    },
    [busy, convId],
  );

  const showQuick = msgs.length === 0;

  return (
    <>
      {/* Launcher */}
      <div className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-[calc(1.25rem+env(safe-area-inset-right,0px))] z-[45] flex flex-col items-end gap-3 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:right-[calc(1.5rem+env(safe-area-inset-right,0px))]">
        <AnimatePresence>
          {teaser && !open && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={() => {
                setTeaser(false);
                setOpen(true);
              }}
              className="max-w-[260px] rounded-2xl rounded-br-sm border border-line-strong bg-surface px-4 py-3 text-left text-sm shadow-2xl"
            >
              <span className="block font-semibold">{name}</span>
              <span className="mt-0.5 block text-muted line-clamp-2">{greeting}</span>
            </motion.button>
          )}
        </AnimatePresence>
        <motion.button
          type="button"
          onClick={() => {
            setTeaser(false);
            setOpen((o) => !o);
          }}
          aria-label={open ? "Close chat" : `Chat with ${name}`}
          aria-expanded={open}
          aria-controls="tx-chat"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="relative grid size-14 place-items-center rounded-full bg-brand text-on-brand shadow-[0_12px_40px_-8px_var(--glow)]"
        >
          {!open && <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full bg-brand [animation-iteration-count:3]" />}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={open ? "x" : "c"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.section
            id="tx-chat"
            role="dialog"
            aria-label={`Chat with ${name}`}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-2 bottom-24 top-16 z-[46] flex flex-col overflow-hidden rounded-3xl border border-line-strong bg-bg-elevated shadow-2xl sm:inset-x-auto sm:right-6 sm:top-auto sm:h-[min(640px,calc(100dvh-8rem))] sm:w-[400px]"
          >
            <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
              <span className="relative grid size-10 place-items-center rounded-full bg-bg">
                <LogoMark className="h-6" />
                <span className={cn("absolute bottom-0 right-0 size-3 rounded-full border-2 border-surface", online ? "bg-emerald-500" : "bg-amber-500")} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold leading-tight">{name}</span>
                <span className="block text-xs text-subtle">{online ? "AI assistant · team online" : "AI assistant · team replies next business day"}</span>
              </span>
              <button type="button" onClick={() => setForm({ handoff: true })} className="inline-flex items-center gap-1 rounded-full border border-line-strong px-3 py-1.5 text-xs font-medium hover:border-brand" title="Talk to a person">
                <UserRound className="size-3.5" /> Human
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="grid size-8 place-items-center rounded-full hover:bg-surface-2">
                <X className="size-4" />
              </button>
            </header>

            <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite">
              <Bubble role="assistant" text={greeting} />
              {msgs.map((m, i) => (
                <div key={i} className="space-y-3">
                  {(m.text || m.pending) && <Bubble role={m.role} text={m.text} pending={m.pending} />}
                  {m.cards && m.cards.length > 0 && <Cards cards={m.cards} />}
                </div>
              ))}
              {form && convId && <LeadForm conversationId={convId} handoff={form.handoff} onDone={(text) => { setForm(null); setMsgs((m) => [...m, { role: "assistant", text }]); }} onCancel={() => setForm(null)} />}
              {form && !convId && (
                <p className="rounded-2xl bg-surface-2 p-3 text-xs text-muted">Send a quick message first (e.g. what you need), then you can leave your details here.</p>
              )}
            </div>

            {showQuick && (
              <div className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none]">
                {quickReplies.map((q) => (
                  <button key={q} type="button" onClick={() => send(q)} className="shrink-0 rounded-full border border-line-strong px-3 py-1.5 text-xs font-medium hover:border-brand hover:text-brand-ink">
                    {q}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-end gap-2 border-t border-line p-3"
            >
              <label htmlFor="tx-chat-input" className="sr-only">Message</label>
              <textarea
                ref={inputRef}
                id="tx-chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 1500))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder="Type your message…"
                className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-line-strong bg-bg px-4 py-2.5 text-sm outline-none focus:border-brand"
              />
              <button type="submit" disabled={busy || !input.trim()} aria-label="Send message" className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-on-brand transition-opacity disabled:opacity-40">
                {busy ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
              </button>
            </form>
            <p className="px-4 pb-2 text-center text-[10px] text-subtle">AI replies may be imperfect — our team confirms all details. <Link href="/privacy-policy" className="underline">Privacy</Link></p>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

function Bubble({ role, text, pending }: { role: "user" | "assistant"; text: string; pending?: boolean }) {
  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed", role === "user" ? "rounded-br-sm bg-brand text-on-brand" : "rounded-bl-sm bg-surface-2 text-fg")}>
        {pending && !text ? (
          <span className="flex gap-1 py-1" aria-label="Typing">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </span>
        ) : (
          <Linkified text={text} />
        )}
      </div>
    </div>
  );
}

/** Render plain text with clickable URLs (no HTML from the model is ever injected). */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a key={i} href={p} className="break-all underline underline-offset-2" target={p.includes(typeof window !== "undefined" ? window.location.host : "@@") ? undefined : "_blank"} rel="noopener noreferrer">
            {p}
          </a>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function Cards({ cards }: { cards: Card[] }) {
  return (
    <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
      {cards.map((c) => (
        <Link key={c.slug} href={c.url} className="group w-56 shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-brand">
          <span className="relative block aspect-[4/3] bg-surface-2">
            {c.image && <Image src={c.image} alt={c.title} fill sizes="224px" unoptimized={/\.svg$/i.test(c.image)} className="object-cover" />}
            {c.isSample && <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-white">Sample</span>}
          </span>
          <span className="block p-3">
            <span className="block text-[10px] font-medium uppercase tracking-widest text-brand-ink">{c.category}</span>
            <span className="mt-1 block text-sm font-semibold leading-snug line-clamp-2">{c.title}</span>
            {c.result && <span className="mt-1 block text-xs text-muted line-clamp-1">{c.result}</span>}
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-ink">
              View project <ArrowUpRight className="size-3" />
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}

function LeadForm({ conversationId, handoff, onDone, onCancel }: { conversationId: string; handoff: boolean; onDone: (text: string) => void; onCancel: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <form
      className="space-y-2 rounded-2xl border border-brand/40 bg-surface p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setBusy(true);
        setErr("");
        const res = await fetch("/api/chat/lead", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ conversationId, handoff, name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone"), notes: fd.get("notes") || undefined }),
        }).catch(() => null);
        const d = res ? await res.json().catch(() => ({})) : {};
        setBusy(false);
        if (res?.ok) onDone(d.message);
        else setErr(d.error ?? "Something went wrong.");
      }}
    >
      <p className="text-sm font-semibold">{handoff ? "Talk to a person" : "Leave your details"}</p>
      <p className="text-xs text-muted">We&apos;ll reply within one business day.</p>
      <input name="name" required minLength={2} placeholder="Your name *" aria-label="Your name" className="w-full rounded-xl border border-line-strong bg-bg px-3 py-2 text-sm outline-none focus:border-brand" />
      <input name="email" type="email" placeholder="Email" aria-label="Email" className="w-full rounded-xl border border-line-strong bg-bg px-3 py-2 text-sm outline-none focus:border-brand" />
      <input name="phone" type="tel" placeholder="Phone / WhatsApp" aria-label="Phone or WhatsApp" className="w-full rounded-xl border border-line-strong bg-bg px-3 py-2 text-sm outline-none focus:border-brand" />
      <textarea name="notes" rows={2} placeholder="What do you need? (optional)" aria-label="What do you need" className="w-full resize-none rounded-xl border border-line-strong bg-bg px-3 py-2 text-sm outline-none focus:border-brand" />
      {err && <p className="text-xs text-red-500">{err}</p>}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={busy} className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-on-brand disabled:opacity-60">
          {busy ? "Sending…" : "Send"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full px-3 py-2 text-xs text-muted hover:text-fg">
          Cancel
        </button>
      </div>
    </form>
  );
}
