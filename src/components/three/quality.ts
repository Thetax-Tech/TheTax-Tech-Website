/**
 * Device quality tiers for the WebGL visuals (homepage 3D scene + hero shader backdrops).
 *
 *  high — desktop with a capable CPU: full scene, DPR up to 1.5, antialiasing
 *  mid  — tablets and modest desktops/laptops (≤ 4 cores or ≤ 4 GB): fewer particles, DPR 1
 *  low  — phones: lightest scene, loaded after the first interaction
 *  off  — reduced motion or data saver: static visuals only
 *
 * Separately, devices without GPU acceleration (WebGL on a CPU rasteriser) get no WebGL at all —
 * the CSS hero stays. That check needs a WebGL context, so it runs inside a Web Worker
 * (OffscreenCanvas) to keep the page's main thread free, and is cached for the visit.
 * Runtime FPS monitoring (ai-core-scene / backdrop-shader) steps quality down further when needed.
 */
export type Tier = "high" | "mid" | "low" | "off";

/** Tier from cheap device signals (no WebGL involved). */
export function baseTier(): Tier {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } };
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "off";
  if (nav.connection?.saveData || /(^|-)2g$/.test(nav.connection?.effectiveType ?? "")) return "off";
  if (window.matchMedia("(max-width: 767px)").matches) return "low";
  if (window.matchMedia("(max-width: 1023px), (pointer: coarse)").matches || (nav.deviceMemory ?? 8) <= 4 || (navigator.hardwareConcurrency ?? 8) <= 4) return "mid";
  return "high";
}

const KEY = "tx-gpu";

/** Cached result of the GPU check for this visit: true = hardware-accelerated WebGL, false = none/software, null = unknown. */
export function knownGpu(): boolean | null {
  try {
    const v = sessionStorage.getItem(KEY);
    return v === null ? null : v === "1";
  } catch {
    return null;
  }
}
export function rememberGpu(hardware: boolean) {
  try {
    sessionStorage.setItem(KEY, hardware ? "1" : "0");
  } catch {}
}

export const supportsOffscreen = () => typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined" && "transferControlToOffscreen" in HTMLCanvasElement.prototype;

export function createGlWorker() {
  return new Worker(new URL("./gl.worker.ts", import.meta.url), { type: "module" });
}

let pending: Promise<boolean> | null = null;

/** Resolves whether WebGL is GPU-accelerated. Off the main thread when the browser allows it. */
export function probeGpu(): Promise<boolean> {
  const known = knownGpu();
  if (known !== null) return Promise.resolve(known);
  if (pending) return pending;
  pending = new Promise<boolean>((resolve) => {
    const done = (hw: boolean) => {
      rememberGpu(hw);
      resolve(hw);
    };
    if (supportsOffscreen()) {
      const w = createGlWorker();
      const timer = window.setTimeout(() => {
        w.terminate();
        done(false);
      }, 4000);
      w.onmessage = (e) => {
        if (e.data?.type !== "probe") return;
        window.clearTimeout(timer);
        w.terminate();
        done(Boolean(e.data.ok && !e.data.software));
      };
      w.postMessage({ type: "probe" });
      return;
    }
    // Older browsers: probe on the main thread (fast on real GPUs)
    try {
      const gl = document.createElement("canvas").getContext("webgl");
      if (!gl) return done(false);
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      done(!/swiftshader|llvmpipe|software|basic render/i.test(renderer));
    } catch {
      done(false);
    }
  });
  return pending;
}
