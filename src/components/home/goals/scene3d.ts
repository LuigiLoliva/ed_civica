/**
 * Mini motore 3D su Canvas 2D per le esperienze Goal 16/17:
 * proiezione prospettica, sprite luminosi additivi, primitive ombreggiate.
 * Niente dipendenze: resta leggero e self-contained nella cartella goals.
 */

export type Vec3 = { x: number; y: number; z: number };
export type Rgb = readonly [number, number, number];

export type Camera = {
  yaw: number;
  pitch: number;
  /** Distanza camera in unità mondo (più piccola = prospettiva più forte). */
  dist: number;
  /** Pixel per unità mondo sul piano dell'origine. */
  unit: number;
  cx: number;
  cy: number;
};

export type Projected = {
  x: number;
  y: number;
  /** Pixel per unità mondo a quella profondità. */
  s: number;
  /** Profondità in view space: positivo = più lontano. */
  z: number;
};

export const PALETTE = {
  white: [255, 255, 255],
  ice: [232, 246, 252],
  sky: [126, 200, 227],
  onu: [0, 158, 219],
  deep: [0, 104, 157],
  navy: [10, 40, 62],
  olive: [143, 173, 127],
  oliveDeep: [58, 86, 52],
  sage: [168, 196, 176],
} as const satisfies Record<string, Rgb>;

export const rgba = (c: Rgb, a: number) =>
  `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a)).toFixed(3)})`;

export const mixRgb = (a: Rgb, b: Rgb, t: number): Rgb => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

export const clamp = (v: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInOutCubic = (t: number) => {
  const c = clamp(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};
/** Fattore di smorzamento indipendente dal frame rate (dt in frame a 60fps). */
export const damp = (rate: number, dt: number) => 1 - Math.pow(1 - rate, dt);

export const add = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.x + b.x,
  y: a.y + b.y,
  z: a.z + b.z,
});
export const scale = (a: Vec3, k: number): Vec3 => ({
  x: a.x * k,
  y: a.y * k,
  z: a.z * k,
});
export const mix3 = (a: Vec3, b: Vec3, t: number): Vec3 => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  z: lerp(a.z, b.z, t),
});

/** Ruota un vettore mondo nello spazio camera (senza traslazione). */
export function toView(p: Vec3, cam: Camera): Vec3 {
  const cy = Math.cos(cam.yaw);
  const sy = Math.sin(cam.yaw);
  const cp = Math.cos(cam.pitch);
  const sp = Math.sin(cam.pitch);
  const x1 = p.x * cy - p.z * sy;
  const z1 = p.x * sy + p.z * cy;
  return {
    x: x1,
    y: p.y * cp + z1 * sp,
    z: -p.y * sp + z1 * cp,
  };
}

export function project(p: Vec3, cam: Camera): Projected {
  const v = toView(p, cam);
  const s = (cam.dist / Math.max(0.35, cam.dist + v.z)) * cam.unit;
  return { x: cam.cx + v.x * s, y: cam.cy - v.y * s, s, z: v.z };
}

/** Inverso di `project` per un punto a profondità view nota (drag dei nodi). */
export function unproject(
  sx: number,
  sy: number,
  viewZ: number,
  cam: Camera,
): Vec3 {
  const s = (cam.dist / Math.max(0.35, cam.dist + viewZ)) * cam.unit;
  const vx = (sx - cam.cx) / s;
  const vy = (cam.cy - sy) / s;
  const cp = Math.cos(cam.pitch);
  const sp = Math.sin(cam.pitch);
  const y = vy * cp - viewZ * sp;
  const z1 = vy * sp + viewZ * cp;
  const cy = Math.cos(cam.yaw);
  const syw = Math.sin(cam.yaw);
  return { x: vx * cy + z1 * syw, y, z: -vx * syw + z1 * cy };
}

