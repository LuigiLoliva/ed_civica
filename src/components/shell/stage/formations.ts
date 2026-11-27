import type { StageFormation } from "@/lib/shell/route-meta";

/** PRNG deterministico: stessa formazione a ogni visita, nessun mismatch. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TAU = Math.PI * 2;

type Writer = (i: number, x: number, y: number, z: number) => void;
type Generator = (n: number, rand: () => number, put: Writer) => void;

function gauss(rand: () => number) {
  return (rand() + rand() + rand() + rand() - 2) / 2;
}

const generators: Record<StageFormation, Generator> = {
  /** Sfera di voci + due orbite inclinate. */
  globe(n, rand, put) {
    const shell = Math.floor(n * 0.74);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < shell; i++) {
      const y = 1 - (i / (shell - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const a = i * golden;
      const k = 1 + gauss(rand) * 0.02;
      put(i, Math.cos(a) * r * k, y * k, Math.sin(a) * r * k);
    }
    for (let i = shell; i < n; i++) {
      const second = i % 2 === 0;
      const a = rand() * TAU;
      const radius = (second ? 1.42 : 1.26) + gauss(rand) * 0.02;
      const tilt = second ? 0.42 : -0.3;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;
      put(i, x, z * Math.sin(tilt), z * Math.cos(tilt));
    }
  },

  /** Superficie ondulata: un mare di pagine. */
  wave(n, rand, put) {
    const cols = Math.ceil(Math.sqrt(n * 2.2));
    const rows = Math.ceil(n / cols);
    for (let i = 0; i < n; i++) {
      const cx = (i % cols) / (cols - 1) - 0.5;
      const cz = Math.floor(i / cols) / Math.max(1, rows - 1) - 0.5;
      const x = cx * 4.6;
      const z = cz * 2.6;
      const y =
        Math.sin(x * 1.7 + z * 0.8) * 0.2 + Math.cos(z * 2.6 - x * 0.5) * 0.12;
      put(i, x, y - 0.1 + z * 0.22, z);
    }
  },

  /** Colonne verticali rade: ritmo di lettura. */
  stream(n, rand, put) {
    const columns = 11;
    for (let i = 0; i < n; i++) {
      const c = i % columns;
      const x = (c / (columns - 1) - 0.5) * 4.4 + gauss(rand) * 0.035;
      const y = (rand() - 0.5) * 3.4;
      const z = Math.sin(c * 1.9) * 0.7 + gauss(rand) * 0.06;
      put(i, x, y, z);
    }
  },

  /** Toro sottile: anello tematico. */
  ring(n, rand, put) {
    for (let i = 0; i < n; i++) {
      const a = rand() * TAU;
      const b = rand() * TAU;
      const tube = 0.2 + gauss(rand) * 0.03;
      const r = 1.12 + Math.cos(b) * tube;
      put(i, Math.cos(a) * r, Math.sin(b) * tube, Math.sin(a) * r);
    }
  },

  /** Comunità: nuclei attorno a un centro. */
  clusters(n, rand, put) {
    const centers: [number, number, number, number][] = [[0, 0, 0, 0.34]];
    for (let c = 0; c < 6; c++) {
      const a = (c / 6) * TAU + 0.3;
      centers.push([
        Math.cos(a) * 1.18,
        Math.sin(a) * 0.82,
        Math.sin(a * 2) * 0.5,
        0.2 + (c % 3) * 0.035,
      ]);
    }
    for (let i = 0; i < n; i++) {
      const [cx, cy, cz, spread] = centers[i % centers.length];
      put(
        i,
        cx + gauss(rand) * spread,
        cy + gauss(rand) * spread,
        cz + gauss(rand) * spread,
      );
    }
  },

  /** Reticolo cubico: il tavolo da gioco. */
  lattice(n, rand, put) {
    const side = Math.ceil(Math.cbrt(n));
    const size = 1.9;
    for (let i = 0; i < n; i++) {
      const x = i % side;
      const y = Math.floor(i / side) % side;
      const z = Math.floor(i / (side * side));
      put(
        i,
        (x / (side - 1) - 0.5) * size,
        (y / (side - 1) - 0.5) * size,
        (z / (side - 1) - 0.5) * size,
      );
    }
  },

  /** Doppia elica: progressione domanda dopo domanda. */
  helix(n, rand, put) {
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const strand = i % 3;
      const a = t * TAU * 3.2 + (strand === 1 ? Math.PI : 0);
      const y = (t - 0.5) * 3.2;
      if (strand === 2) {
        const k = rand() * 2 - 1;
        put(i, Math.cos(a) * 0.62 * k, y, Math.sin(a) * 0.62 * k);
      } else {
        const r = 0.62 + gauss(rand) * 0.025;
        put(i, Math.cos(a) * r, y, Math.sin(a) * r);
      }
    }
  },

  /** Anelli concentrici in profondità: una soglia. */
  portal(n, rand, put) {
    const rings = 7;
    for (let i = 0; i < n; i++) {
      const ring = i % rings;
      const a = rand() * TAU;
      const r = 0.72 + ring * 0.17 + gauss(rand) * 0.012;
      const z = 0.9 - ring * 0.42;
      put(i, Math.cos(a) * r * 1.25, Math.sin(a) * r, z);
    }
  },

  /** Righe orizzontali: strati di un documento. */
  strata(n, rand, put) {
    const lines = 9;
    for (let i = 0; i < n; i++) {
      const line = i % lines;
      const x = (rand() - 0.5) * 4.2;
      const y = (line / (lines - 1) - 0.5) * 2.5 + Math.sin(x * 1.3 + line) * 0.05;
      const z = Math.cos(line * 1.4) * 0.55 + gauss(rand) * 0.04;
      put(i, x, y, z);
    }
  },

  /** Voci disperse. */
  scatter(n, rand, put) {
    for (let i = 0; i < n; i++) {
      const u = rand() * 2 - 1;
      const a = rand() * TAU;
      const r = Math.cbrt(rand()) * 2.3;
      const s = Math.sqrt(1 - u * u);
      put(i, Math.cos(a) * s * r, u * r * 0.8, Math.sin(a) * s * r);
    }
  },
};

