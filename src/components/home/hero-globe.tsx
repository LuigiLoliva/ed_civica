"use client";

import type { MotionValue } from "framer-motion";
import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

type Rgb = readonly [number, number, number];

type HeroGlobeProps = {
  /** Zoom guidato dallo scroll (1 = dimensione base). */
  zoom?: MotionValue<number>;
  className?: string;
};

const MAJOR_NODES: { label: string; color: Rgb }[] = [
  { label: "Pace", color: [176, 208, 158] },
  { label: "Giustizia", color: [222, 244, 253] },
  { label: "Cooperazione", color: [64, 188, 234] },
];

const RINGS = [
  { radius: 1.42, tiltX: 0.25, tiltZ: 0.3, speed: 0.2, phase: 0.6 },
  { radius: 1.62, tiltX: -0.5, tiltZ: -0.55, speed: -0.15, phase: 2.5 },
  { radius: 1.86, tiltX: 0.9, tiltZ: 0.5, speed: 0.11, phase: 4.3 },
];

const TAU = Math.PI * 2;
const CAMERA = 3.6;
const ARC_STEPS = 30;
const RING_STEPS = 120;
const WAVE_DURATION = 2.4;
const SPHERE_RATIO = 0.3;
/** Il canvas deborda dal box per lasciare spazio a orbite, polvere e zoom. */
const OVERSCAN = 1.5;
const FRONT_LEVELS = 8;
const BACK_DIM = 8;
const BACK_LIT = 9;
const SKIP = 255;

const BUCKET_STYLES: string[] = (() => {
  const styles: string[] = [];
  for (let i = 0; i < FRONT_LEVELS; i += 1) {
    const l = i / (FRONT_LEVELS - 1);
    const r = Math.round(0 + (236 - 0) * l * l);
    const g = Math.round(112 + (249 - 112) * l);
    const b = Math.round(168 + (255 - 168) * l);
    styles.push(`rgba(${r},${g},${b},${(0.3 + 0.7 * l).toFixed(3)})`);
  }
  styles[BACK_DIM] = "rgba(92,170,214,0.17)";
  styles[BACK_LIT] = "rgba(170,226,250,0.5)";
  return styles;
})();

const DRAW_ORDER = [BACK_DIM, BACK_LIT, 0, 1, 2, 3, 4, 5, 6, 7];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

type Arc = {
  from: number;
  to: number;
  points: Float32Array;
  speed: number;
  offset: number;
  lastU: number;
};

