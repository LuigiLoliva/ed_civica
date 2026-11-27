import {
  CONTENT_LINE_SEGMENTS,
  CONTENT_POINT_COUNT,
} from "@/components/content-stage/constants";
import type { StageShape } from "@/components/content-stage/engine";

export type ContentSceneId =
  | "articoli-list"
  | "articoli-detail"
  | "progetto"
  | "argomenti";

const ON = [30, 58, 138] as const;
const G16 = [30, 58, 138] as const;
const G17 = [23, 37, 84] as const;
const ICE = [226, 232, 240] as const;
const OLIVE = [217, 119, 6] as const;

function rgba(rgb: readonly [number, number, number], a: number) {
  return Uint8Array.from([rgb[0], rgb[1], rgb[2], Math.round(a * 255)]);
}

function hexToRgb(hex: string): [number, number, number] {
  const n = hex.replace("#", "");
  if (n.length !== 6) return [...ON];
  return [
    Number.parseInt(n.slice(0, 2), 16),
    Number.parseInt(n.slice(2, 4), 16),
    Number.parseInt(n.slice(4, 6), 16),
  ];
}

function emptyShape(): StageShape {
  return {
    points: new Float32Array(CONTENT_POINT_COUNT * 4),
    colors: new Uint8Array(CONTENT_POINT_COUNT * 4),
    lines: new Float32Array(CONTENT_LINE_SEGMENTS * 2 * 3),
    lineColors: new Uint8Array(CONTENT_LINE_SEGMENTS * 2 * 4),
  };
}

type Writer = {
  pi: number;
  li: number;
  points: Float32Array;
  colors: Uint8Array;
  lines: Float32Array;
  lineColors: Uint8Array;
};

function writer(): Writer {
  return {
    pi: 0,
    li: 0,
    points: new Float32Array(CONTENT_POINT_COUNT * 4),
    colors: new Uint8Array(CONTENT_POINT_COUNT * 4),
    lines: new Float32Array(CONTENT_LINE_SEGMENTS * 2 * 3),
    lineColors: new Uint8Array(CONTENT_LINE_SEGMENTS * 2 * 4),
  };
}

function addPoint(
  w: Writer,
  x: number,
  y: number,
  z: number,
  size: number,
  color: Uint8Array,
) {
  if (w.pi >= CONTENT_POINT_COUNT) return;
  const o = w.pi * 4;
  w.points[o] = x;
  w.points[o + 1] = y;
  w.points[o + 2] = z;
  w.points[o + 3] = size;
  w.colors.set(color, o);
  w.pi += 1;
}

function addLine(
  w: Writer,
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
  color: Uint8Array,
  alpha = 200,
) {
  if (w.li >= CONTENT_LINE_SEGMENTS) return;
  const o = w.li * 6;
  w.lines[o] = ax;
  w.lines[o + 1] = ay;
  w.lines[o + 2] = az;
  w.lines[o + 3] = bx;
  w.lines[o + 4] = by;
  w.lines[o + 5] = bz;
  const c = w.li * 8;
  const tinted = Uint8Array.from([color[0], color[1], color[2], alpha]);
  w.lineColors.set(tinted, c);
  w.lineColors.set(tinted, c + 4);
  w.li += 1;
}

function fillNoise(w: Writer, count: number, spread: number, rgb: readonly [number, number, number]) {
  while (w.pi < count) {
    const t = w.pi / count;
    const theta = t * Math.PI * 14 + Math.sin(t * 90) * 0.4;
    const r = spread * (0.35 + (t % 1) * 0.65);
    addPoint(
      w,
      Math.cos(theta) * r,
      (t - 0.5) * spread * 1.6,
      Math.sin(theta) * r * 0.7,
      2.2 + (t % 0.3) * 2.4,
      rgba(rgb, 0.35 + (t % 0.4) * 0.45),
    );
  }
}

