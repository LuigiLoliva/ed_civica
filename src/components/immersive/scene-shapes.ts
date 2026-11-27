/**
 * Formazioni 3D a particelle per le intro delle pagine secondarie.
 * Ogni scena è una nuvola di punti (posizione + dimensione + tinta) generata
 * in modo deterministico: il motore le interpola tra una rotta e l'altra.
 * Spazio mondo: soggetto entro raggio ~1, y verso l'alto, z verso chi guarda.
 */

export type SceneId =
  | "gioca"
  | "quiz"
  | "memory"
  | "vero-falso"
  | "abbina"
  | "partnership"
  | "topic"
  | "privacy"
  | "cookie"
  | "login"
  | "registrati"
  | "forgot"
  | "reset"
  | "pending"
  | "lost";

export type Rgb = readonly [number, number, number];

export type Formation = {
  /** xyz per particella. */
  pos: Float32Array;
  /** dimensione, tinta (0..3 sulla palette) per particella. */
  meta: Float32Array;
  /** orbit = rotazione continua; sway = oscillazione (sagome leggibili). */
  spin: "orbit" | "sway";
  /** Inclinazione di base della camera (rad). */
  pitch: number;
  /** Override puntuali della palette (indice → colore lineare 0..1). */
  palette?: Partial<Record<0 | 1 | 2 | 3, Rgb>>;
};

type Rng = () => number;
/** x, y, z, size, tint */
type P = [number, number, number, number, number];
type Sampler = (rng: Rng) => P;
type Part = { w: number; s: Sampler };

const TAU = Math.PI * 2;

function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Xf = {
  s?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  t?: readonly [number, number, number];
};

/** Scala → rotX → rotY → rotZ → traslazione. */
function xf(sampler: Sampler, m: Xf): Sampler {
  const s = m.s ?? 1;
  const cx = Math.cos(m.rx ?? 0);
  const sx = Math.sin(m.rx ?? 0);
  const cy = Math.cos(m.ry ?? 0);
  const sy = Math.sin(m.ry ?? 0);
  const cz = Math.cos(m.rz ?? 0);
  const sz = Math.sin(m.rz ?? 0);
  const [tx, ty, tz] = m.t ?? [0, 0, 0];
  return (rng) => {
    const p = sampler(rng);
    let x = p[0] * s;
    let y = p[1] * s;
    let z = p[2] * s;
    let ny = y * cx - z * sx;
    let nz = y * sx + z * cx;
    y = ny;
    z = nz;
    let nx = x * cy + z * sy;
    nz = -x * sy + z * cy;
    x = nx;
    z = nz;
    nx = x * cz - y * sz;
    ny = x * sz + y * cz;
    return [nx + tx, ny + ty, nz + tz, p[3], p[4]];
  };
}

function group(parts: Part[], m: Xf): Part[] {
  return parts.map((part) => ({ w: part.w, s: xf(part.s, m) }));
}

const jitter = (rng: Rng, k: number) => (rng() - 0.5) * k;

function ring(r: number, size: number, tint: number, fuzz = 0.012): Sampler {
  return (rng) => {
    const a = rng() * TAU;
    return [
      Math.cos(a) * r + jitter(rng, fuzz),
      Math.sin(a) * r + jitter(rng, fuzz),
      jitter(rng, fuzz),
      size,
      tint + jitter(rng, 0.5),
    ];
  };
}

function arc(
  r: number,
  from: number,
  to: number,
  size: number,
  tint: number,
): Sampler {
  return (rng) => {
    const a = from + rng() * (to - from);
    return [
      Math.cos(a) * r + jitter(rng, 0.012),
      Math.sin(a) * r + jitter(rng, 0.012),
      jitter(rng, 0.012),
      size,
      tint,
    ];
  };
}

function sphere(r: number, size: number, tint: number): Sampler {
  return (rng) => {
    const u = rng() * 2 - 1;
    const a = rng() * TAU;
    const k = Math.sqrt(1 - u * u);
    return [Math.cos(a) * k * r, u * r, Math.sin(a) * k * r, size, tint];
  };
}

