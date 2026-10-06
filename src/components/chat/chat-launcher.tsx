"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MessageCircle } from "lucide-react";

type Props = { name: string; greeting: string; quickReplies: string[]; online: boolean };

const ChatWidget = dynamic(() => import("./chat-widget").then((m) => m.ChatWidget), { ssr: false });

const POS =
  "fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-[calc(1.25rem+env(safe-area-inset-right,0px))] z-[45] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:right-[calc(1.5rem+env(safe-area-inset-right,0px))]";

/**
 * Lightweight stand-in for the AI assistant. Only this tiny button ships with the page; the full
 * chat widget (and its animation code) is downloaded after the page has loaded, on the visitor's
 * first interaction (scroll, tap, key, mouse move) — or immediately when they hover, focus or
 * click the button. Nothing extra runs while the page is becoming interactive.
 */
export function ChatLauncher(props: Props) {
  const [load, setLoad] = useState(false);
  const [openOnLoad, setOpenOnLoad] = useState(false);

  useEffect(() => {
    if (load) return;
    const events = ["scroll", "pointerdown", "pointermove", "keydown", "touchstart", "wheel"] as const;
    let idle = 0;
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
    const cic = window.cancelIdleCallback ?? window.clearTimeout;
    const trigger = () => {
      events.forEach((e) => window.removeEventListener(e, trigger));
      idle = ric(() => setLoad(true), { timeout: 2000 });
    };
    const arm = () => events.forEach((e) => window.addEventListener(e, trigger, { passive: true, once: true }));
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });
    return () => {
      window.removeEventListener("load", arm);
      events.forEach((e) => window.removeEventListener(e, trigger));
      if (idle) cic(idle);
    };
  }, [load]);

  if (load) return <ChatWidget {...props} defaultOpen={openOnLoad} />;

  return (
    <div className={POS}>
      <button
        type="button"
        aria-label={`Chat with ${props.name}`}
        aria-expanded={false}
        onPointerEnter={() => setLoad(true)}
        onFocus={() => setLoad(true)}
        // Record the intent to open on press: hovering may swap in the real widget before the
        // click completes, so waiting for `click` alone could lose it.
        onPointerDown={() => {
          setOpenOnLoad(true);
          setLoad(true);
        }}
        onClick={() => {
          setOpenOnLoad(true);
          setLoad(true);
        }}
        className="tx-pop relative grid size-14 place-items-center rounded-full bg-brand text-on-brand shadow-[0_12px_40px_-8px_var(--glow)]"
      >
        <MessageCircle className="size-6" />
      </button>
    </div>
  );
}
