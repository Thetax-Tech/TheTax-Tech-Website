/*
 * Off-main-thread WebGL for the hero backdrop (OffscreenCanvas). Everything expensive — creating
 * the context, checking for a real GPU, compiling the shader and drawing every frame — happens
 * here, so the page's main thread stays free for the visitor's input.
 *
 * Messages in:  probe | init {canvas, ...} | size | pointer | theme | run
 * Messages out: probe {ok, software} | gpu {ok, software} | ready
 */
import { createBackdrop, createDriver, GL_OPTIONS, isSoftwareGL } from "./backdrop-shader";

type Scope = {
  postMessage(m: unknown): void;
  onmessage: ((e: MessageEvent) => void) | null;
  requestAnimationFrame?: (cb: (t: number) => void) => number;
};
const ctx = self as unknown as Scope;
const raf = (cb: (t: number) => void) => (ctx.requestAnimationFrame ? ctx.requestAnimationFrame(cb) : setTimeout(() => cb(performance.now()), 16));

let driver: ReturnType<typeof createDriver> | null = null;
let running = false;
let looping = false;
let animate = true;

function loop(now: number) {
  if (!running || !driver) {
    looping = false;
    return;
  }
  driver.frame(now);
  raf(loop);
}
function setRunning(on: boolean) {
  running = on && animate;
  if (running && !looping && driver) {
    looping = true;
    driver.resetClock();
    raf(loop);
  }
}

ctx.onmessage = (e: MessageEvent) => {
  const m = e.data;
  if (m.type === "probe") {
    const c = new OffscreenCanvas(1, 1);
    const gl = c.getContext("webgl") as WebGLRenderingContext | null;
    ctx.postMessage({ type: "probe", ok: Boolean(gl), software: gl ? isSoftwareGL(gl) : false });
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return;
  }
  if (m.type === "init") {
    const canvas = m.canvas as OffscreenCanvas;
    const gl = canvas.getContext("webgl", GL_OPTIONS) as WebGLRenderingContext | null;
    const software = gl ? isSoftwareGL(gl) : false;
    ctx.postMessage({ type: "gpu", ok: Boolean(gl) && !software, software });
    if (!gl || software) {
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
      return;
    }
    const r = createBackdrop(gl, { detail: m.detail, horizon: m.horizon });
    if (!r) return;
    animate = m.animate;
    driver = createDriver(r, {
      scale: m.scale,
      maxDpr: m.maxDpr,
      setCanvasSize: (w, h) => {
        canvas.width = w;
        canvas.height = h;
      },
    });
    driver.theme(m.light);
    driver.size(m.cssW, m.cssH, m.dpr);
    driver.frame(performance.now());
    ctx.postMessage({ type: "ready" });
    setRunning(m.run);
    return;
  }
  if (!driver) return;
  if (m.type === "size") {
    driver.size(m.cssW, m.cssH, m.dpr);
    if (!running) driver.frame(performance.now());
  } else if (m.type === "pointer") driver.pointer(m.x, m.y);
  else if (m.type === "theme") {
    driver.theme(m.light);
    if (!running) driver.frame(performance.now());
  } else if (m.type === "run") setRunning(m.on);
};