/** Globo a meridiani e paralleli. */
function globe(
  r: number,
  parallels: number,
  meridians: number,
  size: number,
  tint: number,
): Sampler {
  return (rng) => {
    if (rng() < 0.5) {
      const lat =
        ((Math.floor(rng() * parallels) + 1) / (parallels + 1)) * Math.PI -
        Math.PI / 2;
      const a = rng() * TAU;
      const k = Math.cos(lat) * r;
      return [Math.cos(a) * k, Math.sin(lat) * r, Math.sin(a) * k, size, tint];
    }
    const lon = (Math.floor(rng() * meridians) / meridians) * TAU;
    const a = rng() * TAU;
    const k = Math.cos(a) * r;
    return [
      Math.cos(lon) * k,
      Math.sin(a) * r,
      Math.sin(lon) * k,
      size,
      tint + 0.6,
    ];
  };
}

function seg(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  size: number,
  tint: number,
  fuzz = 0.01,
): Sampler {
  return (rng) => {
    const t = rng();
    return [
      a[0] + (b[0] - a[0]) * t + jitter(rng, fuzz),
      a[1] + (b[1] - a[1]) * t + jitter(rng, fuzz),
      a[2] + (b[2] - a[2]) * t + jitter(rng, fuzz),
      size,
      tint,
    ];
  };
}

type V3 = readonly [number, number, number];

function bezier(p0: V3, p1: V3, p2: V3, p3: V3, size: number, tint: number): Sampler {
  return (rng) => {
    const t = rng();
    const u = 1 - t;
    const a = u * u * u;
    const b = 3 * u * u * t;
    const c = 3 * u * t * t;
    const d = t * t * t;
    return [
      a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0] + jitter(rng, 0.012),
      a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1] + jitter(rng, 0.012),
      a * p0[2] + b * p1[2] + c * p2[2] + d * p3[2] + jitter(rng, 0.012),
      size,
      tint + t * 0.8,
    ];
  };
}

/** Contorno di un rettangolo (carta) sul piano xy. */
function rectOutline(w: number, h: number, size: number, tint: number): Sampler {
  const per = 2 * (w + h);
  return (rng) => {
    let d = rng() * per;
    let x: number;
    let y: number;
    if (d < w) {
      x = d - w / 2;
      y = h / 2;
    } else if ((d -= w) < h) {
      x = w / 2;
      y = h / 2 - d;
    } else if ((d -= h) < w) {
      x = w / 2 - d;
      y = -h / 2;
    } else {
      d -= w;
      x = -w / 2;
      y = d - h / 2;
    }
    return [x + jitter(rng, 0.008), y + jitter(rng, 0.008), 0, size, tint];
  };
}

function rectFill(w: number, h: number, size: number, tint: number): Sampler {
  return (rng) => [(rng() - 0.5) * w, (rng() - 0.5) * h, 0, size, tint];
}

/** Carta: contorno marcato + riempimento rado. */
function card(w: number, h: number, weight: number, tint: number): Part[] {
  return [
    { w: weight * 0.72, s: rectOutline(w, h, 1, tint + 0.6) },
    { w: weight * 0.28, s: rectFill(w, h, 0.65, tint) },
  ];
}

function cubeEdges(half: number, size: number, tint: number): Sampler {
  return (rng) => {
    const axis = Math.floor(rng() * 3);
    const a = rng() < 0.5 ? -half : half;
    const b = rng() < 0.5 ? -half : half;
    const t = (rng() * 2 - 1) * half;
    const p: [number, number, number] =
      axis === 0 ? [t, a, b] : axis === 1 ? [a, t, b] : [a, b, t];
    return [
      p[0] + jitter(rng, 0.01),
      p[1] + jitter(rng, 0.01),
      p[2] + jitter(rng, 0.01),
      size,
      tint,
    ];
  };
}

function cubeFaces(half: number, size: number, tint: number): Sampler {
  return (rng) => {
    const axis = Math.floor(rng() * 3);
    const side = rng() < 0.5 ? -half : half;
    const u = (rng() * 2 - 1) * half;
    const v = (rng() * 2 - 1) * half;
    const p: [number, number, number] =
      axis === 0 ? [side, u, v] : axis === 1 ? [u, side, v] : [u, v, side];
    return [p[0], p[1], p[2], size, tint];
  };
}

/** Nodo luminoso: piccola sfera piena. */
function ball(r: number, size: number, tint: number): Sampler {
  return (rng) => {
    const u = rng() * 2 - 1;
    const a = rng() * TAU;
    const k = Math.sqrt(1 - u * u) * r * Math.cbrt(rng());
    return [Math.cos(a) * k, u * r * Math.cbrt(rng()), Math.sin(a) * k, size, tint];
  };
}

