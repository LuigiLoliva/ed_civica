/**
 * Token motion condivisi (JS) — allineati a `--motion-*` in globals.css.
 * Usare questi valori nei componenti Framer Motion per coerenza art direction.
 */

export const motionEase = {
  /** Entrata cinematografica (out-expo soft) */
  out: [0.22, 1, 0.36, 1] as const,
  /** Hover / magnetic snappy */
  snappy: [0.34, 1.2, 0.64, 1] as const,
  /** Inerzia cursore / spring-like cubic */
  inertia: [0.16, 1, 0.3, 1] as const,
  /** Clip / mask reveal */
  clip: [0.65, 0, 0.35, 1] as const,
};

export const motionDuration = {
  instant: 0.12,
  fast: 0.28,
  base: 0.55,
  slow: 0.85,
  cinematic: 1.15,
} as const;

export const motionSpring = {
  magnetic: { stiffness: 280, damping: 22, mass: 0.6 },
  cursor: { stiffness: 420, damping: 32, mass: 0.35 },
  soft: { stiffness: 120, damping: 24, mass: 0.8 },
} as const;

/** Attributi data-* per cursore contestuale */
export const cursorData = {
  attr: "data-cursor",
  values: {
    link: "link",
    cta: "cta",
    media: "media",
    text: "text",
  },
} as const;
