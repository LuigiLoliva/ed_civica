import {
  PALETTE,
  add,
  clamp,
  damp,
  drawBox,
  drawCaps,
  drawGlow,
  drawSphere,
  easeOutCubic,
  lerp,
  mix3,
  mixRgb,
  polygon,
  project,
  rgba,
  ringBasis,
  ringPoint,
  scale,
  strokeRing3d,
  type Camera,
  type Projected,
  type Rgb,
  type Vec3,
} from "./scene3d";
import type { StageFrame } from "./use-canvas-stage";

export type ScalePart = "left" | "center" | "right";

export type ScalesInput = {
  /** Pesi (0–3) attesi su ciascun piatto. */
  left: number;
  right: number;
  /** Parte collegata al pilastro attivo e a quello sfiorato. */
  activePart: ScalePart;
  hoverPart: ScalePart | null;
  pointer: { x: number; y: number } | null;
  reduceMotion: boolean;
  fonts: { serif: string; sans: string };
  labels: Record<ScalePart, string>;
};

type Pulse = { part: ScalePart; t0: number };
type Spark = {
  part: ScalePart;
  p: Vec3;
  v: Vec3;
  t0: number;
  life: number;
  color: Rgb;
  size: number;
};
type Dust = {
  p: Vec3;
  phase: number;
  speed: number;
  size: number;
  tone: number;
};
type HitZone = { part: ScalePart; x: number; y: number; r: number };

export type ScalesSim = {
  theta: number;
  omega: number;
  swing: [number, number];
  swingV: [number, number];
  weights: [number[], number[]];
  glow: Record<ScalePart, number>;
  yaw: number;
  pitch: number;
  light: { x: number; y: number };
  /** Centro e scala della scena in px: guida i bagliori CSS dello stage. */
  view: { cx: number; cy: number; unit: number };
  lastPointerX: number | null;
  introT0: number | null;
  pulses: Pulse[];
  sparks: Spark[];
  dust: Dust[];
  hits: HitZone[];
  seed: number;
};

const PIVOT: Vec3 = { x: 0, y: 0.72, z: 0 };
const ORBIT_CENTER: Vec3 = { x: 0, y: 0.1, z: 0 };
const FLOOR_Y = -1.44;
const BEAM_HALF = 1.38;
const HANG = 0.95;
const PAN_R = 0.5;
const PAN_DEPTH = 0.17;
const MAX_TILT = 0.44;
const FLAT = { u: { x: 1, y: 0, z: 0 }, v: { x: 0, y: 0, z: 1 } };

const RINGS = [
  { radius: 2.0, tilt: 0.24, azimuth: 0.4, spin: 0.00004, bead: 0.00021 },
  { radius: 1.78, tilt: 1.12, azimuth: 2.1, spin: -0.00007, bead: -0.00016 },
  { radius: 1.56, tilt: 1.46, azimuth: 0.9, spin: 0.0001, bead: 0.00027 },
] as const;

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createScalesSim(): ScalesSim {
  const rand = mulberry(16);
  const dust: Dust[] = [];
  for (let i = 0; i < 130; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.5 + Math.pow(rand(), 0.7) * 2.7;
    dust.push({
      p: {
        x: Math.cos(a) * r,
        y: -1.3 + rand() * 3.3,
        z: Math.sin(a) * r * 0.85,
      },
      phase: rand() * Math.PI * 2,
      speed: 0.4 + rand() * 0.9,
      size: 0.012 + rand() * 0.02,
      tone: rand(),
    });
  }
  return {
    theta: 0,
    omega: 0,
    swing: [0, 0],
    swingV: [0, 0],
    weights: [
      [1, 1, 0],
      [1, 1, 0],
    ],
    glow: { left: 0, center: 1, right: 0 },
    yaw: 0.44,
    pitch: 0.2,
    light: { x: 0, y: 0 },
    view: { cx: 0, cy: 0, unit: 0 },
    lastPointerX: null,
    introT0: null,
    pulses: [],
    sparks: [],
    dust,
    hits: [],
    seed: 1,
  };
}