/** Base ortonormale di un cerchio con normale inclinata `tilt` dall'asse Y. */
export function ringBasis(tilt: number, azimuth: number) {
  const u: Vec3 = { x: -Math.sin(azimuth), y: 0, z: Math.cos(azimuth) };
  const n: Vec3 = {
    x: Math.sin(tilt) * Math.cos(azimuth),
    y: Math.cos(tilt),
    z: Math.sin(tilt) * Math.sin(azimuth),
  };
  const v: Vec3 = {
    x: n.y * u.z - n.z * u.y,
    y: n.z * u.x - n.x * u.z,
    z: n.x * u.y - n.y * u.x,
  };
  return { u, v };
}

export function ringPoint(
  center: Vec3,
  radius: number,
  basis: { u: Vec3; v: Vec3 },
  angle: number,
): Vec3 {
  const c = Math.cos(angle) * radius;
  const s = Math.sin(angle) * radius;
  return {
    x: center.x + basis.u.x * c + basis.v.x * s,
    y: center.y + basis.u.y * c + basis.v.y * s,
    z: center.z + basis.u.z * c + basis.v.z * s,
  };
}

const spriteCache = new Map<string, HTMLCanvasElement>();

function glowSprite(color: Rgb): HTMLCanvasElement {
  const key = color.join(",");
  const cached = spriteCache.get(key);
  if (cached) return cached;
  const size = 128;
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const g = sprite.getContext("2d");
  if (g) {
    const grad = g.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    grad.addColorStop(0, rgba(color, 1));
    grad.addColorStop(0.18, rgba(color, 0.62));
    grad.addColorStop(0.45, rgba(color, 0.2));
    grad.addColorStop(0.75, rgba(color, 0.05));
    grad.addColorStop(1, rgba(color, 0));
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  spriteCache.set(key, sprite);
  return sprite;
}

/** Alone luminoso additivo (sprite pre-renderizzato: niente shadowBlur). */
export function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: Rgb,
  alpha: number,
) {
  if (alpha <= 0.004 || radius <= 0.2) return;
  const prevAlpha = ctx.globalAlpha;
  const prevOp = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.drawImage(
    glowSprite(color),
    x - radius,
    y - radius,
    radius * 2,
    radius * 2,
  );
  ctx.globalAlpha = prevAlpha;
  ctx.globalCompositeOperation = prevOp;
}

/** Sfera ombreggiata con riflesso orientato verso la luce (coordinate schermo). */
export function drawSphere(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  light: { x: number; y: number },
  body: Rgb,
  shade: Rgb,
  alpha = 1,
) {
  if (r <= 0.3) return;
  const dx = light.x - x;
  const dy = light.y - y;
  const d = Math.hypot(dx, dy) || 1;
  const reach = Math.min(1, d / (r * 3));
  const hx = x + (dx / d) * r * 0.45 * reach;
  const hy = y + (dy / d) * r * 0.45 * reach;
  const grad = ctx.createRadialGradient(hx, hy, r * 0.04, x, y, r);
  grad.addColorStop(0, rgba(PALETTE.white, 0.98 * alpha));
  grad.addColorStop(0.22, rgba(mixRgb(body, PALETTE.white, 0.35), alpha));
  grad.addColorStop(0.62, rgba(body, alpha));
  grad.addColorStop(1, rgba(shade, alpha));
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
}

