"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { baseTier, probeGpu, type Tier } from "./quality";

const AiCoreScene = dynamic(() => import("./ai-core-scene"), { ssr: false });

/**
 * Fixed full-viewport 3D layer behind the homepage. The hero's WebGL shader backdrop and CSS
 * gradients sit underneath, so the hero looks alive immediately; this richer Three.js scene
 * fades in on top once the page is ready.
 *
 * Timing (never competes with the page content for the first paint):
 *  - desktop / tablet (high, mid): as soon as the browser is idle after the page has loaded
 *  - phones (low): on the visitor's first interaction (scroll, touch, key), keeping mobile loads light
 *  - off (reduced motion, data saver) or no GPU acceleration: never — the hero visuals remain
 */
export function SceneLoader() {
  const [tier, setTier] = useState<Tier | "pending">("pending");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // The intro loader never waits for the 3D scene.
    window.dispatchEvent(new Event("tx:scene-deferred"));
    let t: Tier = "off";
    let started = false;
    let idle = 0;
    const events = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cic = window.cancelIdleCallback ?? window.clearTimeout;
    const start = () => {
      if (started) return;
      started = true;
      events.forEach((e) => window.removeEventListener(e, start));
      setTier(t);
    };
    const onLoad = async () => {
      // Device signals first (free), then the GPU check — in a worker, after the page has loaded
      t = baseTier();
      if (t === "off" || !(await probeGpu()) || started) return;
      if (t === "low") events.forEach((e) => window.addEventListener(e, start, { passive: true, once: true }));
      else idle = ric(start, { timeout: 1500 });
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    const onReady = () => {
      setVisible(true);
      document.documentElement.classList.add("has-3d");
    };
    window.addEventListener("tx:scene-ready", onReady);
    return () => {
      started = true;
      cic(idle);
      window.removeEventListener("load", onLoad);
      events.forEach((e) => window.removeEventListener(e, start));
      window.removeEventListener("tx:scene-ready", onReady);
      document.documentElement.classList.remove("has-3d");
    };
  }, []);

  if (tier === "pending" || tier === "off") return null;
  // Portal to <body>: ancestors with (animated) transforms would otherwise trap position:fixed
  return createPortal(
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 transition-opacity duration-[1500ms]" style={{ opacity: visible ? 1 : 0 }}>
      <AiCoreScene tier={tier} />
    </div>,
    document.body,
  );
}