function finish(w: Writer): StageShape {
  fillNoise(w, CONTENT_POINT_COUNT, 1.2, ICE);
  while (w.li < CONTENT_LINE_SEGMENTS) {
    const t = w.li / CONTENT_LINE_SEGMENTS;
    addLine(
      w,
      -1.2 + t * 2.4,
      0,
      -0.8,
      -1.1 + t * 2.2,
      0.05,
      0.9,
      rgba(ICE, 0.08),
      24,
    );
  }
  return {
    points: w.points,
    colors: w.colors,
    lines: w.lines,
    lineColors: w.lineColors,
  };
}

/** Pila di «fogli» editoriali ruotati (listing). */
export function shapeArticoliList(): StageShape {
  const w = writer();
  const sheets = 7;
  for (let s = 0; s < sheets; s++) {
    const yaw = (s - 3) * 0.22;
    const cy = (s - 3) * 0.11;
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    const perSheet = Math.floor(CONTENT_POINT_COUNT / sheets) - 4;
    for (let i = 0; i < perSheet && w.pi < CONTENT_POINT_COUNT; i++) {
      const u = (i % 16) / 15 - 0.5;
      const v = Math.floor(i / 16) / 22 - 0.48;
      const lx = u * 0.9;
      const ly = v * 1.15;
      const lz = (Math.random() - 0.5) * 0.02;
      addPoint(
        w,
        lx * cos - lz * sin,
        ly + cy,
        lx * sin + lz * cos + s * 0.07,
        1.8 + (s % 3) * 0.6,
        rgba(s % 2 ? ON : G16, 0.55 + (i % 5) * 0.08),
      );
    }
    if (w.li < CONTENT_LINE_SEGMENTS - sheets) {
      const corners = [
        [-0.45, -0.55],
        [0.45, -0.55],
        [0.45, 0.55],
        [-0.45, 0.55],
      ] as const;
      for (let c = 0; c < 4; c++) {
        const [x0, y0] = corners[c];
        const [x1, y1] = corners[(c + 1) % 4];
        const ax = x0 * cos;
        const az = x0 * sin + s * 0.07;
        const bx = x1 * cos;
        const bz = x1 * sin + s * 0.07;
        addLine(w, ax, y0 + cy, az, bx, y1 + cy, bz, rgba(ON, 0.5), 120);
      }
    }
  }
  return finish(w);
}

/** Nastro di lettura / penna stilizzata (dettaglio articolo). */
export function shapeArticoliDetail(accent: readonly [number, number, number] = G16): StageShape {
  const w = writer();
  const n = Math.min(CONTENT_POINT_COUNT, 1800);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const angle = t * Math.PI * 6;
    const radius = 0.35 + Math.sin(t * 12) * 0.08;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = t * 2.2 - 1.1;
    addPoint(
      w,
      x,
      y,
      z,
      2 + Math.sin(t * 40) * 0.8,
      rgba(i % 7 === 0 ? accent : ON, 0.5 + (t % 0.3)),
    );
  }
  const nib = 120;
  for (let i = 0; i < nib && w.pi < CONTENT_POINT_COUNT; i++) {
    const t = i / nib;
    addPoint(
      w,
      0.55 - t * 0.35,
      -1.35 + t * 0.25,
      0.2 - t * 0.15,
      2.8,
      rgba(accent, 0.9),
    );
  }
  while (w.li < CONTENT_LINE_SEGMENTS * 0.75) {
    const t = w.li / CONTENT_LINE_SEGMENTS;
    const y0 = t * 2.2 - 1.1;
    const y1 = y0 + 0.08;
    const x = Math.sin(t * 20) * 0.22;
    addLine(w, x, y0, 0, x + 0.02, y1, 0.02, rgba(accent, 0.6), 140);
  }
  return finish(w);
}