function buildScene(count: number) {
  const rand = mulberry32(1617);
  const pos = new Float32Array(count * 3);
  const start = new Float32Array(count * 3);
  const delay = new Float32Array(count);
  const seed = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    pos[i * 3] = Math.cos(theta) * r;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(theta) * r;

    const u = rand() * 2 - 1;
    const phi = rand() * TAU;
    const s = Math.sqrt(1 - u * u);
    const dist = 1.7 + rand() * 1.2;
    start[i * 3] = Math.cos(phi) * s * dist;
    start[i * 3 + 1] = u * dist;
    start[i * 3 + 2] = Math.sin(phi) * s * dist;

    delay[i] = rand() * 0.7;
    seed[i] = rand();
  }

  const hubCount = 22;
  const hubs: number[] = [];
  for (let j = 0; j < hubCount; j += 1) {
    const jitter = (rand() - 0.5) * (count / hubCount) * 0.7;
    const index = Math.round(((j + 0.5) / hubCount) * count + jitter);
    hubs.push(Math.min(count - 1, Math.max(0, index)));
  }

  const arcs: Arc[] = [];
  const seen = new Set<string>();
  for (let a = 0; a < hubs.length; a += 1) {
    const candidates: { b: number; angle: number }[] = [];
    for (let b = 0; b < hubs.length; b += 1) {
      if (a === b) continue;
      const ia = hubs[a] * 3;
      const ib = hubs[b] * 3;
      const dot =
        pos[ia] * pos[ib] + pos[ia + 1] * pos[ib + 1] + pos[ia + 2] * pos[ib + 2];
      const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
      if (angle > 0.4 && angle < 1.6) candidates.push({ b, angle });
    }
    candidates.sort((p, q) => p.angle - q.angle);
    for (const { b, angle } of candidates.slice(0, 3)) {
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const ia = hubs[a] * 3;
      const ib = hubs[b] * 3;
      const sinAngle = Math.sin(angle);
      const lift = 0.1 + 0.2 * (angle / Math.PI);
      const points = new Float32Array((ARC_STEPS + 1) * 3);
      for (let s = 0; s <= ARC_STEPS; s += 1) {
        const t = s / ARC_STEPS;
        const wa = Math.sin((1 - t) * angle) / sinAngle;
        const wb = Math.sin(t * angle) / sinAngle;
        const h = 1 + lift * Math.sin(Math.PI * t);
        points[s * 3] = (pos[ia] * wa + pos[ib] * wb) * h;
        points[s * 3 + 1] = (pos[ia + 1] * wa + pos[ib + 1] * wb) * h;
        points[s * 3 + 2] = (pos[ia + 2] * wa + pos[ib + 2] * wb) * h;
      }
      arcs.push({
        from: a,
        to: b,
        points,
        speed: 0.16 + rand() * 0.16,
        offset: rand() * 1.6,
        lastU: 0,
      });
    }
  }

  const dustCount = 90;
  const dust = new Float32Array(dustCount * 4);
  for (let i = 0; i < dustCount; i += 1) {
    const u = rand() * 2 - 1;
    const phi = rand() * TAU;
    const s = Math.sqrt(1 - u * u);
    const dist = 1.9 + rand() * 1.2;
    dust[i * 4] = Math.cos(phi) * s * dist;
    dust[i * 4 + 1] = u * dist * 0.8;
    dust[i * 4 + 2] = Math.sin(phi) * s * dist;
    dust[i * 4 + 3] = rand();
  }

  return { count, pos, start, delay, seed, hubs, arcs, dust, dustCount, rand };
}

function makeSprite(color: Rgb) {
  const size = 128;
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const g = sprite.getContext("2d");
  if (!g) return sprite;
  const [r, gr, b] = color;
  const gradient = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, `rgba(${r},${gr},${b},1)`);
  gradient.addColorStop(0.16, `rgba(${r},${gr},${b},0.55)`);
  gradient.addColorStop(0.45, `rgba(${r},${gr},${b},0.14)`);
  gradient.addColorStop(1, `rgba(${r},${gr},${b},0)`);
  g.fillStyle = gradient;
  g.fillRect(0, 0, size, size);
  return sprite;
}

/**
 * Globo 3D interattivo dell'hero: sfera di punti in proiezione prospettica,
 * rete di archi luminosi tra nodi, tre orbite (pace / giustizia /
 * cooperazione), luce e inclinazione guidate dal cursore, trascinamento con
 * inerzia e onde al click. Canvas 2D, nessuna dipendenza aggiuntiva.
 * Con prefers-reduced-motion disegna un solo fotogramma statico.
 */