/** Traccia un cerchio 3D a segmenti, attenuando la metà lontana. */
export function strokeRing3d(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  center: Vec3,
  radius: number,
  basis: { u: Vec3; v: Vec3 },
  opts: {
    color: Rgb;
    alpha: number;
    width: number;
    /** "back" disegna solo la metà lontana, "front" quella vicina. */
    pass?: "back" | "front" | "all";
    segments?: number;
    /** Frazione dell'arco da tracciare (intro). */
    sweep?: number;
  },
) {
  const segments = opts.segments ?? 72;
  const pass = opts.pass ?? "all";
  const sweep = opts.sweep ?? 1;
  if (opts.alpha <= 0.004 || sweep <= 0) return;
  const centerZ = project(center, cam).z;
  const count = Math.max(1, Math.round(segments * sweep));
  let prev = project(ringPoint(center, radius, basis, 0), cam);
  ctx.lineWidth = opts.width;
  ctx.lineCap = "round";
  for (let i = 1; i <= count; i++) {
    const next = project(
      ringPoint(center, radius, basis, (i / segments) * Math.PI * 2),
      cam,
    );
    const rel = ((prev.z + next.z) / 2 - centerZ) / radius;
    const isBack = rel > 0;
    if (pass === "all" || (pass === "back") === isBack) {
      ctx.strokeStyle = rgba(opts.color, opts.alpha * (0.62 - rel * 0.38));
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
    }
    prev = next;
  }
}

export function polygon(
  ctx: CanvasRenderingContext2D,
  points: readonly { x: number; y: number }[],
) {
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const p = points[i]!;
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
}

const BOX_FACES: readonly {
  n: Vec3;
  idx: readonly [number, number, number, number];
}[] = [
  { n: { x: 0, y: 1, z: 0 }, idx: [2, 3, 7, 6] },
  { n: { x: 0, y: -1, z: 0 }, idx: [0, 1, 5, 4] },
  { n: { x: 1, y: 0, z: 0 }, idx: [1, 3, 7, 5] },
  { n: { x: -1, y: 0, z: 0 }, idx: [0, 2, 6, 4] },
  { n: { x: 0, y: 0, z: 1 }, idx: [4, 5, 7, 6] },
  { n: { x: 0, y: 0, z: -1 }, idx: [0, 1, 3, 2] },
];

/** Cubo ombreggiato (flat shading in view space, back-face culling). */
export function drawBox(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  center: Vec3,
  half: number,
  rotY: number,
  lightView: Vec3,
  lit: Rgb,
  dark: Rgb,
  alpha = 1,
) {
  if (half <= 0.002) return;
  const c = Math.cos(rotY);
  const s = Math.sin(rotY);
  const rot = (p: Vec3): Vec3 => ({
    x: p.x * c - p.z * s,
    y: p.y,
    z: p.x * s + p.z * c,
  });
  const verts: Projected[] = [];
  for (let i = 0; i < 8; i++) {
    const local = {
      x: i & 1 ? half : -half,
      y: i & 2 ? half : -half,
      z: i & 4 ? half : -half,
    };
    verts.push(project(add(center, rot(local)), cam));
  }
  for (const face of BOX_FACES) {
    const nv = toView(rot(face.n), cam);
    if (nv.z > 0.05) continue;
    const diffuse = Math.max(
      0,
      nv.x * lightView.x + nv.y * lightView.y + nv.z * lightView.z,
    );
    const color = mixRgb(dark, lit, clamp(0.18 + diffuse * 0.92));
    const pts = face.idx.map((i) => verts[i]!);
    polygon(ctx, pts);
    ctx.fillStyle = rgba(color, alpha);
    ctx.fill();
    ctx.strokeStyle = rgba(PALETTE.white, 0.42 * alpha);
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
}

/** Famiglie font reali (next/font) per il testo su canvas. */
export function resolveFonts(el: Element) {
  const style = getComputedStyle(el);
  const serif = style.getPropertyValue("--font-serif").trim();
  const sans = style.getPropertyValue("--font-sans").trim();
  return {
    serif: serif ? `${serif}, Georgia, serif` : "Georgia, serif",
    sans: sans ? `${sans}, system-ui, sans-serif` : "system-ui, sans-serif",
  };
}

/** Testo maiuscolo spaziato; `letterSpacing` è ignorato dove non supportato. */
export function drawCaps(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  color: string,
  spacingPx: number,
  align: CanvasTextAlign = "center",
) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
    `${spacingPx}px`;
  ctx.fillText(text.toUpperCase(), x + (align === "center" ? spacingPx / 2 : 0), y);
  ctx.restore();
}