/** Globo scolastico con meridiani (Il progetto). */
export function shapeProgetto(): StageShape {
  const w = writer();
  const n = CONTENT_POINT_COUNT - 80;
  for (let i = 0; i < n; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * Math.PI * 2;
    const phi = Math.acos(2 * v - 1);
    const r = 0.72 + (Math.random() - 0.5) * 0.05;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);
    const tone = y > 0.2 ? OLIVE : y < -0.2 ? G17 : ON;
    addPoint(w, x, y, z, 2.2 + Math.random() * 1.6, rgba(tone, 0.55 + Math.random() * 0.35));
  }
  const rings = 3;
  for (let ring = 0; ring < rings; ring++) {
    const tilt = ring * 0.55 + 0.3;
    const segments = Math.floor(CONTENT_LINE_SEGMENTS / rings) - 2;
    for (let s = 0; s < segments; s++) {
      const a0 = (s / segments) * Math.PI * 2;
      const a1 = ((s + 1) / segments) * Math.PI * 2;
      const r = 0.95 + ring * 0.12;
      const x0 = Math.cos(a0) * r;
      const z0 = Math.sin(a0) * r;
      const x1 = Math.cos(a1) * r;
      const z1 = Math.sin(a1) * r;
      const y0 = Math.sin(tilt) * z0 * 0.35;
      const y1 = Math.sin(tilt) * z1 * 0.35;
      addLine(
        w,
        x0,
        y0,
        Math.cos(tilt) * z0,
        x1,
        y1,
        Math.cos(tilt) * z1,
        rgba(ring === 1 ? ON : G16, 0.7),
        110 - ring * 20,
      );
    }
  }
  return finish(w);
}

/** Grafo argomento: anello di nodi + collegamenti (colore tema). */
export function shapeArgomenti(accentHex: string): StageShape {
  const accent = hexToRgb(accentHex);
  const w = writer();
  const nodes = 9;
  const nodeAngles = Array.from({ length: nodes }, (_, i) => (i / nodes) * Math.PI * 2);
  const nodePos = nodeAngles.map((a) => ({
    x: Math.cos(a) * 0.78,
    y: (Math.sin(a * 2) * 0.12),
    z: Math.sin(a) * 0.78,
  }));
  const perNode = Math.floor((CONTENT_POINT_COUNT * 0.72) / nodes);
  for (let n = 0; n < nodes; n++) {
    const c = nodePos[n];
    for (let i = 0; i < perNode && w.pi < CONTENT_POINT_COUNT; i++) {
      const t = i / perNode;
      const jr = 0.08 * (1 - t * 0.3);
      addPoint(
        w,
        c.x + Math.cos(t * 22) * jr,
        c.y + Math.sin(t * 18) * jr,
        c.z + Math.sin(t * 20) * jr,
        2.4 + (n % 3),
        rgba(n === 0 ? accent : n % 2 ? ON : G17, 0.65),
      );
    }
  }
  for (let i = 0; i < nodes; i++) {
    for (let j = i + 1; j < nodes; j++) {
      if (w.li >= CONTENT_LINE_SEGMENTS) break;
      if ((i + j) % 3 !== 0) continue;
      const a = nodePos[i];
      const b = nodePos[j];
      addLine(w, a.x, a.y, a.z, b.x, b.y, b.z, rgba(accent, 0.85), 95);
    }
  }
  const hub = 200;
  for (let i = 0; i < hub && w.pi < CONTENT_POINT_COUNT; i++) {
    const t = i / hub;
  addPoint(
      w,
      Math.cos(t * 30) * 0.12,
      Math.sin(t * 24) * 0.08,
      Math.sin(t * 28) * 0.12,
      3.2,
      rgba(ICE, 0.85),
    );
  }
  return finish(w);
}

const CACHE = new Map<string, StageShape>();

export function getShapeForScene(
  id: ContentSceneId,
  accentHex?: string,
): StageShape {
  const key = accentHex ? `${id}:${accentHex}` : id;
  const hit = CACHE.get(key);
  if (hit) return hit;
  let shape: StageShape = emptyShape();
  switch (id) {
    case "articoli-list":
      shape = shapeArticoliList();
      break;
    case "articoli-detail":
      shape = shapeArticoliDetail(
        accentHex ? hexToRgb(accentHex) : G16,
      );
      break;
    case "progetto":
      shape = shapeProgetto();
      break;
    case "argomenti":
      shape = shapeArgomenti(accentHex ?? "#1E3A8A");
      break;
    default:
      shape = shapeArticoliList();
  }
  CACHE.set(key, shape);
  return shape;
}