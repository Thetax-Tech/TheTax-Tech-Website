"use client";
/* eslint-disable react-hooks/immutability -- R3F frame loops intentionally mutate Three.js objects (uniforms, transforms) outside React render; this is the documented, allocation-free pattern for 60fps animation. */

/**
 * The homepage 3D experience (React Three Fiber). Loaded only on the client via dynamic import
 * (see scene-loader.tsx) — never part of SSR, so all copy stays real HTML.
 *
 * Scene: a glowing "AI core" (fresnel sphere, wireframe icosahedron, orbit rings with travelling
 * light pulses, soft halo) inside a particle field; floating wireframe shapes at several depths
 * (parallax); a rippling wave-grid floor. Scroll position drives the camera path and morphs the
 * particles between formations matching each homepage section; the pointer pushes particles away
 * and tilts the scene.
 *
 * Performance:
 *  - every per-vertex animation runs in shaders (particle morph, drift, pointer repel, waves) —
 *    no per-frame CPU loops over vertices; attributes are only rewritten when a stage boundary is crossed
 *  - geometry is low-poly and sized per quality tier; no textures or post-processing (glow is shader-based)
 *  - the render loop stops when no [data-stage] section is on screen or the tab is hidden
 *  - an FPS monitor steps quality down (pixel ratio → particle count → extras) on slow devices
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Tier } from "./quality";

type SceneTier = Exclude<Tier, "off">;

const BRAND = new THREE.Color("#F7941D");
const BRAND_SOFT = new THREE.Color("#FFB547");
const BRAND_DEEP = new THREE.Color("#C2410C");

const SETTINGS: Record<SceneTier, { particles: number; sphere: number; shapes: number; grid: [number, number]; rings: number; dpr: number | [number, number]; antialias: boolean }> = {
  high: { particles: 1400, sphere: 48, shapes: 7, grid: [44, 30], rings: 2, dpr: [1, 1.5], antialias: true },
  mid: { particles: 800, sphere: 32, shapes: 5, grid: [32, 22], rings: 2, dpr: 1, antialias: false },
  low: { particles: 450, sphere: 24, shapes: 3, grid: [22, 16], rings: 1, dpr: 1, antialias: false },
};

type Stage = { cam: [number, number, number]; core: [number, number, number]; scale: number; spin: number };
// One entry per [data-stage] section, in page order.
const DESKTOP_STAGES: Stage[] = [
  { cam: [0, 0, 7.5], core: [2.3, 0, 0], scale: 1, spin: 0.15 }, // hero — core on the right, text on the left
  { cam: [1.5, 1.2, 9], core: [-2.6, 0.4, 0], scale: 0.8, spin: 0.35 }, // services
  { cam: [-1.2, 0.4, 6.8], core: [2.4, -0.2, 0], scale: 1.1, spin: 0.6 }, // AI automation spotlight
  { cam: [1, -0.8, 7.5], core: [-2.4, 0, 0], scale: 0.95, spin: 0.25 }, // BPO spotlight
  { cam: [0, 2.2, 11], core: [0, -0.6, 0], scale: 0.7, spin: 0.1 }, // portfolio
];
const MOBILE_STAGES: Stage[] = DESKTOP_STAGES.map((s) => ({ ...s, cam: [0, s.cam[1] * 0.5, s.cam[2] + 3.5], core: [0, 1.6, 0], scale: s.scale * 0.85 }));

// Shared runtime quality level, raised by <AdaptiveQuality> when frames are slow.
type Quality = { level: number };

// ───────────────────────── particle formations ─────────────────────────
function formations(n: number) {
  const make = (fn: (i: number, out: THREE.Vector3) => void) => {
    const a = new Float32Array(n * 3);
    const v = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      fn(i, v);
      a.set([v.x, v.y, v.z], i * 3);
    }
    return a;
  };
  const rnd = (s: number) => {
    const x = Math.sin(s * 127.1) * 43758.5453;
    return x - Math.floor(x);
  };
  const golden = Math.PI * (3 - Math.sqrt(5));
  return [
    // 0 — sphere shell (hero)
    make((i, v) => {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = golden * i;
      const R = 2.6 + rnd(i) * 0.35;
      v.set(Math.cos(t) * r * R, y * R, Math.sin(t) * r * R);
    }),
    // 1 — galaxy ring (services)
    make((i, v) => {
      const arm = i % 3;
      const t = rnd(i + 1) * 6 + arm * ((Math.PI * 2) / 3);
      const r = 1.6 + rnd(i + 2) * 3.4;
      v.set(Math.cos(t + r * 0.55) * r, (rnd(i + 3) - 0.5) * 0.35, Math.sin(t + r * 0.55) * r);
    }),
    // 2 — lattice / network grid (AI automation)
    make((i, v) => {
      const side = Math.ceil(Math.cbrt(n));
      const x = i % side, y = Math.floor(i / side) % side, z = Math.floor(i / (side * side));
      const s = 5.4 / side;
      v.set((x - side / 2) * s, (y - side / 2) * s, (z - side / 2) * s);
    }),
    // 3 — double helix pipeline (BPO / operations)
    make((i, v) => {
      const t = (i / n) * Math.PI * 10;
      const strand = i % 2 ? Math.PI : 0;
      v.set(Math.cos(t + strand) * 1.3, (i / n - 0.5) * 7, Math.sin(t + strand) * 1.3).applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2.4);
    }),
    // 4 — wide field (portfolio)
    make((i, v) => {
      v.set((rnd(i + 5) - 0.5) * 16, (rnd(i + 6) - 0.5) * 9, (rnd(i + 7) - 0.5) * 6 - 1);
    }),
  ];
}

// ───────────────────────── shaders ─────────────────────────
const pointVert = /* glsl */ `
  uniform float uSize; uniform float uTime; uniform float uPixelRatio; uniform float uMix;
  uniform vec3 uMouse; uniform float uRepel;
  attribute vec3 aPosB; attribute float aSeed;
  varying float vSeed; varying float vNear;
  void main() {
    vSeed = aSeed;
    // staggered morph: each particle starts its journey slightly later than the previous
    float k = clamp((uMix - aSeed * 0.35) / 0.65, 0.0, 1.0);
    k = k * k * (3.0 - 2.0 * k);
    vec3 p = mix(position, aPosB, k);
    p += 0.07 * vec3(sin(uTime * 0.6 + aSeed * 30.0), cos(uTime * 0.5 + aSeed * 20.0), sin(uTime * 0.4 + aSeed * 10.0));
    vec4 wp = modelMatrix * vec4(p, 1.0);
    vec3 dir = wp.xyz - uMouse;
    float d2 = dot(dir, dir);
    float push = uRepel * exp(-d2 * 0.9);
    wp.xyz += normalize(dir + vec3(1e-4)) * push;
    vNear = push / max(uRepel, 1e-3);
    vec4 mv = viewMatrix * wp;
    float twinkle = 0.75 + 0.25 * sin(uTime * 1.5 + aSeed * 40.0);
    gl_PointSize = uSize * uPixelRatio * twinkle * (1.0 + vNear * 0.8) * (6.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;
const pointFrag = /* glsl */ `
  uniform vec3 uColor; uniform vec3 uColor2; uniform float uOpacity;
  varying float vSeed; varying float vNear;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    vec3 c = mix(uColor, uColor2, max(step(0.82, vSeed), vNear * 0.7));
    gl_FragColor = vec4(c, a * a * uOpacity * (1.0 + vNear));
  }`;
const coreVert = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;
const coreFrag = /* glsl */ `
  uniform vec3 uColor; uniform float uTime;
  varying vec3 vN; varying vec3 vV;
  void main() {
    float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.2);
    float pulse = 0.85 + 0.15 * sin(uTime * 2.0);
    vec3 col = uColor * (0.2 + f * 1.7) * pulse;
    // glassy: nearly clear when facing the camera, bright fresnel rim at the edges
    gl_FragColor = vec4(col, 0.14 + f * 0.8);
  }`;
// Soft glow billboard behind the core (fake bloom, no post-processing)
const haloFrag = /* glsl */ `
  uniform vec3 uColor; uniform float uTime; uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float g = exp(-d * d * 3.2) * (0.85 + 0.15 * sin(uTime * 1.3));
    gl_FragColor = vec4(uColor, g * uOpacity);
  }`;
const uvVert = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// Ring with light pulses travelling around it
const ringFrag = /* glsl */ `
  uniform vec3 uColor; uniform float uTime; uniform float uSpeed; uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float h1 = fract(vUv.x - uTime * uSpeed);
    float h2 = fract(vUv.x - uTime * uSpeed + 0.5);
    float pulse = pow(h1, 14.0) + pow(h2, 22.0) * 0.7;
    gl_FragColor = vec4(uColor * (1.0 + pulse * 2.0), (0.22 + pulse) * uOpacity);
  }`;
// Wave-grid floor: lines displaced by travelling waves, fading with distance
const floorVert = /* glsl */ `
  uniform float uTime; uniform vec2 uRipple;
  varying float vFade; varying float vH;
  void main() {
    vec3 p = position;
    float r = length(p.xz - uRipple);
    float h = sin(p.x * 0.45 + uTime * 0.8) * 0.22 + cos(p.z * 0.55 - uTime * 0.6) * 0.22 + sin(r * 1.4 - uTime * 2.2) * 0.18 * exp(-r * 0.18);
    p.y += h;
    vH = h;
    vFade = smoothstep(15.0, 3.0, length(p.xz));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`;
const floorFrag = /* glsl */ `
  uniform vec3 uColor; uniform float uOpacity;
  varying float vFade; varying float vH;
  void main() { gl_FragColor = vec4(uColor * (0.8 + vH * 1.5), vFade * uOpacity * (0.55 + vH * 1.2)); }`;

// ───────────────────────── scroll stage ─────────────────────────
/**
 * Scroll stage without a scroll listener: an IntersectionObserver with fine thresholds fires as the
 * [data-stage] sections move through the viewport, and only then are their (5) rects read.
 * Also reports whether any stage section is on screen, so the render loop can stop entirely.
 */
function useScrollStage(count: number, onActive: (active: boolean) => void) {
  const stage = useRef(0);
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-stage]")).slice(0, count);
    if (!els.length) return;
    const visible = new Set<Element>();
    let active: boolean | null = null;
    const update = () => {
      const y = window.innerHeight * 0.45;
      const tops = els.map((el) => el.getBoundingClientRect().top);
      let st = 0;
      for (let i = 0; i < tops.length; i++) {
        if (y >= tops[i]) {
          const next = tops[i + 1] ?? tops[i] + window.innerHeight;
          st = i + Math.min(1, (y - tops[i]) / Math.max(1, next - tops[i]));
        }
      }
      stage.current = Math.min(count - 1, Math.max(0, st - 0.5));
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        update();
        const now = visible.size > 0;
        if (now !== active) onActive((active = now));
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [count, onActive]);
  return stage;
}

/** Light theme: additive glow washes out on white, so switch to normal blending and deeper tones. */
function useLightTheme() {
  const [light, setLight] = useState(() => document.documentElement.dataset.theme === "light");
  useEffect(() => {
    const root = document.documentElement;
    const obs = new MutationObserver(() => setLight(root.dataset.theme === "light"));
    obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return light;
}

// ───────────────────────── scene ─────────────────────────
function Scene({ tier, stageRef, quality }: { tier: SceneTier; stageRef: React.RefObject<number>; quality: Quality }) {
  const { gl, camera } = useThree();
  const cfg = SETTINGS[tier];
  const mobile = tier === "low";
  const fine = useMemo(() => window.matchMedia("(pointer: fine)").matches, []);
  const light = useLightTheme();
  const stages = mobile ? MOBILE_STAGES : DESKTOP_STAGES;
  const count = cfg.particles;
  const shapes = useMemo(() => formations(count), [count]);

  const group = useRef<THREE.Group>(null);
  const coreGroup = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const shapesGroup = useRef<THREE.Group>(null);
  const floor = useRef<THREE.LineSegments>(null);
  const mouse = useRef(new THREE.Vector2(0.3, 0.1));
  const smooth = useRef({ stage: 0, mx: 0, my: 0, pair: -1 });
  const tmp = useMemo(() => ({ cam: new THREE.Vector3(), look: new THREE.Vector3(), ray: new THREE.Vector3(), mouseWorld: new THREE.Vector3(99, 99, 99) }), []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(shapes[0].slice(), 3));
    g.setAttribute("aPosB", new THREE.BufferAttribute(shapes[1].slice(), 3));
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) seeds[i] = (((Math.sin(i * 91.7 + 3.1) * 43758.5453) % 1) + 1) % 1; // deterministic pseudo-random
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return g;
  }, [shapes, count]);

  const mats = useMemo(() => {
    const blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
    const base = BRAND.clone();
    const soft = light ? BRAND_DEEP.clone() : BRAND_SOFT.clone();
    const points = new THREE.ShaderMaterial({
      vertexShader: pointVert,
      fragmentShader: pointFrag,
      transparent: true,
      depthWrite: false,
      blending,
      uniforms: {
        uSize: { value: mobile ? 7 : 6 },
        uTime: { value: 0 },
        uMix: { value: 0 },
        uMouse: { value: tmp.mouseWorld },
        uRepel: { value: fine ? 0.9 : 0 },
        uPixelRatio: { value: Math.min(gl.getPixelRatio(), 1.5) },
        uColor: { value: base },
        uColor2: { value: light ? BRAND_DEEP.clone() : new THREE.Color("#ffffff") },
        uOpacity: { value: 0.9 },
      },
    });
    const core = new THREE.ShaderMaterial({ vertexShader: coreVert, fragmentShader: coreFrag, transparent: true, depthWrite: false, blending, uniforms: { uColor: { value: base.clone() }, uTime: { value: 0 } } });
    const halo = new THREE.ShaderMaterial({ vertexShader: uvVert, fragmentShader: haloFrag, transparent: true, depthWrite: false, blending, uniforms: { uColor: { value: base.clone() }, uTime: { value: 0 }, uOpacity: { value: light ? 0.16 : 0.34 } } });
    const ring = (speed: number, color: THREE.Color, opacity: number) =>
      new THREE.ShaderMaterial({ vertexShader: uvVert, fragmentShader: ringFrag, transparent: true, depthWrite: false, blending, uniforms: { uColor: { value: color }, uTime: { value: 0 }, uSpeed: { value: speed }, uOpacity: { value: opacity } } });
    const rings = [ring(0.12, base.clone(), 1), ring(-0.08, soft.clone(), 0.7)];
    const wire = new THREE.LineBasicMaterial({ color: soft, transparent: true, opacity: light ? 0.6 : 0.45 });
    const shape = new THREE.LineBasicMaterial({ color: soft, transparent: true, opacity: light ? 0.45 : 0.3, depthWrite: false });
    const floorMat = new THREE.ShaderMaterial({ vertexShader: floorVert, fragmentShader: floorFrag, transparent: true, depthWrite: false, blending, uniforms: { uTime: { value: 0 }, uRipple: { value: new THREE.Vector2() }, uColor: { value: base.clone() }, uOpacity: { value: 0 } } });
    return { points, core, halo, rings, wire, shape, floor: floorMat };
  }, [gl, mobile, fine, light, tmp]);

  const geos = useMemo(() => {
    const wire = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.45, 1));
    const ring = new THREE.TorusGeometry(2.05, 0.01, 6, 160);
    const haloPlane = new THREE.PlaneGeometry(9, 9);
    // floating low-poly shapes at different depths (parallax)
    const kinds = [
      new THREE.OctahedronGeometry(0.55),
      new THREE.TorusGeometry(0.42, 0.12, 6, 18),
      new THREE.TetrahedronGeometry(0.5),
      new THREE.IcosahedronGeometry(0.45, 0),
      new THREE.BoxGeometry(0.6, 0.6, 0.6),
      new THREE.DodecahedronGeometry(0.42, 0),
      new THREE.TorusKnotGeometry(0.32, 0.08, 48, 6),
    ].map((g) => new THREE.EdgesGeometry(g, 1));
    // wave-grid floor as line segments (rows + columns)
    const [cols, rows] = cfg.grid;
    const W = 30, D = 22;
    const pts: number[] = [];
    for (let r = 0; r <= rows; r++) {
      const z = -D / 2 + (r / rows) * D;
      for (let c = 0; c < cols; c++) pts.push(-W / 2 + (c / cols) * W, 0, z, -W / 2 + ((c + 1) / cols) * W, 0, z);
    }
    for (let c = 0; c <= cols; c++) {
      const x = -W / 2 + (c / cols) * W;
      for (let r = 0; r < rows; r++) pts.push(x, 0, -D / 2 + (r / rows) * D, x, 0, -D / 2 + ((r + 1) / rows) * D);
    }
    const floorGeo = new THREE.BufferGeometry();
    floorGeo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return { wire, ring, haloPlane, kinds, floor: floorGeo };
  }, [cfg.grid]);

  // Floating shapes layout: [kind, x, y, z, scale, spinX, spinY, bobPhase]
  const floaters = useMemo(
    () =>
      (
        [
          [0, -5.6, 2.4, -3, 1, 0.3, 0.4, 0],
          [1, 5.8, -2.2, -2.5, 1.1, 0.5, 0.2, 1.2],
          [2, -4.2, -2.6, -1.2, 0.9, 0.4, 0.6, 2.1],
          [3, 6.4, 2.9, -5, 1.4, 0.2, 0.3, 3.3],
          [4, -7.5, 0.2, -6, 1.3, 0.25, 0.35, 4.2],
          [5, 1.2, 3.6, -7, 1.5, 0.15, 0.25, 5.1],
          [6, -1.8, -3.4, 1.2, 0.8, 0.6, 0.5, 0.7],
        ] as const
      ).slice(0, cfg.shapes),
    [cfg.shapes],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => mouse.current.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  useEffect(
    () => () => {
      Object.values(mats).flat().forEach((m) => m.dispose());
    },
    [mats],
  );
  useEffect(
    () => () => {
      geos.wire.dispose();
      geos.ring.dispose();
      geos.haloPlane.dispose();
      geos.floor.dispose();
      geos.kinds.forEach((g) => g.dispose());
    },
    [geos],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const s = smooth.current;
    s.stage += (stageRef.current - s.stage) * Math.min(1, dt * 3);
    s.mx += (mouse.current.x - s.mx) * Math.min(1, dt * 2.5);
    s.my += (mouse.current.y - s.my) * Math.min(1, dt * 2.5);

    const i0 = Math.min(stages.length - 2, Math.floor(s.stage));
    const i1 = i0 + 1;
    const f = Math.min(1, Math.max(0, s.stage - i0));
    const e = f * f * (3 - 2 * f); // smoothstep
    const a = stages[i0], b = stages[i1];

    // Formation pair changed (a stage boundary was crossed) → swap the two morph targets on the GPU
    if (s.pair !== i0) {
      s.pair = i0;
      (geo.attributes.position.array as Float32Array).set(shapes[i0]);
      (geo.attributes.aPosB.array as Float32Array).set(shapes[i1]);
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aPosB.needsUpdate = true;
    }
    mats.points.uniforms.uMix.value = e;

    // Camera path + pointer parallax
    tmp.cam.set(
      THREE.MathUtils.lerp(a.cam[0], b.cam[0], e) + s.mx * 0.6,
      THREE.MathUtils.lerp(a.cam[1], b.cam[1], e) + s.my * 0.4,
      THREE.MathUtils.lerp(a.cam[2], b.cam[2], e),
    );
    camera.position.lerp(tmp.cam, Math.min(1, dt * 2));
    tmp.look.set(THREE.MathUtils.lerp(a.core[0], b.core[0], e) * 0.35, 0, 0);
    camera.lookAt(tmp.look);

    // Pointer → world position on the z=0 plane (for particle repulsion)
    if (fine) {
      tmp.ray.set(s.mx, s.my, 0.5).unproject(camera).sub(camera.position).normalize();
      const k = -camera.position.z / (tmp.ray.z || -1e-3);
      tmp.mouseWorld.copy(camera.position).addScaledVector(tmp.ray, k);
    }

    // Core placement, scale and spin
    const core = coreGroup.current;
    if (core) {
      core.position.set(THREE.MathUtils.lerp(a.core[0], b.core[0], e), THREE.MathUtils.lerp(a.core[1], b.core[1], e), 0);
      core.scale.setScalar(THREE.MathUtils.lerp(a.scale, b.scale, e));
      core.rotation.y += dt * THREE.MathUtils.lerp(a.spin, b.spin, e);
      core.rotation.x = s.my * 0.35;
      core.rotation.z = -s.mx * 0.2;
    }
    if (halo.current && core) {
      halo.current.position.copy(core.position);
      halo.current.quaternion.copy(camera.quaternion);
      halo.current.scale.setScalar(core.scale.x);
    }
    if (group.current) {
      group.current.rotation.y += dt * 0.04;
      group.current.position.x = core?.position.x ?? 0;
      group.current.position.y = core?.position.y ?? 0;
    }

    // Floating shapes: slow spin, bob, and depth-based parallax against the pointer
    const sg = shapesGroup.current;
    if (sg) {
      sg.visible = quality.level < 3;
      sg.children.forEach((child, i) => {
        const fl = floaters[i];
        if (!fl) return;
        const depth = 1 / (1 + Math.max(0, -fl[3]) * 0.25);
        child.rotation.x += dt * fl[5];
        child.rotation.y += dt * fl[6];
        child.position.set(fl[1] - s.mx * 0.9 * depth, fl[2] + Math.sin(t * 0.6 + fl[7]) * 0.25 - s.my * 0.6 * depth, fl[3]);
      });
    }
    if (floor.current) {
      floor.current.visible = quality.level < 3;
      mats.floor.uniforms.uTime.value = t;
      mats.floor.uniforms.uRipple.value.set(core?.position.x ?? 0, 0);
    }

    // Runtime downgrade: fewer particles drawn on slow devices
    geo.setDrawRange(0, quality.level >= 2 ? Math.floor(count * 0.55) : count);

    mats.points.uniforms.uTime.value = t;
    mats.core.uniforms.uTime.value = t;
    mats.halo.uniforms.uTime.value = t;
    mats.rings.forEach((m) => (m.uniforms.uTime.value = t));
    // fade the field and floor once we leave the hero so the content stays the focus
    const away = Math.min(1, s.stage);
    mats.points.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.95, 0.55, away);
    mats.floor.uniforms.uOpacity.value = THREE.MathUtils.lerp(light ? 0.28 : 0.32, 0.08, away);
  });

  return (
    <>
      <mesh ref={halo} geometry={geos.haloPlane} material={mats.halo} renderOrder={-1} />
      <group ref={group}>
        <points geometry={geo} material={mats.points} frustumCulled={false} />
      </group>
      <group ref={coreGroup}>
        <mesh material={mats.core}>
          <sphereGeometry args={[1, cfg.sphere, cfg.sphere]} />
        </mesh>
        <lineSegments geometry={geos.wire} material={mats.wire} />
        <mesh geometry={geos.ring} material={mats.rings[0]} rotation={[Math.PI / 2.3, 0, 0]} />
        {cfg.rings > 1 && <mesh geometry={geos.ring} material={mats.rings[1]} rotation={[Math.PI / 1.7, 0.6, 0]} scale={1.18} />}
      </group>
      <group ref={shapesGroup}>
        {floaters.map((fl, i) => (
          <lineSegments key={i} geometry={geos.kinds[fl[0]]} material={mats.shape} scale={fl[4]} position={[fl[1], fl[2], fl[3]]} />
        ))}
      </group>
      <lineSegments ref={floor} geometry={geos.floor} material={mats.floor} position={[0, -3.4, -2]} frustumCulled={false} />
    </>
  );
}

/** Watches frame times and raises the shared quality level when the device struggles. */
function AdaptiveQuality({ quality }: { quality: Quality }) {
  const setDpr = useThree((s) => s.setDpr);
  const acc = useRef({ avg: 16, frames: 0 });
  useFrame((_, delta) => {
    const a = acc.current;
    a.avg = a.avg * 0.95 + Math.min(delta * 1000, 100) * 0.05;
    if (++a.frames < 120 || a.avg < 24 || quality.level >= 3) return;
    a.frames = 0;
    quality.level += 1;
    if (quality.level === 1) setDpr(1); // step 1: native pixel ratio → 1
    // step 2: fewer particles · step 3: hide floating shapes and floor (read in <Scene>)
  });
  return null;
}

function ReadySignal() {
  const fired = useRef(false);
  useFrame(() => {
    if (!fired.current) {
      fired.current = true;
      requestAnimationFrame(() => window.dispatchEvent(new Event("tx:scene-ready")));
    }
  });
  return null;
}

export default function AiCoreScene({ tier }: { tier: SceneTier }) {
  const cfg = SETTINGS[tier];
  // Render only while a stage section is on screen and the tab is visible; otherwise the loop stops.
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const quality = useMemo<Quality>(() => ({ level: 0 }), []);
  const stageRef = useScrollStage(tier === "low" ? MOBILE_STAGES.length : DESKTOP_STAGES.length, setOnScreen);
  useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <Canvas
      frameloop={onScreen && tabVisible ? "always" : "never"}
      dpr={cfg.dpr}
      gl={{ antialias: cfg.antialias, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 7.5], fov: 45, near: 0.1, far: 60 }}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <Scene tier={tier} stageRef={stageRef} quality={quality} />
      <AdaptiveQuality quality={quality} />
      <ReadySignal />
    </Canvas>
  );
}