/** Feedback alla selezione di un pilastro: onda + scintille dalla parte. */
export function emitScalesFeedback(
  sim: ScalesSim,
  part: ScalePart,
  time: number,
) {
  sim.pulses.push({ part, t0: time });
  if (sim.pulses.length > 6) sim.pulses.shift();
  const rand = mulberry(sim.seed++ * 7919);
  const color =
    part === "left"
      ? PALETTE.olive
      : part === "right"
        ? PALETTE.sky
        : PALETTE.ice;
  for (let i = 0; i < 22; i++) {
    const a = rand() * Math.PI * 2;
    const speed = 0.004 + rand() * 0.009;
    sim.sparks.push({
      part,
      p: { x: (rand() - 0.5) * 0.5, y: 0.05, z: (rand() - 0.5) * 0.5 },
      v: {
        x: Math.cos(a) * speed,
        y: 0.006 + rand() * 0.012,
        z: Math.sin(a) * speed,
      },
      t0: time + rand() * 140,
      life: 900 + rand() * 900,
      color,
      size: 0.02 + rand() * 0.03,
    });
  }
  if (sim.sparks.length > 110) sim.sparks.splice(0, sim.sparks.length - 110);
}

function circlePoints(
  cam: Camera,
  center: Vec3,
  radius: number,
  basis: { u: Vec3; v: Vec3 },
  count: number,
): Projected[] {
  const pts: Projected[] = [];
  for (let i = 0; i < count; i++) {
    pts.push(
      project(
        ringPoint(center, radius, basis, (i / count) * Math.PI * 2),
        cam,
      ),
    );
  }
  return pts;
}

function drawCylinder(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  base: Vec3,
  height: number,
  radius: number,
  light: { x: number; y: number },
  tones: { top: Rgb; lit: Rgb; dark: Rgb },
  alpha: number,
) {
  const bottom = circlePoints(cam, base, radius, FLAT, 36);
  const top = circlePoints(
    cam,
    { x: base.x, y: base.y + height, z: base.z },
    radius,
    FLAT,
    36,
  );
  let minI = 0;
  let maxI = 0;
  for (let i = 1; i < top.length; i++) {
    if (top[i]!.x < top[minI]!.x) minI = i;
    if (top[i]!.x > top[maxI]!.x) maxI = i;
  }
  const x0 = top[minI]!.x;
  const x1 = top[maxI]!.x;
  const hl = clamp(0.5 + (light.x - (x0 + x1) / 2) / ((x1 - x0) * 3), 0.18, 0.82);
  const side = ctx.createLinearGradient(x0, 0, x1, 0);
  side.addColorStop(0, rgba(tones.dark, alpha));
  side.addColorStop(hl, rgba(tones.lit, alpha));
  side.addColorStop(1, rgba(tones.dark, alpha));
  ctx.fillStyle = side;
  polygon(ctx, bottom);
  ctx.fill();
  polygon(ctx, [top[minI]!, top[maxI]!, bottom[maxI]!, bottom[minI]!]);
  ctx.fill();
  polygon(ctx, top);
  ctx.fillStyle = rgba(tones.top, alpha);
  ctx.fill();
  ctx.strokeStyle = rgba(PALETTE.white, 0.5 * alpha);
  ctx.lineWidth = 1;
  ctx.stroke();
}

