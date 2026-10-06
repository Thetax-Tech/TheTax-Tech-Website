"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { createBackdrop, createDriver, GL_OPTIONS, isSoftwareGL } from "./backdrop-shader";
import { baseTier, createGlWorker, knownGpu, probeGpu, rememberGpu, supportsOffscreen } from "./quality";

/*
 * Animated WebGL hero backdrop: flowing brand-orange aurora, a rippling perspective grid
 * ("digital terrain"), drifting twinkling particles and a glow that follows the pointer
 * (shader in backdrop-shader.ts).
 *
 * Performance:
 *  - rendered in a Web Worker via OffscreenCanvas where supported: context creation, the GPU
 *    check, shader compile and every frame happen off the main thread
 *  - one full-screen draw call at reduced resolution, DPR capped; adaptive resolution / 30 fps cap
 *  - pauses when scrolled off-screen (IntersectionObserver) or when the tab is hidden
 *  - reduced motion / data saver: one static frame; no GPU acceleration: not rendered at all
 *  - the CSS gradient layers underneath remain the fallback
 */

const SCALE = { high: 0.75, mid: 0.6, low: 0.5, off: 0.5 } as const;

export function ShaderBackdrop({ className, horizon = -0.12 }: { className?: string; horizon?: number }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el || knownGpu() === false) return;
    const tier = baseTier();
    const animate = tier !== "off";
    const root = document.documentElement;
    const isLight = () => root.dataset.theme === "light";
    // A fresh <canvas> per mount (a canvas can only be handed to a worker once)
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "absolute inset-0 h-full w-full opacity-0 transition-opacity duration-[1200ms]";
    el.appendChild(canvas);

    let visible = true;
    const shouldRun = () => animate && visible && document.visibilityState === "visible";
    const opts = { detail: tier !== "low", horizon, scale: SCALE[tier], maxDpr: tier === "high" ? 1.5 : 1.25 };
    const cssSize = () => ({ cssW: canvas.clientWidth, cssH: canvas.clientHeight, dpr: window.devicePixelRatio || 1 });

    // Two back-ends behind one tiny interface
    let send: (m: Record<string, unknown>) => void = () => {};
    let teardown = () => {};

    if (supportsOffscreen()) {
      const worker = createGlWorker();
      const offscreen = canvas.transferControlToOffscreen();
      worker.onmessage = (e) => {
        if (e.data?.type === "gpu") {
          rememberGpu(Boolean(e.data.ok));
          if (!e.data.ok) worker.terminate();
        } else if (e.data?.type === "ready") canvas.style.opacity = "1";
      };
      worker.postMessage({ type: "init", canvas: offscreen, ...opts, ...cssSize(), light: isLight(), animate, run: shouldRun() }, [offscreen]);
      send = (m) => worker.postMessage(m);
      teardown = () => worker.terminate();
    } else {
      // Main-thread fallback (browsers without OffscreenCanvas): same shader, started when idle
      let raf = 0;
      let running = false;
      let driver: ReturnType<typeof createDriver> | null = null;
      let dispose = () => {};
      const loop = (now: number) => {
        raf = 0;
        if (!running || !driver) return;
        raf = requestAnimationFrame(loop);
        driver.frame(now);
      };
      const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 150));
      const cic = window.cancelIdleCallback ?? window.clearTimeout;
      const idle = ric(
        async () => {
          if (!(await probeGpu())) return;
          const gl = canvas.getContext("webgl", GL_OPTIONS) as WebGLRenderingContext | null;
          if (!gl || isSoftwareGL(gl)) return;
          const r = createBackdrop(gl, opts);
          if (!r) return;
          dispose = () => r.dispose();
          driver = createDriver(r, {
            ...opts,
            setCanvasSize: (w, h) => {
              canvas.width = w;
              canvas.height = h;
            },
          });
          driver.theme(isLight());
          const s = cssSize();
          driver.size(s.cssW, s.cssH, s.dpr);
          driver.frame(performance.now());
          canvas.style.opacity = "1";
          send({ type: "run", on: shouldRun() });
        },
        { timeout: 600 },
      );
      send = (m) => {
        if (!driver) return;
        if (m.type === "size") driver.size(m.cssW as number, m.cssH as number, m.dpr as number);
        else if (m.type === "pointer") driver.pointer(m.x as number, m.y as number);
        else if (m.type === "theme") driver.theme(m.light as boolean);
        if (m.type === "run") {
          running = Boolean(m.on);
          driver.resetClock();
          if (running && !raf) raf = requestAnimationFrame(loop);
        } else if (!running) driver.frame(performance.now());
      };
      teardown = () => {
        running = false;
        cic(idle);
        cancelAnimationFrame(raf);
        dispose();
      };
    }

    // The main thread only observes and forwards tiny messages
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      send({ type: "run", on: shouldRun() });
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => send({ type: "size", ...cssSize() }));
    ro.observe(canvas);
    const onVis = () => send({ type: "run", on: shouldRun() });
    document.addEventListener("visibilitychange", onVis);
    const themeObs = new MutationObserver(() => send({ type: "theme", light: isLight() }));
    themeObs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    // Pointer: coalesced to one message per animation frame, only while the hero is on screen
    let pending: PointerEvent | null = null;
    let praf = 0;
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !visible) return;
      pending = e;
      if (praf) return;
      praf = requestAnimationFrame(() => {
        praf = 0;
        if (!pending) return;
        const r = canvas.getBoundingClientRect();
        send({ type: "pointer", x: (pending.clientX - r.left) / r.width, y: 1 - (pending.clientY - r.top) / r.height });
        pending = null;
      });
    };
    if (animate) window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      io.disconnect();
      ro.disconnect();
      themeObs.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onPointer);
      cancelAnimationFrame(praf);
      teardown();
      canvas.remove();
    };
  }, [horizon]);

  return <div ref={host} aria-hidden className={cn("pointer-events-none absolute inset-0", className)} />;
}