/** Pulviscolo in un guscio sferico. */
function dust(rMin: number, rMax: number, size = 0.6, tint = 0.4): Sampler {
  return (rng) => {
    const u = rng() * 2 - 1;
    const a = rng() * TAU;
    const k = Math.sqrt(1 - u * u);
    const r = rMin + (rMax - rMin) * rng();
    return [
      Math.cos(a) * k * r,
      u * r * 0.72,
      Math.sin(a) * k * r,
      size * (0.6 + rng() * 0.8),
      tint + rng() * 0.9,
    ];
  };
}

function at(sampler: Sampler, t: V3): Sampler {
  return xf(sampler, { t });
}

/* ---------- Sagome 2D campionate (estruse in profondità) ---------- */

type Mask = { fill: Float32Array; edge: Float32Array };
const MASK_SIZE = 200;
const maskCache = new Map<string, Mask>();

function getMask(key: string, draw: (ctx: CanvasRenderingContext2D) => void): Mask {
  const cached = maskCache.get(key);
  if (cached) return cached;

  const S = MASK_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const fill: number[] = [];
  const edge: number[] = [];

  if (ctx) {
    ctx.scale(S / 100, S / 100);
    ctx.fillStyle = "#000";
    ctx.strokeStyle = "#000";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    draw(ctx);
    const data = ctx.getImageData(0, 0, S, S).data;
    const on = (x: number, y: number) =>
      x >= 0 && y >= 0 && x < S && y < S && data[(y * S + x) * 4 + 3] > 110;
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        if (!on(x, y)) continue;
        const border =
          !on(x - 1, y) || !on(x + 1, y) || !on(x, y - 1) || !on(x, y + 1);
        (border ? edge : fill).push(x, y);
      }
    }
  }

  if (edge.length === 0) edge.push(S / 2, S / 2);
  if (fill.length === 0) fill.push(S / 2, S / 2);

  const mask = { fill: new Float32Array(fill), edge: new Float32Array(edge) };
  maskCache.set(key, mask);
  return mask;
}

/** Sagoma estrusa: bordi nitidi sulle due facce, interno rado. */
function silhouette(
  key: string,
  draw: (ctx: CanvasRenderingContext2D) => void,
  depth: number,
  tintEdge = 2.4,
  tintFill = 1,
): Sampler {
  const mask = getMask(key, draw);
  const S = MASK_SIZE;
  return (rng) => {
    const onEdge = rng() < 0.62;
    const list = onEdge ? mask.edge : mask.fill;
    const i = Math.floor(rng() * (list.length / 2)) * 2;
    const x = ((list[i] + rng()) / S - 0.5) * 2;
    const y = -((list[i + 1] + rng()) / S - 0.5) * 2;
    let z: number;
    if (onEdge) {
      const r = rng();
      z = r < 0.42 ? depth : r < 0.84 ? -depth : (rng() * 2 - 1) * depth;
    } else {
      z = rng() < 0.5 ? depth : -depth;
    }
    return [
      x,
      y,
      z,
      onEdge ? 1.05 : 0.6,
      onEdge ? tintEdge + jitter(rng, 0.6) : tintFill + jitter(rng, 0.6),
    ];
  };
}

function carve(ctx: CanvasRenderingContext2D, cut: () => void) {
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  cut();
  ctx.restore();
}

const drawShield = (ctx: CanvasRenderingContext2D) => {
  ctx.beginPath();
  ctx.moveTo(50, 5);
  ctx.bezierCurveTo(62, 13, 76, 17, 89, 17);
  ctx.lineTo(89, 48);
  ctx.bezierCurveTo(89, 72, 71, 88, 50, 96);
  ctx.bezierCurveTo(29, 88, 11, 72, 11, 48);
  ctx.lineTo(11, 17);
  ctx.bezierCurveTo(24, 17, 38, 13, 50, 5);
  ctx.fill();
  carve(ctx, () => {
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(32, 50);
    ctx.lineTo(45, 63);
    ctx.lineTo(69, 36);
    ctx.stroke();
  });
};

const drawPadlock = (ctx: CanvasRenderingContext2D) => {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(19, 44, 62, 50, 9);
  else ctx.rect(19, 44, 62, 50);
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(31, 46);
  ctx.lineTo(31, 31);
  ctx.arc(50, 31, 19, Math.PI, 0);
  ctx.lineTo(69, 46);
  ctx.stroke();
  carve(ctx, () => {
    ctx.beginPath();
    ctx.arc(50, 63, 7, 0, TAU);
    ctx.fill();
    ctx.fillRect(46.5, 64, 7, 16);
  });
};

