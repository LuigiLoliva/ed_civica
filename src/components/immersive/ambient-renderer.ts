import {
  buildFormation,
  scatterFormation,
  type Formation,
  type SceneId,
} from "@/components/immersive/scene-shapes";
import {
  clamp,
  damp,
  drawGlow,
  easeOutCubic,
  lerp,
  mixRgb,
  PALETTE,
  project,
  type Camera,
  type Rgb,
} from "@/components/home/goals/scene3d";
import type { StageFrame } from "@/components/home/goals/use-canvas-stage";

const COUNT = 1280;

const TINTS: Rgb[] = [
  PALETTE.sky,
  PALETTE.onu,
  PALETTE.deep,
  PALETTE.olive,
];

function tintColor(formation: Formation, tint: number): Rgb {
  const idx = Math.floor(clamp(tint, 0, 3)) as 0 | 1 | 2 | 3;
  const override = formation.palette?.[idx];
  if (override) return override;
  return TINTS[idx] ?? PALETTE.onu;
}

type Runtime = {
  scene: SceneId;
  formation: Formation;
  scatterPos: Float32Array;
  scatterMeta: Float32Array;
  yaw: number;
  pitch: number;
  intro: number;
};

const cache = new Map<SceneId, Runtime>();

function runtimeFor(scene: SceneId): Runtime {
  const hit = cache.get(scene);
  if (hit) return hit;
  const formation = buildFormation(scene, COUNT);
  const scatter = scatterFormation(COUNT);
  const rt: Runtime = {
    scene,
    formation,
    scatterPos: scatter.pos,
    scatterMeta: scatter.meta,
    yaw: 0,
    pitch: formation.pitch,
    intro: 0,
  };
  cache.set(scene, rt);
  return rt;
}

export function renderRouteAmbient(
  frame: StageFrame,
  scene: SceneId,
  pointer: { x: number; y: number },
  reduceMotion: boolean,
) {
  const { ctx, w, h, dt, entered } = frame;
  const rt = runtimeFor(scene);
  const { formation } = rt;

  if (entered && rt.intro < 1) {
    rt.intro = Math.min(1, rt.intro + (reduceMotion ? 1 : dt * 0.028));
  }

  const targetYaw = reduceMotion ? 0 : pointer.x * 0.55;
  const targetPitch = reduceMotion
    ? formation.pitch
    : formation.pitch + pointer.y * 0.38;
  const k = damp(0.12, dt);
  rt.yaw += (targetYaw - rt.yaw) * k;
  rt.pitch += (targetPitch - rt.pitch) * k;

  const spin = reduceMotion
    ? 0
    : formation.spin === "orbit"
      ? frame.time * 0.00011
      : Math.sin(frame.time * 0.00085) * 0.22;

  const cam: Camera = {
    yaw: rt.yaw + spin,
    pitch: rt.pitch,
    dist: 4.2,
    unit: Math.min(w, h) * 0.34,
    cx: w * 0.5,
    cy: h * 0.46,
  };

  const introT = easeOutCubic(rt.intro);
  const bg = ctx.createRadialGradient(
    w * 0.5,
    h * 0.35,
    0,
    w * 0.5,
    h * 0.5,
    Math.max(w, h) * 0.72,
  );
  bg.addColorStop(0, "rgb(10 36 22 / 0%)");
  bg.addColorStop(0.45, "rgb(20 92 59 / 6%)");
  bg.addColorStop(1, "rgb(10 36 22 / 14%)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const light = { x: w * (0.5 + pointer.x * 0.08), y: h * (0.38 + pointer.y * 0.06) };
  const items: { z: number; i: number }[] = [];

  for (let i = 0; i < COUNT; i++) {
    const sx = rt.scatterPos[i * 3];
  const sy = rt.scatterPos[i * 3 + 1];
  const sz = rt.scatterPos[i * 3 + 2];
  const tx = formation.pos[i * 3];
  const ty = formation.pos[i * 3 + 1];
  const tz = formation.pos[i * 3 + 2];
  const x = lerp(sx, tx, introT);
  const y = lerp(sy, ty, introT);
  const z = lerp(sz, tz, introT);
  const cy = Math.cos(cam.yaw);
  const syaw = Math.sin(cam.yaw);
  const rx = x * cy - z * syaw;
  const rz = x * syaw + z * cy;
    const p = project({ x: rx, y, z: rz }, cam);
    items.push({ z: p.z, i });
  }

  items.sort((a, b) => b.z - a.z);

  for (const { i } of items) {
    const sx = rt.scatterPos[i * 3];
    const sy = rt.scatterPos[i * 3 + 1];
    const sz = rt.scatterPos[i * 3 + 2];
    const tx = formation.pos[i * 3];
    const ty = formation.pos[i * 3 + 1];
    const tz = formation.pos[i * 3 + 2];
    const x = lerp(sx, tx, introT);
    const y = lerp(sy, ty, introT);
    const z = lerp(sz, tz, introT);
    const cy = Math.cos(cam.yaw);
    const syaw = Math.sin(cam.yaw);
    const rx = x * cy - z * syaw;
    const rz = x * syaw + z * cy;
    const p = project({ x: rx, y, z: rz }, cam);
    const size = formation.meta[i * 2] * p.s * 0.011;
    const tint = formation.meta[i * 2 + 1];
    const color = tintColor(formation, tint);
    const depth = clamp(1 - (p.z + 2.4) / 4.8, 0.15, 1);
    const alpha = depth * (0.35 + introT * 0.55);
    if (size > 0.35) {
      drawGlow(ctx, p.x, p.y, size * 2.2, mixRgb(color, PALETTE.white, 0.35), alpha * 0.55);
    }
    drawGlow(ctx, p.x, p.y, size, color, alpha);
  }

  drawGlow(ctx, light.x, light.y, Math.min(w, h) * 0.22, PALETTE.onu, 0.04);
}