import {
  PALETTE,
  add,
  clamp,
  damp,
  drawCaps,
  drawGlow,
  drawSphere,
  easeOutCubic,
  lerp,
  mixRgb,
  project,
  rgba,
  ringBasis,
  ringPoint,
  scale,
  strokeRing3d,
  unproject,
  type Camera,
  type Projected,
  type Rgb,
  type Vec3,
} from "./scene3d";
import type { StageFrame } from "./use-canvas-stage";

export type NetworkActor = {
  label: string;
  color: Rgb;
  /** Azimut ed elevazione (radianti) sulla sfera della rete. */
  az: number;
  el: number;
};

export type NetworkInput = {
  actors: readonly NetworkActor[];
  edges: readonly (readonly [number, number])[];
  focused: number | null;
  pointer: { x: number; y: number } | null;
  reduceMotion: boolean;
  fonts: { serif: string; sans: string };
  /** Larghezza (px) libera dal testo: la rete si centra lì dentro. */
  freeWidth: number;
};

type Hub = {
  base: Vec3;
  pos: Vec3;
  vel: Vec3;
  phase: number;
  lum: number;
  size: number;
  sizeV: number;
};

type Satellite = {
  hub: number;
  radius: number;
  tilt: number;
  azimuth: number;
  speed: number;
  phase: number;
  size: number;
};

type Pulse = { edge: number; u: number; speed: number };
type Ripple = { hub: number; t0: number; strength: number };
type Dust = { p: Vec3; phase: number; size: number; tone: number };

type Drag =
  | { kind: "hub"; index: number; viewZ: number; x: number; y: number; moved: boolean }
  | { kind: "orbit"; x: number; y: number; moved: boolean };

export type NetworkSim = {
  hubs: Hub[];
  satellites: Satellite[];
  pulses: Pulse[];
  ripples: Ripple[];
  dust: Dust[];
  yaw: number;
  yawV: number;
  pitch: number;
  offYaw: number;
  offPitch: number;
  light: { x: number; y: number };
  drag: Drag | null;
  hover: number | null;
  freeUntil: number;
  introT0: number | null;
  lastFocused: number | null;
  screen: { p: Projected; r: number }[];
  cam: Camera | null;
  time: number;
  yawCache: { key: string; yaw: number } | null;
};

const SPHERE_R = 1.5;
const HUB_R = 0.2;
const TAU = Math.PI * 2;
/** Parallasse (rad) concessa al cursore quando un nodo è selezionato. */
const FOCUS_SWAY = 0.08;

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

export function createNetworkSim(
  actors: readonly NetworkActor[],
  edges: readonly (readonly [number, number])[],
): NetworkSim {
  const rand = mulberry(17);
  const hubs: Hub[] = actors.map((actor, i) => {
    const base = {
      x: Math.cos(actor.el) * Math.cos(actor.az) * SPHERE_R,
      y: Math.sin(actor.el) * SPHERE_R,
      z: Math.cos(actor.el) * Math.sin(actor.az) * SPHERE_R,
    };
    return {
      base,
      pos: { x: 0, y: 0, z: 0 },
      vel: { x: 0, y: 0, z: 0 },
      phase: i * 1.37,
      lum: 1,
      size: 1,
      sizeV: 0,
    };
  });
  const satellites: Satellite[] = [];
  hubs.forEach((_, hub) => {
    for (let k = 0; k < 6; k++) {
      satellites.push({
        hub,
        radius: 0.36 + rand() * 0.3,
        tilt: 0.3 + rand() * 1.15,
        azimuth: rand() * TAU,
        speed: (0.00028 + rand() * 0.0005) * (rand() > 0.5 ? 1 : -1),
        phase: rand() * TAU,
        size: 0.02 + rand() * 0.02,
      });
    }
  });
  const pulses: Pulse[] = [];
  edges.forEach((_, edge) => {
    for (let k = 0; k < 2; k++) {
      pulses.push({ edge, u: rand(), speed: 0.0022 + rand() * 0.0022 });
    }
  });
  const dust: Dust[] = [];
  for (let i = 0; i < 120; i++) {
    const a = rand() * TAU;
    const r = 0.8 + Math.pow(rand(), 0.6) * 3.4;
    dust.push({
      p: { x: Math.cos(a) * r, y: (rand() - 0.5) * 4.2, z: Math.sin(a) * r },
      phase: rand() * TAU,
      size: 0.01 + rand() * 0.016,
      tone: rand(),
    });
  }
  return {
    hubs,
    satellites,
    pulses,
    ripples: [],
    dust,
    yaw: -0.5,
    yawV: 0,
    pitch: 0.18,
    offYaw: 0,
    offPitch: 0,
    light: { x: 0, y: 0 },
    drag: null,
    hover: null,
    freeUntil: 0,
    introT0: null,
    lastFocused: null,
    screen: [],
    cam: null,
    time: 0,
    yawCache: null,
  };
}