const drawKey = (ctx: CanvasRenderingContext2D) => {
  ctx.beginPath();
  ctx.arc(27, 50, 21, 0, TAU);
  ctx.fill();
  ctx.fillRect(44, 45, 50, 10);
  ctx.fillRect(70, 54, 8, 15);
  ctx.fillRect(84, 54, 8, 11);
  carve(ctx, () => {
    ctx.beginPath();
    ctx.arc(24, 50, 9, 0, TAU);
    ctx.fill();
  });
};

const drawKeyhole = (ctx: CanvasRenderingContext2D) => {
  ctx.beginPath();
  ctx.arc(50, 36, 20, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(41, 46);
  ctx.lineTo(59, 46);
  ctx.lineTo(68, 90);
  ctx.lineTo(32, 90);
  ctx.closePath();
  ctx.fill();
};

const drawPerson = (ctx: CanvasRenderingContext2D) => {
  ctx.beginPath();
  ctx.arc(50, 32, 17, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(14, 94);
  ctx.bezierCurveTo(14, 66, 32, 56, 50, 56);
  ctx.bezierCurveTo(68, 56, 86, 66, 86, 94);
  ctx.closePath();
  ctx.fill();
};

const drawHourglass = (ctx: CanvasRenderingContext2D) => {
  ctx.fillRect(22, 6, 56, 8);
  ctx.fillRect(22, 86, 56, 8);
  ctx.beginPath();
  ctx.moveTo(29, 14);
  ctx.lineTo(71, 14);
  ctx.bezierCurveTo(71, 38, 55, 44, 55, 50);
  ctx.bezierCurveTo(55, 56, 71, 62, 71, 86);
  ctx.lineTo(29, 86);
  ctx.bezierCurveTo(29, 62, 45, 56, 45, 50);
  ctx.bezierCurveTo(45, 44, 29, 38, 29, 14);
  ctx.fill();
  carve(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(37, 20);
    ctx.lineTo(63, 20);
    ctx.bezierCurveTo(62, 30, 56, 34, 50, 38);
    ctx.bezierCurveTo(44, 34, 38, 30, 37, 20);
    ctx.fill();
  });
};

const drawCheck = (ctx: CanvasRenderingContext2D) => {
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(20, 52);
  ctx.lineTo(41, 73);
  ctx.lineTo(81, 27);
  ctx.stroke();
};

const drawCross = (ctx: CanvasRenderingContext2D) => {
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(25, 25);
  ctx.lineTo(75, 75);
  ctx.moveTo(75, 25);
  ctx.lineTo(25, 75);
  ctx.stroke();
};

const drawGlyph =
  (text: string, px: number, y = 54) =>
  (ctx: CanvasRenderingContext2D) => {
    ctx.font = `700 ${px}px Georgia, "Times New Roman", serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 50, y);
  };

/* ---------- Scene ---------- */

type SceneDef = Omit<Formation, "pos" | "meta"> & { parts: () => Part[] };

const scenes: Record<SceneId, SceneDef> = {
  /** Dado centrale + carte in orbita: quiz e mini-giochi. */
  gioca: {
    spin: "orbit",
    pitch: 0.3,
    parts: () => {
      const h = 0.36;
      const pip = (p: V3): Part => ({ w: 0.14, s: at(ball(0.05, 1.5, 3), p) });
      const k = h * 0.52;
      const die: Part[] = [
        { w: 2.3, s: cubeEdges(h, 1.05, 2.3) },
        { w: 1.1, s: cubeFaces(h, 0.6, 0.6) },
        pip([0, 0, h]),
        pip([h, k, k]),
        pip([h, 0, 0]),
        pip([h, -k, -k]),
        pip([-k, h, -k]),
        pip([k, h, k]),
        pip([-h, k, k]),
        pip([-h, k, -k]),
        pip([-h, -k, k]),
        pip([-h, -k, -k]),
      ];
      const cards: Part[] = [];
      const n = 6;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + 0.3;
        cards.push(
          ...group(card(0.27, 0.38, 0.52, 1), {
            rx: Math.sin(i * 2.1) * 0.35,
            ry: -a + Math.PI / 2,
            rz: Math.cos(i * 1.7) * 0.3,
            t: [Math.cos(a) * 0.95, Math.sin(i * 1.9) * 0.24, Math.sin(a) * 0.95],
          }),
        );
      }
      return [
        ...group(die, { rx: 0.62, ry: 0.78 }),
        ...cards,
        { w: 0.8, s: xf(ring(0.95, 0.7, 0.5), { rx: Math.PI / 2 }) },
        { w: 0.9, s: dust(0.55, 1.35) },
      ];
    },
  },

  /** Punto interrogativo con orbite e quattro risposte. */
  quiz: {
    spin: "sway",
    pitch: 0.08,
    parts: () => {
      const answers: Part[] = [];
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + 0.6;
        answers.push({
          w: 0.2,
          s: at(ball(0.06, 1.5, 3), [Math.cos(a) * 0.98, Math.sin(a) * 0.98, 0]),
        });
      }
      return [
        {
          w: 3.3,
          s: xf(silhouette("glyph-?", drawGlyph("?", 98), 0.13), { s: 0.82 }),
        },
        ...group(
          [{ w: 0.8, s: ring(0.98, 0.75, 0.8) }, ...answers],
          { rx: 1.18, rz: 0.3 },
        ),
        { w: 0.6, s: xf(ring(0.78, 0.7, 0.4), { rx: 1.36, rz: -0.5 }) },
        { w: 0.7, s: dust(0.5, 1.3) },
      ];
    },
  },

  /** Griglia di carte, due già girate. */
  memory: {
    spin: "sway",
    pitch: 0.16,
    parts: () => {
      const parts: Part[] = [];
      const cw = 0.3;
      const ch = 0.4;
      const gap = 0.075;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
          const x = (c - 1.5) * (cw + gap);
          const y = (1 - r) * (ch + gap);
          const z = -0.32 * x * x;
          const flipped = (r === 0 && c === 2) || (r === 1 && c === 1);
          if (flipped) {
            parts.push(
              ...group(
                [
                  { w: 0.5, s: rectOutline(cw, ch, 1.15, 2.8) },
                  { w: 0.35, s: rectFill(cw, ch, 0.7, 1.6) },
                  { w: 0.3, s: ring(0.085, 1.2, 3, 0.006) },
                ],
                { ry: -0.5, t: [x, y, z + 0.16] },
              ),
            );
          } else {
            parts.push(
              ...group(card(cw, ch, 0.42, 0.7), { ry: x * 0.4, t: [x, y, z] }),
            );
          }
        }
      }
      parts.push({ w: 0.7, s: dust(0.7, 1.35) });
      return parts;
    },
  },

  /** Due gettoni: falso (croce) e vero (spunta). */
  "vero-falso": {
    spin: "sway",
    pitch: 0.1,
    palette: { 0: [0.96, 0.4, 0.5], 3: [0.42, 0.9, 0.66] },
    parts: () => [
      ...group(
        [
          { w: 1.5, s: xf(silhouette("cross", drawCross, 0.07, 0, 0), { s: 0.27 }) },
          { w: 0.8, s: ring(0.43, 0.9, 1.4) },
          { w: 0.35, s: ring(0.5, 0.6, 1) },
        ],
        { ry: 0.5, t: [-0.54, 0, 0] },
      ),
      ...group(
        [
          { w: 1.5, s: xf(silhouette("check", drawCheck, 0.07, 3, 3), { s: 0.27 }) },
          { w: 0.8, s: ring(0.43, 0.9, 1.8) },
          { w: 0.35, s: ring(0.5, 0.6, 1.4) },
        ],
        { ry: -0.5, t: [0.54, 0, 0] },
      ),
      {
        w: 0.45,
        s: bezier([-0.4, 0.5, 0.1], [-0.15, 0.78, 0.3], [0.15, 0.78, 0.3], [0.4, 0.5, 0.1], 0.8, 1.2),
      },
      {
        w: 0.45,
        s: bezier([0.4, -0.5, 0.1], [0.15, -0.78, 0.3], [-0.15, -0.78, 0.3], [-0.4, -0.5, 0.1], 0.8, 1.2),
      },
      { w: 0.7, s: dust(0.75, 1.35, 0.6, 1.1) },
    ],
  },

  /** Due colonne di nodi unite da legami incrociati. */
  abbina: {
    spin: "sway",
    pitch: 0.12,
    parts: () => {
      const ys = [0.52, 0, -0.52];
      const perm = [2, 0, 1];
      const parts: Part[] = [];
      ys.forEach((y, i) => {
        const left: V3 = [-0.6, y, 0];
        const right: V3 = [0.6, ys[perm[i]], 0];
        const bulge = (i - 1) * 0.34 + 0.12;
        parts.push(
          { w: 0.3, s: at(ball(0.085, 1.5, 3), left) },
          { w: 0.3, s: at(ball(0.085, 1.5, 3), [0.6, y, 0]) },
          { w: 0.34, s: at(rectOutline(0.4, 0.2, 0.85, 1.2), [-0.84, y, 0]) },
          { w: 0.34, s: at(rectOutline(0.4, 0.2, 0.85, 1.2), [0.84, y, 0]) },
          {
            w: 0.75,
            s: bezier(left, [-0.15, y, bulge], [0.15, right[1], bulge], right, 0.9, 1.5),
          },
        );
      });
      parts.push({ w: 0.7, s: dust(0.8, 1.35) });
      return group(parts, { s: 0.86 });
    },
  },

  /** Globo centrale e cinque attori collegati. */
  partnership: {
    spin: "orbit",
    pitch: 0.34,
    parts: () => {
      const parts: Part[] = [{ w: 1.7, s: globe(0.34, 5, 8, 0.85, 1.3) }];
      const n = 5;
      const nodes: V3[] = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU;
        nodes.push([Math.cos(a) * 0.86, Math.sin(i * 2.4) * 0.2, Math.sin(a) * 0.86]);
      }
      nodes.forEach((node, i) => {
        const next = nodes[(i + 1) % n];
        parts.push(
          { w: 0.34, s: at(ball(0.095, 1.45, 3), node) },
          { w: 0.2, s: at(sphere(0.15, 0.6, 2), node) },
          { w: 0.3, s: seg([0, 0, 0], node, 0.75, 1.6) },
          { w: 0.26, s: seg(node, next, 0.7, 1) },
        );
      });
      parts.push(
        { w: 0.5, s: xf(ring(1.02, 0.65, 0.5), { rx: Math.PI / 2 }) },
        { w: 0.8, s: dust(0.5, 1.35) },
      );
      return parts;
    },
  },

  /** Globo dell'argomento con pagine in orbita. */
  topic: {
    spin: "orbit",
    pitch: 0.28,
    parts: () => {
      const pages: Part[] = [];
      const n = 7;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU;
        pages.push(
          ...group(card(0.2, 0.27, 0.34, 1.4), {
            ry: -a + Math.PI / 2,
            rz: Math.sin(i * 1.3) * 0.2,
            t: [Math.cos(a) * 0.96, Math.sin(i * 2.2) * 0.1, Math.sin(a) * 0.96],
          }),
        );
      }
      return [
        { w: 2.5, s: globe(0.52, 7, 12, 0.85, 1.2) },
        { w: 0.5, s: sphere(0.52, 0.55, 0.4) },
        ...pages,
        { w: 0.6, s: xf(ring(0.96, 0.65, 0.6), { rx: Math.PI / 2 }) },
        { w: 0.7, s: dust(0.65, 1.35) },
      ];
    },
  },

  /** Scudo con spunta e orbite di protezione. */
  privacy: {
    spin: "sway",
    pitch: 0.06,
    parts: () => [
      { w: 3.5, s: xf(silhouette("shield", drawShield, 0.11), { s: 0.74 }) },
      { w: 0.7, s: xf(ring(1.0, 0.75, 0.8), { rx: 1.25 }) },
      { w: 0.6, s: xf(ring(1.06, 0.7, 0.5), { rx: 1.25, ry: 0.6, rz: 0.4 }) },
      { w: 0.25, s: at(ball(0.06, 1.5, 3), [1.0, 0, 0]) },
      { w: 0.7, s: dust(0.75, 1.35) },
    ],
  },

  /** Biscotto con morso e gocce di cioccolato. */
  cookie: {
    spin: "sway",
    pitch: 0.2,
    parts: () => {
      const R = 0.64;
      const T = 0.075;
      const bite: [number, number, number] = [R * 0.8, R * 0.62, 0.3];
      const outsideBite = (x: number, y: number) =>
        Math.hypot(x - bite[0], y - bite[1]) > bite[2];
      const face: Sampler = (rng) => {
        for (let k = 0; k < 12; k++) {
          const a = rng() * TAU;
          const r = Math.sqrt(rng()) * R;
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r;
          if (outsideBite(x, y)) {
            return [x, y, rng() < 0.5 ? T : -T, 0.65, 0.5 + rng() * 0.8];
          }
        }
        return [-R * 0.3, 0, T, 0.65, 0.8];
      };
      const rim: Sampler = (rng) => {
        for (let k = 0; k < 12; k++) {
          const a = rng() * TAU;
          const x = Math.cos(a) * R;
          const y = Math.sin(a) * R;
          if (outsideBite(x, y)) {
            return [x, y, (rng() * 2 - 1) * T, 1, 2.2];
          }
        }
        return [-R, 0, 0, 1, 2.2];
      };
      const biteEdge: Sampler = (rng) => {
        for (let k = 0; k < 16; k++) {
          const a = rng() * TAU;
          const x = bite[0] + Math.cos(a) * bite[2];
          const y = bite[1] + Math.sin(a) * bite[2];
          if (Math.hypot(x, y) < R) return [x, y, (rng() * 2 - 1) * T, 1, 2.6];
        }
        return [bite[0] - bite[2], bite[1], 0, 1, 2.6];
      };
      const chips: Part[] = (
        [
          [-0.3, 0.28],
          [0.02, 0.1],
          [-0.36, -0.14],
          [0.22, -0.3],
          [-0.08, -0.38],
          [0.36, 0.02],
          [-0.02, 0.44],
        ] as const
      ).map(([x, y]) => ({ w: 0.16, s: at(ball(0.055, 1.5, 3), [x, y, T + 0.03]) }));
      const crumbs: Sampler = (rng) => [
        bite[0] + 0.1 + rng() * 0.4,
        bite[1] + 0.05 + rng() * 0.35,
        jitter(rng, 0.3),
        0.8,
        2 + rng(),
      ];
      return [
        ...group(
          [
            { w: 1.9, s: face },
            { w: 1.2, s: rim },
            { w: 0.5, s: biteEdge },
            ...chips,
            { w: 0.2, s: crumbs },
          ],
          { rx: -0.55, ry: 0.25, rz: 0.15 },
        ),
        { w: 0.6, s: xf(ring(1.0, 0.7, 0.6), { rx: 1.3, rz: -0.25 }) },
        { w: 0.6, s: dust(0.8, 1.35) },
      ];
    },
  },

  /** Portale ad anelli con serratura: area riservata. */
  login: {
    spin: "sway",
    pitch: 0.04,
    parts: () => {
      const parts: Part[] = [];
      const n = 8;
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        parts.push({
          w: 0.5 - t * 0.2,
          s: at(ring(0.98 - t * 0.5, 0.9 - t * 0.3, 2.2 - t * 2), [0, 0, 0.25 - t * 2.1]),
        });
      }
      parts.push(
        { w: 1.7, s: xf(silhouette("keyhole", drawKeyhole, 0.06, 3, 2), { s: 0.36, t: [0, 0, 0.3] }) },
        { w: 0.7, s: dust(0.3, 1.3) },
      );
      return parts;
    },
  },

  /** Profilo che entra nella rete della redazione. */
  registrati: {
    spin: "sway",
    pitch: 0.1,
    parts: () => {
      const net: Part[] = [{ w: 0.6, s: ring(1.02, 0.7, 0.8) }];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + 0.4;
        net.push({
          w: 0.2,
          s: at(ball(0.055, 1.4, i === 0 ? 3 : 2), [Math.cos(a) * 1.02, Math.sin(a) * 1.02, 0]),
        });
      }
      return [
        { w: 2.3, s: xf(silhouette("person", drawPerson, 0.09), { s: 0.5, t: [0, -0.02, 0] }) },
        { w: 0.9, s: ring(0.76, 0.9, 1.6) },
        ...group(net, { rx: 1.2, rz: 0.2 }),
        { w: 0.16, s: seg([0.62, 0.66, 0.1], [0.86, 0.66, 0.1], 1.2, 3) },
        { w: 0.16, s: seg([0.74, 0.54, 0.1], [0.74, 0.78, 0.1], 1.2, 3) },
        { w: 0.7, s: dust(0.8, 1.35) },
      ];
    },
  },

  /** Chiave in orbita: recupero password. */
  forgot: {
    spin: "sway",
    pitch: 0.1,
    parts: () => [
      { w: 3.1, s: xf(silhouette("key", drawKey, 0.09), { s: 0.68, rz: -0.6 }) },
      { w: 0.7, s: xf(ring(0.98, 0.75, 0.8), { rx: 1.25, rz: 0.3 }) },
      { w: 0.5, s: xf(ring(0.84, 0.7, 0.5), { rx: 1.4, rz: -0.4 }) },
      { w: 0.7, s: dust(0.7, 1.35) },
    ],
  },

  /** Lucchetto con freccia di rinnovo. */
  reset: {
    spin: "sway",
    pitch: 0.08,
    parts: () => [
      { w: 3, s: xf(silhouette("padlock", drawPadlock, 0.1), { s: 0.56 }) },
      { w: 0.9, s: arc(0.94, 0.5, 0.5 + TAU * 0.84, 0.9, 1.6) },
      { w: 0.14, s: seg([0.825, 0.45, 0], [0.843, 0.688, 0], 1.1, 3) },
      { w: 0.14, s: seg([0.825, 0.45, 0], [0.615, 0.564, 0], 1.1, 3) },
      { w: 0.7, s: dust(0.75, 1.35) },
    ],
  },

  /** Clessidra dentro un quadrante: account in attesa. */
  pending: {
    spin: "sway",
    pitch: 0.08,
    parts: () => {
      const ticks: Part[] = [];
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU;
        ticks.push({
          w: 0.09,
          s: at(ball(0.035, 1.3, i % 3 === 0 ? 3 : 2), [Math.cos(a) * 0.94, Math.sin(a) * 0.94, 0]),
        });
      }
      return [
        { w: 2.7, s: xf(silhouette("hourglass", drawHourglass, 0.1), { s: 0.56 }) },
        { w: 0.7, s: ring(0.94, 0.75, 1) },
        ...ticks,
        { w: 0.7, s: dust(0.75, 1.35) },
      ];
    },
  },

  /** 404 alla deriva tra i frammenti di un'orbita spezzata. */
  lost: {
    spin: "sway",
    pitch: 0.12,
    parts: () => [
      {
        w: 3.2,
        s: xf(silhouette("glyph-404", drawGlyph("404", 50, 52), 0.1), { s: 0.98, rz: -0.08 }),
      },
      { w: 0.7, s: xf(arc(1.0, 0.4, 4.6, 0.8, 0.9), { rx: 1.2, rz: 0.25 }) },
      { w: 1.3, s: dust(0.45, 1.5, 0.75, 0.6) },
    ],
  },
};

const formationCache = new Map<string, Formation>();

export function buildFormation(scene: SceneId, count: number): Formation {
  const key = `${scene}:${count}`;
  const cached = formationCache.get(key);
  if (cached) return cached;

  const def = scenes[scene];
  const parts = def.parts();
  const total = parts.reduce((sum, part) => sum + part.w, 0);
  const rng = mulberry32(scene.length * 7919 + count);
  const pos = new Float32Array(count * 3);
  const meta = new Float32Array(count * 2);

  let i = 0;
  parts.forEach((part, index) => {
    const isLast = index === parts.length - 1;
    const n = isLast ? count - i : Math.min(count - i, Math.round((part.w / total) * count));
    for (let k = 0; k < n; k++, i++) {
      const p = part.s(rng);
      pos[i * 3] = p[0];
      pos[i * 3 + 1] = p[1];
      pos[i * 3 + 2] = p[2];
      meta[i * 2] = p[3];
      meta[i * 2 + 1] = Math.max(0, Math.min(3, p[4]));
    }
  });

  const formation: Formation = {
    pos,
    meta,
    spin: def.spin,
    pitch: def.pitch,
    palette: def.palette,
  };
  formationCache.set(key, formation);
  return formation;
}

/** Nuvola dispersa da cui le particelle convergono al primo ingresso. */
export function scatterFormation(count: number): Pick<Formation, "pos" | "meta"> {
  const rng = mulberry32(977);
  const sampler = dust(1.7, 3.1, 0.6, 0.6);
  const pos = new Float32Array(count * 3);
  const meta = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const p = sampler(rng);
    pos[i * 3] = p[0];
    pos[i * 3 + 1] = p[1];
    pos[i * 3 + 2] = p[2] - 0.6;
    meta[i * 2] = p[3];
    meta[i * 2 + 1] = Math.min(3, p[4]);
  }
  return { pos, meta };
}