export function HeroGlobe({ zoom, className }: HeroGlobeProps) {
  const reduceMotion = usePrefersReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const zoomRef = useRef(zoom);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const compact = window.innerWidth < 768;
    const scene = buildScene(compact ? 820 : 1500);
    const { count, pos, start, delay, seed, hubs, arcs, dust, dustCount } = scene;

    const whiteSprite = makeSprite([228, 247, 255]);
    const cyanSprite = makeSprite([70, 190, 236]);
    const nodeSprites = MAJOR_NODES.map((node) => makeSprite(node.color));

    const sxA = new Float32Array(count);
    const syA = new Float32Array(count);
    const rA = new Float32Array(count);
    const level = new Uint8Array(count);
    const arcProj = new Float32Array(arcs.length * (ARC_STEPS + 1) * 3);
    const hubFlash = new Float32Array(hubs.length);
    const waves: { x: number; y: number; z: number; t0: number }[] = [];

    let cssW = 0;
    let cssH = 0;
    let dpr = 1;
    let quality = 1;
    let frameAvg = 0.016;
    let sampled = 0;
    let time = reduceMotion ? 12 : 0;
    let last = 0;
    let raf = 0;
    let inView = true;

    let rotY = -0.7;
    let velY = 0;
    let pitchDrag = 0;
    let dragDelta = 0;
    let dragging = false;
    let dragMoved = 0;
    let downInside = false;
    let tiltX = 0;
    let tiltY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let lightX = -0.5;
    let lightY = 0.55;
    let targetLightX = -0.5;
    let targetLightY = 0.55;
    let nextAutoWave = 2.1;
    let firstWaveDone = false;

    let cosY = 1;
    let sinY = 0;
    let cosX = 1;
    let sinX = 0;
    let ox = 0;
    let oy = 0;
    let oz = 0;

    const rotate = (x: number, y: number, z: number) => {
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      ox = x1;
      oy = y * cosX - z1 * sinX;
      oz = y * sinX + z1 * cosX;
    };

    const setRotation = (yaw: number, pitch: number) => {
      cosY = Math.cos(yaw);
      sinY = Math.sin(yaw);
      cosX = Math.cos(pitch);
      sinX = Math.sin(pitch);
    };

    const currentZoom = () => zoomRef.current?.get() ?? 1;
    const sphereRadiusCss = () => (cssW / OVERSCAN) * SPHERE_RATIO * currentZoom();

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      if (!W || !H) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, W, H);

      const R = sphereRadiusCss() * dpr;
      const cx = W / 2;
      const cy = H / 2;
      const bodyR = (R * CAMERA) / Math.sqrt(CAMERA * CAMERA - 1);
      const intro = easeOutCubic(clamp01(time / 2.2));
      const assembling = time < 2.4;
      const yaw = rotY + tiltY - (1 - easeOutExpo(clamp01(time / 2.6))) * 1.5;
      const pitch = 0.32 + tiltX + pitchDrag;

      const lLen = Math.hypot(lightX, lightY, 0.78);
      const Lx = lightX / lLen;
      const Ly = lightY / lLen;
      const Lz = 0.78 / lLen;

      /* Polvere di profondità */
      setRotation(rotY * 0.18 + tiltY * 0.6, pitch * 0.6);
      ctx.fillStyle = "rgb(190,232,250)";
      for (let i = 0; i < dustCount; i += 1) {
        rotate(dust[i * 4], dust[i * 4 + 1], dust[i * 4 + 2]);
        const k = CAMERA / (CAMERA - oz);
        if (k <= 0 || k > 5) continue;
        const twinkle = 0.6 + 0.4 * Math.sin(time * 0.9 + dust[i * 4 + 3] * TAU);
        ctx.globalAlpha = intro * twinkle * (oz > 0 ? 0.55 : 0.22);
        const size = (0.7 + dust[i * 4 + 3] * 1.3) * k * dpr;
        ctx.fillRect(cx + ox * R * k, cy - oy * R * k, size, size);
      }
      ctx.globalAlpha = 1;

      /* Alone esterno */
      // L'alone si esaurisce prima del bordo del canvas, anche con lo zoom di scena.
      const haloR = Math.min(R * 2.5, Math.min(W, H) * 0.495);
      const halo = ctx.createRadialGradient(cx, cy, Math.min(R * 0.7, haloR * 0.5), cx, cy, haloR);
      halo.addColorStop(0, `rgba(0,158,219,${0.3 * intro})`);
      halo.addColorStop(0.45, `rgba(0,120,180,${0.1 * intro})`);
      halo.addColorStop(1, "rgba(0,104,157,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(cx - haloR, cy - haloR, haloR * 2, haloR * 2);

      /* Orbite: il retro va disegnato prima del corpo sfera */
      setRotation(rotY * 0.3 + tiltY * 1.3, pitch);
      const ringBack = new Path2D();
      const ringFront = new Path2D();
      const nodeDraw: {
        x: number;
        y: number;
        k: number;
        z: number;
        sx: number;
        sy: number;
      }[] = [];
      for (let r = 0; r < RINGS.length; r += 1) {
        const ring = RINGS[r];
        const cA = Math.cos(ring.tiltX);
        const sA = Math.sin(ring.tiltX);
        const cB = Math.cos(ring.tiltZ);
        const sB = Math.sin(ring.tiltZ);
        const ringPoint = (theta: number) => {
          const x0 = ring.radius * Math.cos(theta);
          const z0 = ring.radius * Math.sin(theta);
          const y1 = -z0 * sA;
          const z1 = z0 * cA;
          rotate(x0 * cB - y1 * sB, x0 * sB + y1 * cB, z1);
        };

        const reveal = clamp01((time - 0.9 - r * 0.25) / 1.4);
        const steps = Math.round(RING_STEPS * easeOutCubic(reveal));
        let px = 0;
        let py = 0;
        let pz = 0;
        for (let s = 0; s <= steps; s += 1) {
          ringPoint((s / RING_STEPS) * TAU + ring.phase);
          const k = CAMERA / (CAMERA - oz);
          const x = cx + ox * R * k;
          const y = cy - oy * R * k;
          if (s > 0) {
            const path = (pz + oz) / 2 < 0 ? ringBack : ringFront;
            path.moveTo(px, py);
            path.lineTo(x, y);
          }
          px = x;
          py = y;
          pz = oz;
        }

        ringPoint(ring.phase + time * ring.speed);
        const k = CAMERA / (CAMERA - oz);
        const len = Math.hypot(ox, oy, oz) || 1;
        const surfaceK = CAMERA / (CAMERA - oz / len);
        nodeDraw.push({
          x: cx + ox * R * k,
          y: cy - oy * R * k,
          k,
          z: oz,
          sx: cx + (ox / len) * R * surfaceK,
          sy: cy - (oy / len) * R * surfaceK,
        });
      }

      const drawNode = (index: number) => {
        const node = nodeDraw[index];
        const [cr, cg, cb] = MAJOR_NODES[index].color;
        const reveal = clamp01((time - 1.5 - index * 0.25) / 0.9);
        if (reveal <= 0) return;
        const front = node.z >= 0;
        const depthAlpha = (front ? 1 : 0.5) * reveal;

        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${0.3 * depthAlpha})`;
        ctx.lineWidth = dpr;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(node.sx, node.sy);
        ctx.stroke();

        const pulse = 1 + 0.12 * Math.sin(time * 1.6 + index * 2.1);
        const glow = R * 0.42 * node.k * pulse;
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.9 * depthAlpha;
        ctx.drawImage(nodeSprites[index], node.x - glow / 2, node.y - glow / 2, glow, glow);
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = depthAlpha;
        ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, R * 0.03 * node.k, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.55)`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, R * 0.062 * node.k * pulse, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = 1;
      };

      ctx.lineWidth = dpr;
      ctx.strokeStyle = `rgba(150,214,244,${0.12 * intro})`;
      ctx.stroke(ringBack);
      for (let i = 0; i < nodeDraw.length; i += 1) {
        if (nodeDraw[i].z < 0) drawNode(i);
      }

      /* Corpo sfera illuminato dal cursore */
      const body = ctx.createRadialGradient(
        cx + Lx * R * 0.5,
        cy - Ly * R * 0.5,
        R * 0.04,
        cx,
        cy,
        bodyR,
      );
      body.addColorStop(0, "rgba(34,132,186,0.96)");
      body.addColorStop(0.34, "rgba(11,64,102,0.97)");
      body.addColorStop(0.74, "rgba(6,30,52,0.98)");
      body.addColorStop(1, "rgba(4,17,31,0.98)");
      ctx.globalAlpha = intro;
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, bodyR, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;

      /* Punti della superficie */
      setRotation(yaw, pitch);
      const dotBase = R * 0.0056;
      for (let i = 0; i < count; i += 1) {
        const i3 = i * 3;
        let x = pos[i3];
        let y = pos[i3 + 1];
        let z = pos[i3 + 2];

        let boost = 0;
        for (let w = 0; w < waves.length; w += 1) {
          const wave = waves[w];
          const progress = (time - wave.t0) / WAVE_DURATION;
          if (progress < 0 || progress > 1) continue;
          const dot = x * wave.x + y * wave.y + z * wave.z;
          const angle = Math.acos(dot > 1 ? 1 : dot < -1 ? -1 : dot);
          const diff = (angle - progress * Math.PI * 1.05) / 0.17;
          boost += Math.exp(-diff * diff) * (1 - progress);
        }

        if (assembling) {
          const e = easeOutExpo(clamp01((time - delay[i]) / 1.6));
          x = start[i3] + (x - start[i3]) * e;
          y = start[i3 + 1] + (y - start[i3 + 1]) * e;
          z = start[i3 + 2] + (z - start[i3 + 2]) * e;
        }

        const lift = 1 + boost * 0.07;
        rotate(x * lift, y * lift, z * lift);
        const k = CAMERA / (CAMERA - oz);
        if (k <= 0 || k > 6) {
          level[i] = SKIP;
          continue;
        }
        sxA[i] = cx + ox * R * k;
        syA[i] = cy - oy * R * k;
        rA[i] = dotBase * (0.75 + seed[i] * 0.7) * k * (1 + boost * 0.9);

        if (oz < 0) {
          level[i] = boost > 0.3 ? BACK_LIT : BACK_DIM;
          continue;
        }
        const ndl = ox * Lx + oy * Ly + oz * Lz;
        const lit = ndl > 0 ? ndl : 0;
        let brightness = 0.2 + 0.72 * lit + Math.pow(lit, 14) * 0.5 + boost * 0.9;
        brightness *= 0.84 + 0.16 * Math.sin(time * 1.5 + seed[i] * TAU);
        const bucket = Math.floor(clamp01(brightness) * (FRONT_LEVELS - 1) + 0.5);
        level[i] = bucket;
      }

      for (let b = 0; b < DRAW_ORDER.length; b += 1) {
        const bucket = DRAW_ORDER[b];
        ctx.fillStyle = BUCKET_STYLES[bucket];
        ctx.beginPath();
        for (let i = 0; i < count; i += 1) {
          if (level[i] !== bucket) continue;
          ctx.moveTo(sxA[i] + rA[i], syA[i]);
          ctx.arc(sxA[i], syA[i], rA[i], 0, TAU);
        }
        ctx.fill();
      }

      /* Archi di connessione */
      const arcReveal = clamp01((time - 1.3) / 1.2);
      if (arcReveal > 0) {
        const arcBack = new Path2D();
        const arcFront = new Path2D();
        const stride = (ARC_STEPS + 1) * 3;
        for (let a = 0; a < arcs.length; a += 1) {
          const arc = arcs[a];
          const grow = clamp01((time - 1.3 - a * 0.07) / 1.1);
          const steps = Math.round(ARC_STEPS * easeOutCubic(grow));
          for (let s = 0; s <= ARC_STEPS; s += 1) {
            rotate(arc.points[s * 3], arc.points[s * 3 + 1], arc.points[s * 3 + 2]);
            const k = CAMERA / (CAMERA - oz);
            const o = a * stride + s * 3;
            arcProj[o] = cx + ox * R * k;
            arcProj[o + 1] = cy - oy * R * k;
            arcProj[o + 2] = oz;
            if (s > 0 && s <= steps) {
              const path = (arcProj[o - 1] + oz) / 2 < 0 ? arcBack : arcFront;
              path.moveTo(arcProj[o - 3], arcProj[o - 2]);
              path.lineTo(arcProj[o], arcProj[o + 1]);
            }
          }
        }
        ctx.lineWidth = 1.15 * dpr;
        ctx.strokeStyle = `rgba(120,200,236,${0.13 * arcReveal})`;
        ctx.stroke(arcBack);
        ctx.strokeStyle = `rgba(160,224,250,${0.6 * arcReveal})`;
        ctx.stroke(arcFront);

        if (time > 2.4) {
          ctx.lineCap = "round";
          for (let a = 0; a < arcs.length; a += 1) {
            const arc = arcs[a];
            const u = (time * arc.speed + arc.offset) % 1.6;
            if (u < arc.lastU && arc.lastU >= 1) hubFlash[arc.from] = 0.6;
            if (arc.lastU < 1 && u >= 1) hubFlash[arc.to] = 1;
            arc.lastU = u;
            if (u >= 1) continue;

            const head = u * ARC_STEPS;
            const headIndex = Math.floor(head);
            const base = a * stride;
            const tail = 7;
            for (let t = 0; t < tail; t += 1) {
              const s = headIndex - t;
              if (s < 1) break;
              const o = base + s * 3;
              const front = arcProj[o + 2] >= 0;
              const alpha = (1 - t / tail) * (front ? 0.95 : 0.22);
              ctx.strokeStyle = `rgba(226,247,255,${alpha})`;
              ctx.lineWidth = (2.2 - t * 0.2) * dpr;
              ctx.beginPath();
              ctx.moveTo(arcProj[o - 3], arcProj[o - 2]);
              ctx.lineTo(arcProj[o], arcProj[o + 1]);
              ctx.stroke();
            }
            const o = base + Math.max(0, headIndex) * 3;
            if (arcProj[o + 2] >= 0) {
              const size = R * 0.2;
              ctx.globalCompositeOperation = "lighter";
              ctx.drawImage(
                whiteSprite,
                arcProj[o] - size / 2,
                arcProj[o + 1] - size / 2,
                size,
                size,
              );
              ctx.globalCompositeOperation = "source-over";
            }
          }
          ctx.lineCap = "butt";
        }
      }

      /* Nodi della rete */
      const hubReveal = clamp01((time - 1.1) / 1);
      if (hubReveal > 0) {
        for (let h = 0; h < hubs.length; h += 1) {
          const index = hubs[h];
          if (level[index] === SKIP) continue;
          const front = level[index] < FRONT_LEVELS;
          const flash = hubFlash[h];
          const size = R * (0.15 + flash * 0.2) * (front ? 1 : 0.7);
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = hubReveal * (front ? 0.75 + flash * 0.25 : 0.14);
          ctx.drawImage(
            flash > 0.3 ? whiteSprite : cyanSprite,
            sxA[index] - size / 2,
            syA[index] - size / 2,
            size,
            size,
          );
          ctx.globalCompositeOperation = "source-over";
          if (front) {
            ctx.globalAlpha = hubReveal;
            ctx.fillStyle = "rgb(236,250,255)";
            ctx.beginPath();
            ctx.arc(sxA[index], syA[index], R * 0.013, 0, TAU);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
      }

      /* Atmosfera sul bordo + riflesso speculare */
      ctx.globalCompositeOperation = "lighter";
      const rim = ctx.createRadialGradient(cx, cy, bodyR * 0.8, cx, cy, bodyR * 1.2);
      rim.addColorStop(0, "rgba(0,158,219,0)");
      rim.addColorStop(0.62, `rgba(70,186,234,${0.2 * intro})`);
      rim.addColorStop(0.83, `rgba(160,224,250,${0.42 * intro})`);
      rim.addColorStop(1, "rgba(0,158,219,0)");
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(cx, cy, bodyR * 1.2, 0, TAU);
      ctx.fill();

      const specular = R * 1.7;
      ctx.globalAlpha = 0.2 * intro;
      ctx.drawImage(
        whiteSprite,
        cx + Lx * R * 0.55 - specular / 2,
        cy - Ly * R * 0.55 - specular / 2,
        specular,
        specular,
      );
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      /* Orbite e nodi in primo piano */
      ctx.lineWidth = dpr;
      ctx.strokeStyle = `rgba(190,232,250,${0.3 * intro})`;
      ctx.stroke(ringFront);
      for (let i = 0; i < nodeDraw.length; i += 1) {
        if (nodeDraw[i].z >= 0) drawNode(i);
      }

      /* Dissolvenza ai bordi: orbite e polvere non mostrano mai il taglio del canvas */
      ctx.globalCompositeOperation = "destination-in";
      const edge = Math.min(W, H) / 2;
      const fade = ctx.createRadialGradient(cx, cy, edge * 0.8, cx, cy, edge);
      fade.addColorStop(0, "rgba(0,0,0,1)");
      fade.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";

      /* Etichette DOM agganciate ai nodi orbitali */
      const wrapLeft = wrap.getBoundingClientRect().left;
      const viewportW = window.innerWidth;
      for (let i = 0; i < nodeDraw.length; i += 1) {
        const label = labelRefs.current[i];
        if (!label) continue;
        const node = nodeDraw[i];
        const reveal = clamp01((time - 1.9 - i * 0.25) / 0.8);
        const hidden =
          node.z < 0 && Math.hypot(node.x - cx, node.y - cy) < bodyR * 1.05;
        // Le etichette si spengono dove passerebbero sotto la tipografia (sinistra su desktop, in basso su mobile).
        const clear = compact
          ? 1 - clamp01((node.y - cy - R * 0.95) / (R * 0.35))
          : clamp01((node.x - cx + R * 1.15) / (R * 0.4));
        const alpha = hidden ? 0 : reveal * clear * (node.z >= 0 ? 1 : 0.45);
        label.style.opacity = alpha.toFixed(3);
        const gap = (R * 0.09) / dpr + 6;
        // Su schermi stretti l'etichetta passa a sinistra del nodo invece di uscire dal viewport.
        const flip = wrapLeft + node.x / dpr + gap + 150 > viewportW;
        label.style.flexDirection = flip ? "row-reverse" : "row";
        label.style.transform = flip
          ? `translate3d(${(node.x / dpr - gap).toFixed(1)}px, ${(node.y / dpr).toFixed(1)}px, 0) translate(-100%, -50%)`
          : `translate3d(${(node.x / dpr + gap).toFixed(1)}px, ${(node.y / dpr).toFixed(1)}px, 0) translateY(-50%)`;
      }
    };

    const addWave = (x: number, y: number, z: number) => {
      if (waves.length > 3) waves.shift();
      waves.push({ x, y, z, t0: time });
    };

    const addWaveFromView = (vx: number, vy: number, vz: number) => {
      const yaw = rotY + tiltY;
      const pitch = 0.32 + tiltX + pitchDrag;
      const cP = Math.cos(pitch);
      const sP = Math.sin(pitch);
      const y1 = vy * cP + vz * sP;
      const z1 = -vy * sP + vz * cP;
      const cYaw = Math.cos(yaw);
      const sYaw = Math.sin(yaw);
      addWave(vx * cYaw - z1 * sYaw, y1, vx * sYaw + z1 * cYaw);
    };

    const step = (now: number) => {
      raf = 0;
      const elapsed = last ? (now - last) / 1000 : 0.016;
      const dt = Math.min(0.05, elapsed);
      last = now;
      time += dt;

      // Qualità adattiva: se il dispositivo non tiene il ritmo, si riduce la risoluzione interna.
      if (time > 3.2 && quality > 0.5 && elapsed < 0.25) {
        frameAvg += (elapsed - frameAvg) * 0.06;
        sampled += 1;
        if (sampled > 70 && frameAvg > 0.027) {
          quality = quality > 0.8 ? 0.72 : 0.5;
          sampled = 0;
          frameAvg = 0.016;
          resize();
        }
      }

      const ease = Math.min(1, dt * 4);
      tiltX += (targetTiltX - tiltX) * ease;
      tiltY += (targetTiltY - tiltY) * ease;
      lightX += (targetLightX - lightX) * ease;
      lightY += (targetLightY - lightY) * ease;

      if (dragging) {
        rotY += dragDelta;
        velY = velY * 0.6 + (dragDelta / dt) * 0.4;
        dragDelta = 0;
      } else {
        rotY += (0.085 + velY) * dt;
        velY *= Math.exp(-2.2 * dt);
        pitchDrag *= Math.exp(-0.9 * dt);
      }

      for (let h = 0; h < hubFlash.length; h += 1) {
        hubFlash[h] *= Math.exp(-3 * dt);
      }
      for (let w = waves.length - 1; w >= 0; w -= 1) {
        if (time - waves[w].t0 > WAVE_DURATION) waves.splice(w, 1);
      }
      if (time > nextAutoWave) {
        if (!firstWaveDone) {
          addWaveFromView(0, 0, 1);
          firstWaveDone = true;
        } else {
          const index = hubs[Math.floor(scene.rand() * hubs.length)] * 3;
          addWave(pos[index], pos[index + 1], pos[index + 2]);
        }
        nextAutoWave = time + 5.5 + scene.rand() * 4;
      }

      render();
      schedule();
    };

    const schedule = () => {
      if (reduceMotion || raf || !inView || document.hidden) return;
      raf = requestAnimationFrame(step);
    };

    const resize = () => {
      cssW = wrap.clientWidth;
      cssH = wrap.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2) * quality;
      if (cssW * dpr > 1900 * quality) dpr = (1900 * quality) / cssW;
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
      render();
    };

    const pointerOffset = (event: PointerEvent | MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      return {
        dx: event.clientX - (rect.left + rect.width / 2),
        dy: event.clientY - (rect.top + rect.height / 2),
      };
    };

    const isInteractive = (target: EventTarget | null) =>
      target instanceof Element &&
      Boolean(target.closest("a, button, input, textarea, select, [role='button']"));

    const insideSphere = (dx: number, dy: number) =>
      inView && Math.hypot(dx, dy) <= sphereRadiusCss() * 1.08;

    const onPointerMove = (event: PointerEvent) => {
      if (!inView) return;
      const { dx, dy } = pointerOffset(event);
      if (event.pointerType !== "touch") {
        const nx = Math.max(-1, Math.min(1, dx / (window.innerWidth * 0.5)));
        const ny = Math.max(-1, Math.min(1, dy / (window.innerHeight * 0.5)));
        targetTiltY = nx * 0.5;
        targetTiltX = ny * 0.3;
        targetLightX = nx * 1.15;
        targetLightY = -ny * 1.15;
      }
      if (dragging) {
        dragDelta += event.movementX * 0.0062;
        pitchDrag = Math.max(-0.7, Math.min(0.7, pitchDrag + event.movementY * 0.004));
        dragMoved += Math.abs(event.movementX) + Math.abs(event.movementY);
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || isInteractive(event.target)) return;
      const { dx, dy } = pointerOffset(event);
      downInside = insideSphere(dx, dy);
      if (!downInside) return;
      dragMoved = 0;
      if (event.pointerType !== "touch" && finePointer) {
        dragging = true;
        velY = 0;
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      const wasInside = downInside;
      dragging = false;
      downInside = false;
      if (!wasInside || dragMoved > 6) return;
      const { dx, dy } = pointerOffset(event);
      const radius = sphereRadiusCss();
      const vx = dx / radius;
      const vy = -dy / radius;
      const d2 = vx * vx + vy * vy;
      if (d2 > 1) return;
      addWaveFromView(vx, vy, Math.sqrt(1 - d2));
    };

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0 || isInteractive(event.target)) return;
      const { dx, dy } = pointerOffset(event);
      if (insideSphere(dx, dy)) event.preventDefault();
    };

    const onVisibility = () => {
      last = 0;
      schedule();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    const intersection = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        last = 0;
        schedule();
      },
      { rootMargin: "80px" },
    );
    intersection.observe(wrap);
    resize();

    if (!reduceMotion) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
      window.addEventListener("mousedown", onMouseDown);
      document.addEventListener("visibilitychange", onVisibility);
      schedule();
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduceMotion]);

  return (
    <div
      className={cn("relative aspect-square w-full", className)}
      role="img"
      aria-label="Globo tridimensionale interattivo: una rete di nodi luminosi unisce pace, giustizia e cooperazione"
    >
      <div
        ref={wrapRef}
        className="pointer-events-none absolute -inset-[25%] select-none"
        aria-hidden
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
        {MAJOR_NODES.map((node, index) => (
          <span
            key={node.label}
            ref={(element) => {
              labelRefs.current[index] = element;
            }}
            className="absolute top-0 left-0 flex items-center gap-2 text-[0.6rem] font-semibold tracking-[0.28em] whitespace-nowrap text-white/90 uppercase opacity-0 will-change-transform sm:text-[0.66rem]"
          >
            <span className="h-px w-5 bg-white/50" />
            {node.label}
          </span>
        ))}
      </div>
    </div>
  );
}