function bezier(a: Vec3, c: Vec3, b: Vec3, u: number): Vec3 {
  const k0 = (1 - u) * (1 - u);
  const k1 = 2 * (1 - u) * u;
  const k2 = u * u;
  return {
    x: a.x * k0 + c.x * k1 + b.x * k2,
    y: a.y * k0 + c.y * k1 + b.y * k2,
    z: a.z * k0 + c.z * k1 + b.z * k2,
  };
}

function control(a: Vec3, b: Vec3): Vec3 {
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
  const len = Math.hypot(mid.x, mid.y, mid.z);
  if (len < 0.2) return { x: mid.x, y: mid.y + 0.55, z: mid.z };
  return add(mid, scale(mid, 0.55 / len));
}

/**
 * Yaw che porta il nodo scelto in primo piano scegliendo, tra più angoli,
 * quello in cui nodi e nucleo si coprono meno sullo schermo.
 */
function focusYaw(sim: NetworkSim, index: number, wide: boolean): number {
  const key = `${index}:${wide ? 1 : 0}:${sim.pitch.toFixed(2)}`;
  if (sim.yawCache?.key === key) return sim.yawCache.yaw;
  const base = sim.hubs[index]!.base;
  const front = -Math.PI / 2 - Math.atan2(base.z, base.x);
  const cam: Camera = { yaw: 0, pitch: sim.pitch, dist: 6.4, unit: 1, cx: 0, cy: 0 };
  let best = front;
  let bestScore = -Infinity;
  for (let k = -5; k <= 8; k++) {
    const offset = k * 0.08;
    let gap = Infinity;
    // il punteggio tiene conto anche della parallasse del cursore
    for (const sway of [-FOCUS_SWAY, 0, FOCUS_SWAY]) {
      cam.yaw = front + offset + sway;
      const discs = sim.hubs.map((hub, i) => {
        const p = project(hub.base, cam);
        return { x: p.x, y: p.y, r: HUB_R * (i === index ? 1.34 : 1) * p.s * 1.25 };
      });
      discs.push({ x: 0, y: 0, r: 0.3 });
      for (let i = 0; i < discs.length; i++) {
        for (let j = i + 1; j < discs.length; j++) {
          const a = discs[i]!;
          const b = discs[j]!;
          gap = Math.min(gap, Math.hypot(a.x - b.x, a.y - b.y) - a.r - b.r);
        }
      }
    }
    // a parità di leggibilità, meglio il nodo rivolto verso il testo
    const score = gap - Math.abs(offset - (wide ? 0.16 : 0)) * 0.1;
    if (score > bestScore) {
      bestScore = score;
      best = front + offset;
    }
  }
  sim.yawCache = { key, yaw: best };
  return best;
}

const depthFade = (z: number) => clamp(1 - ((z + 1.7) / 3.4) * 0.6, 0.32, 1);