export function renderScales(
  frame: StageFrame,
  sim: ScalesSim,
  input: ScalesInput,
) {
  const { ctx, w, h, dt } = frame;
  const still = input.reduceMotion;
  const time = still ? 0 : frame.time;
  const wide = w >= 1080;

  // --- Camera -------------------------------------------------------------
  const unit = wide
    ? Math.min(h / 4.9, w * 0.158, 230)
    : Math.min(h / 4.55, w / 4.5);
  const cx = wide ? Math.min(w - unit * 2.35, w * 0.7) : w / 2;
  const cy = h * 0.5 + unit * (wide ? 0.1 : 0.02);
  const pointer = still ? null : input.pointer;
  const nx = pointer ? clamp((pointer.x - cx) / (unit * 3.2), -1, 1) : 0;
  const ny = pointer ? clamp((pointer.y - cy) / (unit * 2.6), -1, 1) : 0;
  const yawTarget = 0.44 + nx * 0.34 + Math.sin(time / 5200) * 0.06;
  const pitchTarget = 0.2 - ny * 0.11 + Math.sin(time / 6900) * 0.015;
  const camEase = still ? 1 : damp(0.07, dt);
  sim.yaw = lerp(sim.yaw, yawTarget, camEase);
  sim.pitch = lerp(sim.pitch, pitchTarget, camEase);
  const cam: Camera = {
    yaw: sim.yaw,
    pitch: sim.pitch,
    dist: 7.2,
    unit,
    cx,
    cy,
  };

  // --- Intro --------------------------------------------------------------
  if (frame.entered && sim.introT0 === null) sim.introT0 = frame.time;
  const introRaw = still
    ? 1
    : sim.introT0 === null
      ? 0
      : clamp((frame.time - sim.introT0) / 2100);
  const rise = easeOutCubic(clamp(introRaw / 0.55));
  const spread = easeOutCubic(clamp((introRaw - 0.22) / 0.55));
  const drop = easeOutCubic(clamp((introRaw - 0.42) / 0.58));
  const veil = easeOutCubic(clamp(introRaw * 1.6));

  // --- Luce ---------------------------------------------------------------
  const lightTarget = pointer ?? {
    x: cx + Math.cos(time / 2600) * unit * 1.5,
    y: cy - unit * 1.55 + Math.sin(time / 3300) * unit * 0.4,
  };
  if (sim.light.x === 0 && sim.light.y === 0) sim.light = { ...lightTarget };
  const lightEase = still ? 1 : damp(0.12, dt);
  sim.light.x = lerp(sim.light.x, lightTarget.x, lightEase);
  sim.light.y = lerp(sim.light.y, lightTarget.y, lightEase);
  const light = sim.light;
  const lv = {
    x: (light.x - cx) / (unit * 2.2),
    y: (cy - light.y) / (unit * 2.2),
    z: -1.25,
  };
  const lvLen = Math.hypot(lv.x, lv.y, lv.z);
  const lightView = { x: lv.x / lvLen, y: lv.y / lvLen, z: lv.z / lvLen };

  // --- Fisica della bilancia ----------------------------------------------
  const targets: [number[], number[]] = [
    [0, 1, 2].map((i) => (i < input.left ? 1 : 0)),
    [0, 1, 2].map((i) => (i < input.right ? 1 : 0)),
  ];
  for (let s = 0; s < 2; s++) {
    for (let i = 0; i < 3; i++) {
      const stagger = still ? 1 : damp(0.085 - i * 0.012, dt);
      sim.weights[s]![i] = lerp(sim.weights[s]![i]!, targets[s]![i]!, stagger);
    }
  }
  const massL = sim.weights[0]!.reduce((a, b) => a + b, 0);
  const massR = sim.weights[1]!.reduce((a, b) => a + b, 0);

  let press = 0;
  let wind = 0;
  if (pointer) {
    for (const zone of sim.hits) {
      if (zone.part === "center") continue;
      const d = Math.hypot(pointer.x - zone.x, pointer.y - zone.y) / zone.r;
      if (d < 1.25) {
        press += (zone.part === "right" ? 1 : -1) * (1 - d / 1.25) * 0.085;
      }
    }
    if (sim.lastPointerX !== null) {
      wind = clamp((pointer.x - sim.lastPointerX) / unit, -0.4, 0.4);
    }
    sim.lastPointerX = pointer.x;
  } else {
    sim.lastPointerX = null;
  }

  const thetaTarget = clamp(
    (massR - massL) * 0.15 + press + Math.sin(time / 1700) * 0.012,
    -MAX_TILT,
    MAX_TILT,
  );
  if (still) {
    sim.theta = clamp((input.right - input.left) * 0.15, -MAX_TILT, MAX_TILT);
    sim.omega = 0;
    sim.swing = [0, 0];
  } else {
    const prevOmega = sim.omega;
    sim.omega += (thetaTarget - sim.theta) * 0.0105 * dt;
    sim.omega *= Math.pow(0.93, dt);
    sim.theta += sim.omega * dt;
    const kick = sim.omega - prevOmega;
    for (let s = 0; s < 2; s++) {
      const sign = s === 0 ? 1 : -1;
      sim.swingV[s] =
        (sim.swingV[s]! +
          (-0.016 * sim.swing[s]! * dt + kick * 2.6 * sign + wind * 0.012)) *
        Math.pow(0.972, dt);
      sim.swing[s] = clamp(sim.swing[s]! + sim.swingV[s]! * dt, -0.5, 0.5);
    }
  }

  const glowEase = still ? 1 : damp(0.1, dt);
  (["left", "center", "right"] as const).forEach((part) => {
    const target =
      (input.activePart === part ? 0.7 : 0) +
      (input.hoverPart === part ? 0.55 : 0);
    sim.glow[part] = lerp(sim.glow[part], Math.min(1, target), glowEase);
  });

  // --- Geometria derivata -------------------------------------------------
  const theta = sim.theta;
  const beamDir: Vec3 = { x: Math.cos(theta), y: -Math.sin(theta), z: 0 };
  const beamUp: Vec3 = { x: Math.sin(theta), y: Math.cos(theta), z: 0 };
  const plinthTop = FLOOR_Y + 0.2;
  const pivot = mix3({ x: 0, y: plinthTop, z: 0 }, PIVOT, rise);
  const reach = BEAM_HALF * spread;
  const ends: [Vec3, Vec3] = [
    add(pivot, scale(beamDir, -reach)),
    add(pivot, scale(beamDir, reach)),
  ];

  ctx.clearRect(0, 0, w, h);

  // L'alone d'atmosfera e la luce ampia sono livelli CSS (vedi syncStageGlow):
  // qui resta solo il nucleo caldo della luce.
  sim.view = { cx, cy: cy - unit * 0.1, unit };
  drawGlow(ctx, light.x, light.y, unit * 0.9, PALETTE.ice, 0.14 * veil);

  // --- Pavimento ----------------------------------------------------------
  const floor = project({ x: 0, y: FLOOR_Y, z: 0 }, cam);
  ctx.save();
  ctx.translate(floor.x, floor.y);
  ctx.scale(1, Math.max(0.08, Math.sin(cam.pitch) * 1.05));
  const pool = ctx.createRadialGradient(0, 0, 0, 0, 0, floor.s * 2.7);
  pool.addColorStop(0, rgba(PALETTE.sky, 0.3 * veil));
  pool.addColorStop(0.35, rgba(PALETTE.onu, 0.13 * veil));
  pool.addColorStop(1, rgba(PALETTE.onu, 0));
  ctx.fillStyle = pool;
  ctx.beginPath();
  ctx.arc(0, 0, floor.s * 2.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  const ripple = (time / 5200) % 1;
  for (let i = 0; i < 5; i++) {
    const k = (i + ripple) / 5;
    strokeRing3d(ctx, cam, { x: 0, y: FLOOR_Y, z: 0 }, 0.7 + k * 2.7, FLAT, {
      color: PALETTE.sky,
      alpha: 0.34 * (1 - k) * veil,
      width: 1,
      segments: 60,
    });
  }

  // --- Pulviscolo (dietro) ------------------------------------------------
  const dustCount = wide ? sim.dust.length : Math.round(sim.dust.length * 0.5);
  const dustFront: { p: Projected; r: number; a: number; c: Rgb }[] = [];
  for (let i = 0; i < dustCount; i++) {
    const d = sim.dust[i]!;
    const t = time * 0.00022 * d.speed + d.phase;
    const p = project(
      {
        x: d.p.x + Math.sin(t) * 0.16,
        y: d.p.y + Math.sin(t * 0.7 + d.phase) * 0.22,
        z: d.p.z + Math.cos(t * 0.9) * 0.16,
      },
      cam,
    );
    const twinkle = 0.45 + 0.55 * Math.sin(time * 0.0011 * d.speed + d.phase * 3);
    const lit = clamp(1 - Math.hypot(p.x - light.x, p.y - light.y) / (unit * 2.4));
    const a = (0.12 + twinkle * 0.26 + lit * 0.5) * veil;
    const r = d.size * p.s * (1 + lit * 0.6) * (i % 9 === 0 ? 2.6 : 1.25);
    const c = d.tone > 0.82 ? PALETTE.olive : d.tone > 0.4 ? PALETTE.sky : PALETTE.ice;
    if (p.z < -0.5) dustFront.push({ p, r, a, c });
    else drawGlow(ctx, p.x, p.y, r, c, a * 0.8);
  }

  // --- Anelli armillari (metà lontana) ------------------------------------
  const ringBases = RINGS.map((ring) =>
    ringBasis(ring.tilt, ring.azimuth + time * ring.spin),
  );
  const ringScale = 0.72 + 0.28 * veil;
  RINGS.forEach((ring, i) => {
    strokeRing3d(ctx, cam, ORBIT_CENTER, ring.radius * ringScale, ringBases[i]!, {
      color: i === 1 ? PALETTE.olive : PALETTE.sky,
      alpha: (i === 0 ? 0.95 : 0.74) * veil,
      width: i === 0 ? 1.9 : 1.35,
      pass: "back",
      sweep: veil,
      segments: 96,
    });
  });

  // Tacche sull'anello orizzonte (strumento di misura)
  const tickBasis = ringBases[0]!;
  const tickR = RINGS[0].radius * ringScale;
  ctx.lineCap = "round";
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const major = i % 6 === 0;
    const p0 = project(ringPoint(ORBIT_CENTER, tickR, tickBasis, a), cam);
    const p1 = project(
      ringPoint(ORBIT_CENTER, tickR - (major ? 0.1 : 0.05), tickBasis, a),
      cam,
    );
    const depth = clamp(0.5 - (p0.z / tickR) * 0.5);
    ctx.strokeStyle = rgba(
      PALETTE.ice,
      (major ? 0.55 : 0.26) * (0.25 + depth * 0.75) * veil,
    );
    ctx.lineWidth = major ? 1.3 : 1;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }

  // --- Basamento e colonna ------------------------------------------------
  const metal = {
    top: mixRgb(PALETTE.ice, PALETTE.sky, 0.25),
    lit: PALETTE.ice,
    dark: mixRgb(PALETTE.deep, PALETTE.navy, 0.45),
  };
  drawCylinder(ctx, cam, { x: 0, y: FLOOR_Y, z: 0 }, 0.08, 0.66, light, metal, veil);
  drawCylinder(
    ctx,
    cam,
    { x: 0, y: FLOOR_Y + 0.08, z: 0 },
    0.12,
    0.44,
    light,
    metal,
    veil,
  );

  const colBase = project({ x: 0, y: plinthTop, z: 0 }, cam);
  const colTop = project(pivot, cam);
  const r0 = 0.085 * colBase.s;
  const r1 = 0.042 * colTop.s;
  const colHl = clamp(0.5 + (light.x - colBase.x) / (unit * 2.4), 0.2, 0.8);
  const colGrad = ctx.createLinearGradient(colBase.x - r0, 0, colBase.x + r0, 0);
  colGrad.addColorStop(0, rgba(metal.dark, veil));
  colGrad.addColorStop(colHl, rgba(PALETTE.white, 0.96 * veil));
  colGrad.addColorStop(1, rgba(mixRgb(PALETTE.deep, PALETTE.navy, 0.6), veil));
  polygon(ctx, [
    { x: colBase.x - r0, y: colBase.y },
    { x: colBase.x + r0, y: colBase.y },
    { x: colTop.x + r1, y: colTop.y },
    { x: colTop.x - r1, y: colTop.y },
  ]);
  ctx.fillStyle = colGrad;
  ctx.fill();
  for (const k of [0.16, 0.86]) {
    const collar = mix3({ x: 0, y: plinthTop, z: 0 }, pivot, k);
    drawCylinder(
      ctx,
      cam,
      { x: 0, y: collar.y - 0.02, z: 0 },
      0.04,
      lerp(0.13, 0.085, k),
      light,
      metal,
      veil * rise,
    );
  }

  // --- Quadrante e ago ----------------------------------------------------
  const dialR = 0.56;
  const balanced = clamp(1 - Math.abs(theta) / 0.05);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const a = -0.5 + (i / 24) * 1.0;
    const p = project(
      add(pivot, { x: Math.sin(a) * dialR, y: -Math.cos(a) * dialR, z: 0 }),
      cam,
    );
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.strokeStyle = rgba(PALETTE.ice, 0.62 * spread);
  ctx.stroke();
  for (let i = -5; i <= 5; i++) {
    const a = i * 0.1;
    const centerTick = i === 0;
    const inner = dialR - (centerTick ? 0.09 : 0.04);
    const outer = dialR + (centerTick ? 0.07 : 0.03);
    const p0 = project(
      add(pivot, { x: Math.sin(a) * inner, y: -Math.cos(a) * inner, z: 0 }),
      cam,
    );
    const p1 = project(
      add(pivot, { x: Math.sin(a) * outer, y: -Math.cos(a) * outer, z: 0 }),
      cam,
    );
    ctx.strokeStyle = centerTick
      ? rgba(PALETTE.white, (0.6 + balanced * 0.4) * spread)
      : rgba(PALETTE.ice, 0.6 * spread);
    ctx.lineWidth = centerTick ? 2.2 : 1.3;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }
  const needleTip = project(
    add(pivot, scale({ x: -Math.sin(theta), y: -Math.cos(theta), z: 0 }, dialR - 0.02)),
    cam,
  );
  ctx.strokeStyle = rgba(PALETTE.white, 0.95 * spread);
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(colTop.x, colTop.y);
  ctx.lineTo(needleTip.x, needleTip.y);
  ctx.stroke();
  drawGlow(
    ctx,
    needleTip.x,
    needleTip.y,
    unit * (0.09 + balanced * 0.1),
    PALETTE.ice,
    (0.5 + balanced * 0.5) * spread,
  );

  // --- Piatti -------------------------------------------------------------
  sim.hits = [];
  const panColors: [Rgb, Rgb] = [PALETTE.olive, PALETTE.sky];
  const panLabels: { p: Projected; part: ScalePart }[] = [];

  const drawPan = (s: 0 | 1) => {
    const part: ScalePart = s === 0 ? "left" : "right";
    const end = ends[s];
    const phi = sim.swing[s]!;
    const down: Vec3 = { x: Math.sin(phi), y: -Math.cos(phi), z: 0 };
    const center = add(end, scale(down, HANG * (0.25 + 0.75 * drop)));
    const basis = {
      u: { x: Math.cos(phi), y: Math.sin(phi), z: 0 },
      v: { x: 0, y: 0, z: 1 },
    };
    const color = panColors[s];
    const glow = sim.glow[part];
    const pc = project(center, cam);
    const alpha = drop;

    sim.hits.push({ part, x: pc.x, y: pc.y, r: PAN_R * pc.s * 1.15 });
    panLabels.push({
      p: project(add(center, scale(down, PAN_DEPTH + 0.3)), cam),
      part,
    });

    drawGlow(ctx, pc.x, pc.y, PAN_R * pc.s * 2.6, color, (0.14 + glow * 0.42) * alpha);

    // Fili di sospensione
    const endP = project(end, cam);
    ctx.strokeStyle = rgba(PALETTE.ice, 0.62 * alpha);
    ctx.lineWidth = Math.max(0.8, 0.008 * pc.s);
    for (let k = 0; k < 3; k++) {
      const rimP = project(
        ringPoint(center, PAN_R, basis, Math.PI / 2 + (k * Math.PI * 2) / 3),
        cam,
      );
      ctx.beginPath();
      ctx.moveTo(endP.x, endP.y);
      ctx.lineTo(rimP.x, rimP.y);
      ctx.stroke();
    }

    // Coppa in vetro: dischi sovrapposti dal bordo al fondo
    const rim = circlePoints(cam, center, PAN_R, basis, 44);
    const fill = ctx.createRadialGradient(
      pc.x + (light.x - pc.x) * 0.12,
      pc.y,
      0,
      pc.x,
      pc.y,
      PAN_R * pc.s,
    );
    fill.addColorStop(0, rgba(mixRgb(color, PALETTE.white, 0.5), 0.34 * alpha));
    fill.addColorStop(1, rgba(color, 0.1 * alpha));
    polygon(ctx, rim);
    ctx.fillStyle = fill;
    ctx.fill();
    const ribs = 5;
    for (let k = 1; k <= ribs; k++) {
      const a = (k / ribs) * (Math.PI / 2) * 0.94;
      const ribCenter = add(center, scale(down, PAN_DEPTH * Math.sin(a)));
      const ribR = PAN_R * Math.cos(a);
      polygon(ctx, circlePoints(cam, ribCenter, ribR, basis, 32));
      ctx.fillStyle = rgba(color, 0.075 * alpha);
      ctx.fill();
      strokeRing3d(ctx, cam, ribCenter, ribR, basis, {
        color: mixRgb(color, PALETTE.white, 0.35),
        alpha: (0.5 + glow * 0.3) * alpha,
        width: 1,
        pass: "front",
        segments: 40,
      });
    }

    // Pesi: semi di pace (sfere) / mattoni delle istituzioni (cubi)
    const weights = sim.weights[s]!;
    const bottomY = PAN_DEPTH * 0.82;
    const place = (lx: number, ly: number, lz: number): Vec3 => ({
      x: center.x + basis.u.x * lx - down.x * ly,
      y: center.y + basis.u.y * lx - down.y * ly,
      z: center.z + lz,
    });
    if (s === 0) {
      const slots = [
        { x: -0.02, z: -0.03, lift: 0 },
        { x: 0.25, z: 0.06, lift: 0.035 },
        { x: -0.27, z: 0.08, lift: 0.035 },
      ];
      slots
        .map((slot, i) => ({ slot, i }))
        .sort((a, b) => b.slot.z - a.slot.z)
        .forEach(({ slot, i }) => {
          const k = weights[i]!;
          if (k < 0.02) return;
          const r = 0.135 * k;
          const p = project(place(slot.x, -bottomY + r + slot.lift, slot.z), cam);
          drawGlow(ctx, p.x, p.y, r * p.s * 2.6, PALETTE.olive, 0.4 * k * alpha);
          drawSphere(
            ctx,
            p.x,
            p.y,
            r * p.s,
            light,
            PALETTE.olive,
            PALETTE.oliveDeep,
            alpha,
          );
        });
    } else {
      const slots = [
        { x: -0.135, y: 0, z: 0.02, rot: 0.32 },
        { x: 0.135, y: 0, z: -0.02, rot: -0.24 },
        { x: 0.0, y: 0.215, z: 0, rot: 0.62 },
      ];
      slots.forEach((slot, i) => {
        const k = weights[i]!;
        if (k < 0.02) return;
        const half = 0.108 * k;
        drawBox(
          ctx,
          cam,
          place(slot.x, -bottomY + half + slot.y * k, slot.z),
          half,
          slot.rot + phi,
          lightView,
          PALETTE.white,
          mixRgb(PALETTE.deep, PALETTE.navy, 0.3),
          alpha,
        );
      });
    }

    // Bordo: anello pieno, metà frontale più luminosa
    strokeRing3d(ctx, cam, center, PAN_R, basis, {
      color: mixRgb(color, PALETTE.white, 0.55),
      alpha: (0.95 + glow * 0.05) * alpha,
      width: Math.max(1.4, 0.018 * pc.s),
      segments: 56,
    });
    const rimLit = clamp(1 - Math.hypot(light.x - pc.x, light.y - pc.y) / (unit * 2));
    drawGlow(
      ctx,
      pc.x + clamp((light.x - pc.x) / (unit * 2), -1, 1) * PAN_R * pc.s * 0.8,
      pc.y,
      unit * 0.22,
      PALETTE.white,
      rimLit * 0.55 * alpha,
    );
  };

  const farFirst: (0 | 1)[] =
    project(ends[0], cam).z > project(ends[1], cam).z ? [0, 1] : [1, 0];
  farFirst.forEach(drawPan);

  // --- Giogo (trave) ------------------------------------------------------
  const beamPolygon = (zOff: number) => {
    const upper: Projected[] = [];
    const lower: Projected[] = [];
    for (let i = 0; i <= 14; i++) {
      const u = -1 + (i / 14) * 2;
      const bow = 1 - u * u;
      const mid = add(
        add(pivot, scale(beamDir, u * reach)),
        scale(beamUp, 0.045 * bow),
      );
      const th = 0.022 + 0.048 * bow;
      upper.push(project({ ...add(mid, scale(beamUp, th)), z: zOff }, cam));
      lower.push(project({ ...add(mid, scale(beamUp, -th)), z: zOff }, cam));
    }
    return { upper, lower };
  };
  const pL = project(ends[0], cam);
  const pR = project(ends[1], cam);
  if (reach > 0.02) {
    const back = beamPolygon(0.05);
    polygon(ctx, [...back.upper, ...[...back.lower].reverse()]);
    ctx.fillStyle = rgba(mixRgb(PALETTE.deep, PALETTE.navy, 0.5), 0.95);
    ctx.fill();

    const front = beamPolygon(-0.05);
    const beamGrad = ctx.createLinearGradient(pL.x, pL.y, pR.x, pR.y);
    beamGrad.addColorStop(0, rgba(mixRgb(PALETTE.olive, PALETTE.white, 0.25), 1));
    beamGrad.addColorStop(0.5, rgba(PALETTE.white, 1));
    beamGrad.addColorStop(1, rgba(mixRgb(PALETTE.sky, PALETTE.white, 0.2), 1));
    polygon(ctx, [...front.upper, ...[...front.lower].reverse()]);
    ctx.fillStyle = beamGrad;
    ctx.fill();
    ctx.beginPath();
    front.lower.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.strokeStyle = rgba(PALETTE.deep, 0.55);
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Riflesso speculare che scorre lungo la trave seguendo la luce
    const bx = pR.x - pL.x;
    const by = pR.y - pL.y;
    const len2 = bx * bx + by * by || 1;
    const t = clamp(((light.x - pL.x) * bx + (light.y - pL.y) * by) / len2);
    const sx = pL.x + bx * t;
    const sy = pL.y + by * t;
    const near = clamp(1 - Math.hypot(light.x - sx, light.y - sy) / (unit * 2.2));
    drawGlow(ctx, sx, sy, unit * 0.34, PALETTE.white, 0.25 + near * 0.6);
  }
  for (const end of [pL, pR]) {
    drawSphere(
      ctx,
      end.x,
      end.y,
      0.052 * end.s * spread,
      light,
      PALETTE.ice,
      PALETTE.deep,
    );
  }

  // --- Fulcro -------------------------------------------------------------
  const jewelColor = mixRgb(
    mixRgb(PALETTE.sky, PALETTE.olive, clamp(-theta / 0.3)),
    PALETTE.onu,
    clamp(theta / 0.3) * 0.6,
  );
  const centerGlow = sim.glow.center;
  sim.hits.push({ part: "center", x: colTop.x, y: colTop.y, r: 0.3 * colTop.s });
  drawGlow(
    ctx,
    colTop.x,
    colTop.y,
    unit * (0.55 + centerGlow * 0.5),
    jewelColor,
    (0.4 + centerGlow * 0.5) * rise,
  );
  drawSphere(
    ctx,
    colTop.x,
    colTop.y,
    0.105 * colTop.s * rise,
    light,
    jewelColor,
    PALETTE.navy,
  );
  ctx.beginPath();
  ctx.arc(colTop.x, colTop.y, 0.16 * colTop.s * rise, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(PALETTE.white, 0.55 + centerGlow * 0.4);
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // --- Anelli armillari (metà vicina) + perle ------------------------------
  RINGS.forEach((ring, i) => {
    strokeRing3d(ctx, cam, ORBIT_CENTER, ring.radius * ringScale, ringBases[i]!, {
      color: i === 1 ? PALETTE.olive : PALETTE.sky,
      alpha: (i === 0 ? 0.95 : 0.74) * veil,
      width: i === 0 ? 1.9 : 1.35,
      pass: "front",
      sweep: veil,
      segments: 96,
    });
    const bead = project(
      ringPoint(
        ORBIT_CENTER,
        ring.radius * ringScale,
        ringBases[i]!,
        time * ring.bead + i * 2.1,
      ),
      cam,
    );
    const beadColor = i === 1 ? PALETTE.olive : PALETTE.ice;
    drawGlow(ctx, bead.x, bead.y, 0.2 * bead.s, beadColor, 0.9 * veil);
    drawGlow(ctx, bead.x, bead.y, 0.06 * bead.s, PALETTE.white, veil);
  });

  // --- Onde di selezione --------------------------------------------------
  sim.pulses = sim.pulses.filter((pulse) => frame.time - pulse.t0 < 1500);
  for (const pulse of sim.pulses) {
    const k = clamp((frame.time - pulse.t0) / 1500);
    const zone = sim.hits.find((hit) => hit.part === pulse.part);
    if (!zone) continue;
    const color =
      pulse.part === "left"
        ? PALETTE.olive
        : pulse.part === "right"
          ? PALETTE.sky
          : PALETTE.ice;
    for (let ring = 0; ring < 2; ring++) {
      const kk = clamp(k * 1.25 - ring * 0.22);
      if (kk <= 0 || kk >= 1) continue;
      const e = easeOutCubic(kk);
      ctx.beginPath();
      ctx.ellipse(
        zone.x,
        zone.y,
        zone.r * (0.5 + e * 1.9),
        zone.r * (0.5 + e * 1.9) * (pulse.part === "center" ? 1 : 0.42),
        0,
        0,
        Math.PI * 2,
      );
      ctx.strokeStyle = rgba(color, (1 - kk) * 0.85);
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
  }

  // --- Scintille ----------------------------------------------------------
  sim.sparks = sim.sparks.filter((spark) => frame.time - spark.t0 < spark.life);
  for (const spark of sim.sparks) {
    const age = frame.time - spark.t0;
    if (age < 0) continue;
    const k = age / spark.life;
    spark.p = add(spark.p, scale(spark.v, dt));
    spark.v.y -= 0.00009 * dt;
    const zone = sim.hits.find((hit) => hit.part === spark.part);
    if (!zone) continue;
    const sx = zone.x + spark.p.x * unit;
    const sy = zone.y - spark.p.y * unit;
    drawGlow(
      ctx,
      sx,
      sy,
      spark.size * unit * (1.6 - k),
      spark.color,
      (1 - k) * 0.95,
    );
  }

  // --- Pulviscolo (davanti) -----------------------------------------------
  for (const d of dustFront) drawGlow(ctx, d.p.x, d.p.y, d.r, d.c, d.a);

  // --- Etichette che legano i pilastri alla bilancia -----------------------
  const fontSize = clamp(unit * 0.062, 9.5, 12.5);
  const font = `600 ${fontSize}px ${input.fonts.sans}`;
  for (const item of panLabels) {
    const g = sim.glow[item.part];
    drawCaps(
      ctx,
      input.labels[item.part],
      item.p.x,
      item.p.y,
      font,
      rgba(PALETTE.ice, (0.42 + g * 0.58) * drop),
      fontSize * 0.26,
    );
  }
  const top = project(add(pivot, { x: 0, y: 0.34, z: 0 }), cam);
  drawCaps(
    ctx,
    input.labels.center,
    top.x,
    top.y,
    font,
    rgba(PALETTE.ice, (0.42 + centerGlow * 0.58) * spread),
    fontSize * 0.26,
  );
}

/** Parte della bilancia sotto il cursore (per click e cursore). */
export function hitScales(sim: ScalesSim, x: number, y: number): ScalePart | null {
  let best: ScalePart | null = null;
  let bestD = Infinity;
  for (const zone of sim.hits) {
    const d = Math.hypot(x - zone.x, y - zone.y) / zone.r;
    if (d <= 1 && d < bestD) {
      best = zone.part;
      bestD = d;
    }
  }
  return best;
}