const formationSeed: Record<StageFormation, number> = {
  globe: 11,
  wave: 23,
  stream: 37,
  ring: 41,
  clusters: 53,
  lattice: 67,
  helix: 79,
  portal: 83,
  strata: 97,
  scatter: 101,
};

export function buildFormation(kind: StageFormation, n: number): Float32Array {
  const out = new Float32Array(n * 3);
  const rand = mulberry32(formationSeed[kind] * 7919 + n);
  generators[kind](n, rand, (i, x, y, z) => {
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  });
  return out;
}

/**
 * Segmenti di costellazione: ogni «hub» si lega ai due hub più vicini.
 * O(hubs²) su poche centinaia di punti, eseguito solo al cambio scena.
 */
export function buildLinks(
  positions: Float32Array,
  n: number,
  hubs: number,
): Uint16Array {
  const step = Math.max(1, Math.floor(n / hubs));
  const ids: number[] = [];
  for (let i = 0; i < n && ids.length < hubs; i += step) ids.push(i);

  const pairs: number[] = [];
  const seen = new Set<number>();
  const maxDist2 = 0.42 * 0.42;

  for (let a = 0; a < ids.length; a++) {
    const ia = ids[a] * 3;
    let best = -1;
    let second = -1;
    let bestD = Infinity;
    let secondD = Infinity;
    for (let b = 0; b < ids.length; b++) {
      if (a === b) continue;
      const ib = ids[b] * 3;
      const dx = positions[ia] - positions[ib];
      const dy = positions[ia + 1] - positions[ib + 1];
      const dz = positions[ia + 2] - positions[ib + 2];
      const d = dx * dx + dy * dy + dz * dz;
      if (d < bestD) {
        second = best;
        secondD = bestD;
        best = b;
        bestD = d;
      } else if (d < secondD) {
        second = b;
        secondD = d;
      }
    }
    for (const [b, d] of [
      [best, bestD],
      [second, secondD],
    ] as const) {
      if (b < 0 || d > maxDist2) continue;
      const key = a < b ? a * 4096 + b : b * 4096 + a;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push(ids[a], ids[b]);
    }
  }
  return new Uint16Array(pairs);
}
