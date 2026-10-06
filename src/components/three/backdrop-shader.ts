/*
 * Hero backdrop shader (shared by the Web Worker renderer and the main-thread fallback).
 * Flowing brand-orange aurora, a rippling perspective grid, drifting particles and a glow that
 * follows the pointer — one full-screen triangle, one draw call, no textures.
 */

const VERT = `attribute vec2 aPos; void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uLight;
uniform float uDetail;
uniform float uHorizon;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.5 * noise(p); p = p * 2.03 + 1.7;
  v += 0.25 * noise(p); p = p * 2.01 + 3.1;
  if (uDetail > 0.5) v += 0.125 * noise(p);
  return v;
}
float stars(vec2 p, float scale, float speed, float density, vec2 par) {
  vec2 sp = p * scale + vec2(0.0, -uTime * speed) + par;
  vec2 cell = floor(sp);
  vec2 fc = fract(sp) - 0.5;
  float h = hash(cell);
  vec2 off = vec2(hash(cell + 1.3), hash(cell + 7.1)) - 0.5;
  float d = length(fc - off * 0.7);
  return smoothstep(0.09, 0.0, d) * step(density, h) * (0.45 + 0.55 * sin(uTime * 1.7 + h * 40.0));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
  vec2 m = vec2((uMouse.x - 0.5) * aspect, uMouse.y - 0.5);
  float t = uTime;

  vec3 brand = vec3(0.969, 0.580, 0.114);
  vec3 soft = vec3(1.0, 0.71, 0.28);
  vec3 deep = vec3(0.86, 0.33, 0.04);

  // Aurora: domain-warped noise, strongest in the upper half
  vec2 q = vec2(fbm(p * 1.3 + vec2(t * 0.05, -t * 0.03)), fbm(p * 1.3 + vec2(-t * 0.04, t * 0.05) + 3.1));
  float n = fbm(p * 1.9 + q * 1.7 + vec2(0.0, t * 0.07) + m * 0.15);
  float aurW = smoothstep(0.42, 0.95, n) * smoothstep(-0.35, 0.4, p.y) * 0.75;
  vec3 aurC = mix(deep, mix(brand, soft, q.x), n);

  // Pointer glow
  float md = length(p - m);
  float glowW = exp(-md * md * 10.0) * 0.32;

  // Perspective wave grid below the horizon
  float gridW = 0.0;
  float d = uHorizon - p.y;
  if (d > 0.0) {
    float z = 0.32 / d;
    vec2 g = vec2(p.x * z, z + t * 0.45);
    g.x += sin(g.y * 0.55 + t * 0.5) * 0.35 + (m.x * 0.6) * z * 0.15;
    float wave = 0.5 + 0.5 * sin(g.x * 0.8 + t * 0.9) * sin(g.y * 0.45 - t * 0.6);
    vec2 f = abs(fract(g) - 0.5);
    float dist = 0.5 - max(f.x, f.y);
    float line = 1.0 - smoothstep(0.0, 0.012 + 0.022 * z, dist);
    float fade = smoothstep(0.0, 0.16, d) * smoothstep(1.1, 0.25, abs(p.x) / aspect + d * 0.4);
    float near = exp(-pow(length(p - m) * 2.4, 2.0));
    gridW = line * fade * (0.22 + 0.5 * wave + 0.6 * near);
  }
  float horizonW = exp(-abs(p.y - uHorizon) * 55.0) * 0.4 * smoothstep(0.75, 0.0, abs(p.x) / aspect);

  // Particles: two depth layers with pointer parallax
  float st = stars(p, 22.0, 0.10, 0.86, m * 0.4);
  if (uDetail > 0.5) st += 0.8 * stars(p, 11.0, 0.05, 0.9, m * 0.9);
  float starW = st * smoothstep(uHorizon - 0.05, uHorizon + 0.25, p.y) * 0.9;

  float sum = aurW + gridW + glowW + horizonW + starW;
  vec3 col = (aurC * aurW + brand * gridW + soft * glowW + soft * horizonW + mix(soft, vec3(1.0), 0.55) * starW) / max(sum, 1e-3);
  float a = clamp(sum, 0.0, 1.0);
  // Light theme: deeper tones and a lighter touch so text stays crisp
  col = mix(col, deep * 0.9, uLight * 0.45);
  a *= mix(1.0, 0.6, uLight);
  gl_FragColor = vec4(col, a);
}`;

type GL = WebGLRenderingContext;

export const GL_OPTIONS: WebGLContextAttributes = { alpha: true, premultipliedAlpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" };

/** True when WebGL runs on a CPU rasteriser (no GPU acceleration). */
export function isSoftwareGL(gl: GL) {
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
  return /swiftshader|llvmpipe|software|basic render/i.test(renderer);
}

export function createBackdrop(gl: GL, opts: { detail: boolean; horizon: number }) {
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (n: string) => gl.getUniformLocation(prog, n);
  const uRes = u("uRes"), uTime = u("uTime"), uMouse = u("uMouse"), uLight = u("uLight");
  gl.uniform1f(u("uDetail"), opts.detail ? 1 : 0);
  gl.uniform1f(u("uHorizon"), opts.horizon);

  return {
    resize(w: number, h: number) {
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    },
    draw(timeSec: number, mx: number, my: number, light: boolean) {
      gl.uniform1f(uTime, timeSec % 3600);
      gl.uniform2f(uMouse, mx, my);
      gl.uniform1f(uLight, light ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

export type Backdrop = NonNullable<ReturnType<typeof createBackdrop>>;

/**
 * Animation state shared by both renderers: pointer smoothing, adaptive resolution
 * (sustained slow frames → lower resolution, then 30 fps) and frame pacing.
 */
export function createDriver(r: Backdrop, opts: { scale: number; maxDpr: number; setCanvasSize: (w: number, h: number) => void }) {
  const st = { cssW: 1, cssH: 1, dpr: 1, scale: opts.scale, mx: 0.7, my: 0.6, tx: 0.7, ty: 0.6, light: false, avg: 16, frames: 0, fpsCap: 0, last: 0 };
  const start = Date.now() - Math.random() * 20000;
  const apply = () => {
    const dpr = Math.min(st.dpr, opts.maxDpr);
    const w = Math.max(1, Math.round(st.cssW * dpr * st.scale));
    const h = Math.max(1, Math.round(st.cssH * dpr * st.scale));
    opts.setCanvasSize(w, h);
    r.resize(w, h);
  };
  return {
    size(cssW: number, cssH: number, dpr: number) {
      Object.assign(st, { cssW, cssH, dpr });
      apply();
    },
    pointer(x: number, y: number) {
      st.tx = x;
      st.ty = y;
    },
    theme(light: boolean) {
      st.light = light;
    },
    resetClock() {
      st.last = 0;
    },
    /** Draws one frame; returns false if this frame was skipped by the fps cap. */
    frame(now: number) {
      const dt = st.last ? now - st.last : 16;
      if (st.fpsCap && dt < 1000 / st.fpsCap - 2) return false;
      st.last = now;
      st.avg = st.avg * 0.95 + Math.min(dt, 100) * 0.05;
      if (++st.frames > 90 && st.avg > 24) {
        st.frames = 0;
        if (st.scale > 0.36) {
          st.scale = Math.max(0.35, st.scale * 0.75);
          apply();
        } else st.fpsCap = 30;
      }
      st.mx += (st.tx - st.mx) * 0.06;
      st.my += (st.ty - st.my) * 0.06;
      r.draw((Date.now() - start) / 1000, st.mx, st.my, st.light);
      return true;
    },
  };
}