export function renderNetwork(
  frame: StageFrame,
  sim: NetworkSim,
  input: NetworkInput,
) {
  const { ctx, w, h, dt } = frame;
  const still = input.reduceMotion;
  const time = still ? 0 : frame.time;
  sim.time = frame.time;
  const free = clamp(input.freeWidth, 240, w);
  const wide = free < w - 40;
  const { actors, edges, focused } = input;

  // --- Camera -------------------------------------------------------------
  // in colonna, la fascia alta dello stage resta al contatore dei legami
  const hudBand = wide ? 0 : 44;
  const unit = wide
    ? Math.min(h / 5.4, free / 4, 205)
    : Math.min((h - hudBand) / 4.7, w / 4.7);
  const cx = wide ? free * 0.52 : w / 2;
  const cy = wide ? h * 0.53 : (h + hudBand) / 2;
  const pointer = still ? null : input.pointer;
  const draggingHub = sim.drag?.kind === "hub";

  if (!still) {
    if (sim.drag?.kind !== "orbit") {
      sim.yaw += sim.yawV * dt;
      sim.yawV *= Math.pow(0.94, dt);
    }
    const roaming = frame.time < sim.freeUntil || sim.drag !== null;
    if (focused !== null && !roaming) {
      const target = focusYaw(sim, focused, wide);
      let delta = (target - sim.yaw) % TAU;
      if (delta > Math.PI) delta -= TAU;
      if (delta < -Math.PI) delta += TAU;
      sim.yaw += delta * damp(0.045, dt);
    } else if (focused === null && sim.drag === null) {
      sim.yaw += 0.0016 * dt;
    }
    if (!draggingHub) {
      const nx = pointer ? clamp((pointer.x - cx) / (w * 0.5), -1, 1) : 0;
      const ny = pointer ? clamp((pointer.y - cy) / (h * 0.5), -1, 1) : 0;
      const ease = damp(0.06, dt);
      const sway = focused === null ? 0.2 : FOCUS_SWAY;
      sim.offYaw = lerp(sim.offYaw, nx * sway, ease);
      sim.offPitch = lerp(sim.offPitch, -ny * sway * 0.6, ease);
    }
  } else if (focused !== null) {
    sim.yaw = focusYaw(sim, focused, wide);
  }

  const cam: Camera = {
    yaw: sim.yaw + sim.offYaw,
    pitch: clamp(sim.pitch + sim.offPitch, -0.25, 0.7),
    dist: 6.4,
    unit,
    cx,
    cy,
  };
  sim.cam = cam;

  // --- Intro --------------------------------------------------------------
  if (frame.entered && sim.introT0 === null) sim.introT0 = frame.time;
  const intro = still
    ? 1
    : sim.introT0 === null
      ? 0
      : clamp((frame.time - sim.introT0) / 2400);
  const weave = easeOutCubic(clamp((intro - 0.3) / 0.7));
  const veil = easeOutCubic(clamp(intro * 1.8));

  // --- Luce ---------------------------------------------------------------
  const lightTarget = pointer ?? {
    x: cx + Math.cos(time / 3100) * unit * 2.1,
    y: cy - unit * 1.2 + Math.sin(time / 2700) * unit * 0.7,
  };
  if (sim.light.x === 0 && sim.light.y === 0) sim.light = { ...lightTarget };
  const lightEase = still ? 1 : damp(0.11, dt);
  sim.light.x = lerp(sim.light.x, lightTarget.x, lightEase);
  sim.light.y = lerp(sim.light.y, lightTarget.y, lightEase);
  const light = sim.light;

  // --- Selezione: onde e luminosità ---------------------------------------
  if (focused !== sim.lastFocused) {
    if (focused !== null && !still) {
      sim.ripples.push({ hub: focused, t0: frame.time, strength: 1 });
      edges.forEach(([a, b]) => {
        if (a === focused || b === focused) {
          sim.ripples.push({
            hub: a === focused ? b : a,
            t0: frame.time + 520,
            strength: 0.55,
          });
        }
      });
    }
    sim.lastFocused = focused;
  }
  const neighbours = new Set<number>();
  if (focused !== null) {
    edges.forEach(([a, b]) => {
      if (a === focused) neighbours.add(b);
      if (b === focused) neighbours.add(a);
    });
  }

  // --- Moto organico dei nodi ---------------------------------------------
  sim.hubs.forEach((hub, i) => {
    const grow = easeOutCubic(clamp(intro * 1.7 - i * 0.09));
    const target = {
      x: hub.base.x * grow + Math.sin(time * 0.00052 + hub.phase) * 0.085,
      y: hub.base.y * grow + Math.cos(time * 0.00067 + hub.phase * 1.3) * 0.075,
      z: hub.base.z * grow + Math.sin(time * 0.00058 + hub.phase * 0.7) * 0.085,
    };
    const dragged = sim.drag?.kind === "hub" && sim.drag.index === i;
    if (still) {
      hub.pos = { ...hub.base };
      hub.vel = { x: 0, y: 0, z: 0 };
    } else if (!dragged) {
      const damping = Math.pow(0.86, dt);
      hub.vel.x = (hub.vel.x + (target.x - hub.pos.x) * 0.034 * dt) * damping;
      hub.vel.y = (hub.vel.y + (target.y - hub.pos.y) * 0.034 * dt) * damping;
      hub.vel.z = (hub.vel.z + (target.z - hub.pos.z) * 0.034 * dt) * damping;
      hub.pos = add(hub.pos, scale(hub.vel, dt));
    }
    const lumTarget =
      focused === null ? 1 : i === focused ? 1 : neighbours.has(i) ? 0.78 : 0.3;
    hub.lum = lerp(hub.lum, lumTarget, still ? 1 : damp(0.09, dt));
    const sizeTarget = i === focused ? 1.34 : i === sim.hover ? 1.14 : 1;
    if (still) {
      hub.size = sizeTarget;
    } else {
      hub.sizeV = (hub.sizeV + (sizeTarget - hub.size) * 0.05 * dt) * Math.pow(0.84, dt);
      hub.size += hub.sizeV * dt;
    }
  });

  const proj = sim.hubs.map((hub) => project(hub.pos, cam));
  sim.screen = proj.map((p, i) => ({ p, r: HUB_R * sim.hubs[i]!.size * p.s }));
  const core = project({ x: 0, y: 0, z: 0 }, cam);

  ctx.clearRect(0, 0, w, h);

  // L'alone d'atmosfera e la luce ampia sono livelli CSS (vedi syncStageGlow):
  // qui resta solo il nucleo caldo della luce.
  drawGlow(ctx, light.x, light.y, unit * 0.8, PALETTE.ice, 0.12 * veil);

  // --- Pulviscolo ---------------------------------------------------------
  const dustCount = wide ? sim.dust.length : Math.round(sim.dust.length * 0.45);
  for (let i = 0; i < dustCount; i++) {
    const d = sim.dust[i]!;
    const t = time * 0.00018 + d.phase;
    const p = project(
      {
        x: d.p.x + Math.sin(t) * 0.2,
        y: d.p.y + Math.cos(t * 0.8) * 0.2,
        z: d.p.z + Math.sin(t * 1.1) * 0.2,
      },
      cam,
    );
    const twinkle = 0.5 + 0.5 * Math.sin(time * 0.0012 + d.phase * 4);
    const lit = clamp(1 - Math.hypot(p.x - light.x, p.y - light.y) / (unit * 2.2));
    drawGlow(
      ctx,
      p.x,
      p.y,
      d.size * p.s * (1.2 + lit),
      d.tone > 0.8 ? PALETTE.olive : d.tone > 0.35 ? PALETTE.sky : PALETTE.ice,
      (0.14 + twinkle * 0.26 + lit * 0.4) * veil * depthFade(p.z),
    );
  }

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";

  // --- Raggi verso il nucleo comune ---------------------------------------
  sim.hubs.forEach((hub, i) => {
    const p = proj[i]!;
    const a = 0.2 * hub.lum * weave * depthFade(p.z);
    const grad = ctx.createLinearGradient(p.x, p.y, core.x, core.y);
    grad.addColorStop(0, rgba(actors[i]!.color, a));
    grad.addColorStop(1, rgba(PALETTE.white, a * 1.4));
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(core.x, core.y);
    ctx.stroke();
    if (!still) {
      const u = (time * 0.00028 + hub.phase) % 1;
      const sp = project(scale(hub.pos, 1 - u), cam);
      drawGlow(ctx, sp.x, sp.y, 0.05 * sp.s, PALETTE.white, 0.75 * hub.lum * weave * (1 - u * 0.6));
    }
  });

  // --- Legami --------------------------------------------------------------
  const curves = edges.map(([a, b]) => {
    const pa = sim.hubs[a]!.pos;
    const pb = sim.hubs[b]!.pos;
    return { pa, pb, c: control(pa, pb) };
  });
  const SEG = 20;
  edges.forEach(([a, b], e) => {
    const { pa, pb, c } = curves[e]!;
    const hot = focused !== null && (a === focused || b === focused);
    const cold = focused !== null && !hot;
    const strength = cold ? 0.13 : hot ? 1 : 0.62;
    const count = Math.max(1, Math.round(SEG * weave));
    const pts: Projected[] = [];
    for (let i = 0; i <= count; i++) pts.push(project(bezier(pa, c, pb, i / SEG), cam));
    const first = pts[0]!;
    const last = pts[pts.length - 1]!;
    const fade = depthFade((first.z + last.z) / 2);
    const grad = ctx.createLinearGradient(first.x, first.y, last.x, last.y);
    grad.addColorStop(0, rgba(actors[a]!.color, strength * fade));
    grad.addColorStop(0.5, rgba(PALETTE.ice, strength * fade * 0.85));
    grad.addColorStop(1, rgba(actors[b]!.color, strength * fade));
    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    if (!cold) {
      ctx.strokeStyle = rgba(PALETTE.sky, (hot ? 0.17 : 0.07) * fade);
      ctx.lineWidth = hot ? 7 : 5;
      ctx.stroke();
    }
    ctx.strokeStyle = grad;
    ctx.lineWidth = hot ? 2.1 : 1.5;
    ctx.stroke();
  });

  // --- Impulsi che viaggiano sui legami -----------------------------------
  if (!still && weave > 0.6) {
    for (const pulse of sim.pulses) {
      const [a, b] = edges[pulse.edge]!;
      const hot = focused !== null && (a === focused || b === focused);
      if (focused !== null && !hot) continue;
      pulse.u += pulse.speed * dt * (hot ? 1.9 : 1);
      if (pulse.u > 1) pulse.u -= 1;
      const { pa, pb, c } = curves[pulse.edge]!;
      const outward = focused === null ? pulse.edge % 2 === 0 : a === focused;
      const color = actors[outward ? a : b]!.color;
      for (let k = 0; k < 5; k++) {
        const u = pulse.u - k * 0.022;
        if (u < 0) break;
        const p = project(bezier(pa, c, pb, outward ? u : 1 - u), cam);
        const head = k === 0;
        drawGlow(
          ctx,
          p.x,
          p.y,
          (head ? 0.085 : 0.06 - k * 0.008) * p.s,
          head ? PALETTE.white : color,
          (head ? 1 : 0.6 - k * 0.12) * depthFade(p.z),
        );
      }
    }
  }
  ctx.restore();

  // --- Nucleo: gli obiettivi comuni ---------------------------------------
  const breath = 1 + Math.sin(time / 900) * 0.06;
  drawGlow(ctx, core.x, core.y, core.s * 1.05 * breath, PALETTE.onu, 0.62 * veil);
  drawGlow(ctx, core.x, core.y, core.s * 0.46 * breath, PALETTE.ice, 0.75 * veil);
  [0.4, 0.54].forEach((radius, i) => {
    strokeRing3d(
      ctx,
      cam,
      { x: 0, y: 0, z: 0 },
      radius,
      ringBasis(0.5 + i * 0.75, time * (i ? -0.0003 : 0.00022) + i),
      { color: PALETTE.ice, alpha: 0.7 * veil, width: 1, segments: 48 },
    );
  });
  ctx.save();
  ctx.font = `600 ${Math.round(core.s * 0.3)}px ${input.fonts.serif}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = rgba(PALETTE.white, 0.95 * veil);
  ctx.fillText("17", core.x, core.y + core.s * 0.015);
  ctx.restore();

  // --- Nodi e satelliti, dal più lontano al più vicino ---------------------
  type Drawable =
    | { kind: "hub"; z: number; i: number }
    | { kind: "sat"; z: number; p: Projected; hub: number; size: number };
  const drawables: Drawable[] = proj.map((p, i) => ({ kind: "hub", z: p.z, i }));
  for (const sat of sim.satellites) {
    const hub = sim.hubs[sat.hub]!;
    const p = project(
      ringPoint(
        hub.pos,
        sat.radius * (0.82 + hub.size * 0.18),
        ringBasis(sat.tilt, sat.azimuth),
        sat.phase + time * sat.speed,
      ),
      cam,
    );
    drawables.push({ kind: "sat", z: p.z, p, hub: sat.hub, size: sat.size });
  }
  drawables.sort((a, b) => b.z - a.z);

  for (const item of drawables) {
    if (item.kind === "sat") {
      const hub = sim.hubs[item.hub]!;
      const hp = proj[item.hub]!;
      const a = hub.lum * weave * depthFade(item.z);
      const color = actors[item.hub]!.color;
      ctx.strokeStyle = rgba(color, 0.28 * a);
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(hp.x, hp.y);
      ctx.lineTo(item.p.x, item.p.y);
      ctx.stroke();
      drawGlow(ctx, item.p.x, item.p.y, item.size * item.p.s * 3.2, color, 0.75 * a);
      drawGlow(ctx, item.p.x, item.p.y, item.size * item.p.s * 1.1, PALETTE.white, 0.9 * a);
      continue;
    }

    const i = item.i;
    const hub = sim.hubs[i]!;
    const p = proj[i]!;
    const color = actors[i]!.color;
    const r = HUB_R * hub.size * p.s;
    const a = hub.lum * depthFade(p.z) * veil;
    const isFocus = i === focused;
    const orbit = ringBasis(0.95 + Math.sin(i * 1.7) * 0.3, time * (i % 2 ? 0.0004 : -0.0004) + i);

    drawGlow(ctx, p.x, p.y, r * (isFocus ? 4.6 : 3.5), color, (isFocus ? 0.75 : 0.5) * a);
    strokeRing3d(ctx, cam, hub.pos, HUB_R * hub.size * 1.75, orbit, {
      color: mixRgb(color, PALETTE.white, 0.4),
      alpha: 0.85 * a,
      width: 1,
      pass: "back",
      segments: 40,
    });
    drawSphere(
      ctx,
      p.x,
      p.y,
      r,
      light,
      color,
      mixRgb(color, PALETTE.navy, 0.82),
      0.3 + 0.7 * a,
    );
    drawGlow(ctx, p.x, p.y, r * 1.15, mixRgb(color, PALETTE.white, 0.5), 0.36 * a);
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, TAU);
    ctx.strokeStyle = rgba(PALETTE.white, 0.6 * a);
    ctx.lineWidth = 1;
    ctx.stroke();
    strokeRing3d(ctx, cam, hub.pos, HUB_R * hub.size * 1.75, orbit, {
      color: mixRgb(color, PALETTE.white, 0.4),
      alpha: 0.85 * a,
      width: 1,
      pass: "front",
      segments: 40,
    });
    if (isFocus) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(time / 2400);
      ctx.setLineDash([2, 7]);
      ctx.beginPath();
      ctx.arc(0, 0, r * 2.35, 0, TAU);
      ctx.strokeStyle = rgba(PALETTE.ice, 0.8);
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }
  }

  // --- Onde di selezione --------------------------------------------------
  sim.ripples = sim.ripples.filter((ripple) => frame.time - ripple.t0 < 1400);
  for (const ripple of sim.ripples) {
    const age = frame.time - ripple.t0;
    if (age < 0) continue;
    const zone = sim.screen[ripple.hub];
    if (!zone) continue;
    for (let ring = 0; ring < 2; ring++) {
      const k = clamp(age / 1400 - ring * 0.18) / (1 - ring * 0.18);
      if (k <= 0 || k >= 1) continue;
      ctx.beginPath();
      ctx.arc(zone.p.x, zone.p.y, zone.r * (1.1 + easeOutCubic(k) * 3.4 * ripple.strength), 0, TAU);
      ctx.strokeStyle = rgba(actors[ripple.hub]!.color, (1 - k) * 0.9 * ripple.strength);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  // --- Etichette (le più vicine hanno la precedenza) -----------------------
  const fs = clamp(unit * 0.072, 9.5, 13.5);
  const placed: { x0: number; y0: number; x1: number; y1: number }[] = [];
  const order = proj.map((p, i) => ({ p, i })).sort((a, b) => a.p.z - b.p.z);
  type Box = { x0: number; y0: number; x1: number; y1: number };
  const overlaps = (a: Box, b: Box) =>
    a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
  const coreBox: Box = {
    x0: core.x - core.s * 0.3,
    x1: core.x + core.s * 0.3,
    y0: core.y - core.s * 0.2,
    y1: core.y + core.s * 0.2,
  };
  const blocked = (box: Box, self: number) =>
    overlaps(box, coreBox) ||
    placed.some((other) => overlaps(box, other)) ||
    sim.screen.some(
      (zone, j) =>
        j !== self &&
        zone.p.z < proj[self]!.z &&
        overlaps(box, {
          x0: zone.p.x - zone.r,
          x1: zone.p.x + zone.r,
          y0: zone.p.y - zone.r,
          y1: zone.p.y + zone.r,
        }),
    );
  for (const { p, i } of order) {
    const hub = sim.hubs[i]!;
    const isFocus = i === focused;
    const size = isFocus ? fs * 1.18 : fs;
    const font = `${isFocus ? 700 : 600} ${size}px ${input.fonts.sans}`;
    const spacing = size * 0.2;
    const label = actors[i]!.label;
    ctx.font = font;
    const width = ctx.measureText(label.toUpperCase()).width + spacing * label.length;
    const x = clamp(p.x, width / 2 + 8, Math.max(width / 2 + 8, w - width / 2 - 8));
    // l'etichetta del nodo attivo resta fuori dall'anello tratteggiato
    const reach = sim.screen[i]!.r * (isFocus ? 2.45 : 2) + size * 0.95;
    const boxAt = (y: number): Box => ({
      x0: x - width / 2 - 4,
      x1: x + width / 2 + 4,
      y0: y - size * 0.8,
      y1: y + size * 0.8,
    });
    const below = p.y + reach;
    const above = p.y - reach;
    let y = below;
    let alpha = (0.5 + hub.lum * 0.5) * depthFade(p.z) * veil;
    if (blocked(boxAt(below), i)) {
      if (!blocked(boxAt(above), i)) y = above;
      else if (isFocus) y = overlaps(boxAt(below), coreBox) ? above : below;
      else alpha *= 0.22;
    }
    placed.push(boxAt(y));
    drawCaps(
      ctx,
      label,
      x,
      y,
      font,
      rgba(isFocus || i === sim.hover ? PALETTE.white : PALETTE.ice, alpha),
      spacing,
    );
  }
}

export function hitHub(sim: NetworkSim, x: number, y: number): number {
  let best = -1;
  let bestZ = Infinity;
  sim.screen.forEach((zone, i) => {
    const d = Math.hypot(x - zone.p.x, y - zone.p.y);
    if (d <= zone.r * 1.5 + 8 && zone.p.z < bestZ) {
      best = i;
      bestZ = zone.p.z;
    }
  });
  return best;
}

export function networkPointerDown(sim: NetworkSim, x: number, y: number) {
  const index = hitHub(sim, x, y);
  sim.drag =
    index >= 0
      ? { kind: "hub", index, viewZ: sim.screen[index]!.p.z, x, y, moved: false }
      : { kind: "orbit", x, y, moved: false };
  sim.yawV = 0;
}

export function networkPointerMove(sim: NetworkSim, x: number, y: number) {
  const drag = sim.drag;
  if (!drag) {
    sim.hover = hitHub(sim, x, y);
    if (sim.hover < 0) sim.hover = null;
    return;
  }
  if (!drag.moved && Math.hypot(x - drag.x, y - drag.y) > 5) drag.moved = true;
  if (!drag.moved) return;
  if (drag.kind === "hub") {
    if (!sim.cam) return;
    const next = unproject(x, y, drag.viewZ, sim.cam);
    const len = Math.hypot(next.x, next.y, next.z);
    const hub = sim.hubs[drag.index]!;
    hub.pos = len > 2.6 ? scale(next, 2.6 / len) : next;
    hub.vel = { x: 0, y: 0, z: 0 };
  } else {
    const dx = x - drag.x;
    sim.yaw += dx * 0.0055;
    sim.yawV = dx * 0.0055;
    sim.pitch = clamp(sim.pitch + (y - drag.y) * 0.003, -0.1, 0.6);
    drag.x = x;
    drag.y = y;
  }
}

/** Chiude il gesto: restituisce cosa è stato "cliccato" (senza trascinare). */
export function networkPointerUp(
  sim: NetworkSim,
): { click: "hub"; index: number } | { click: "empty" } | null {
  const drag = sim.drag;
  sim.drag = null;
  if (!drag) return null;
  if (drag.moved) {
    sim.freeUntil = sim.time + 2600;
    return null;
  }
  return drag.kind === "hub"
    ? { click: "hub", index: drag.index }
    : { click: "empty" };
}
