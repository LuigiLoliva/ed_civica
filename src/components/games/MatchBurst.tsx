"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useMemo, useState } from "react";

type Burst = {
  id: string;
  x: number;
  y: number;
  color: string;
};

type MatchBurstProps = {
  /** Increment to fire a burst at the given point */
  triggerKey: number;
  x: number;
  y: number;
  color?: string;
};

const PARTICLE_COUNT = 12;

/**
 * Brief particle burst for match celebrations.
 * Purely visual — no game logic.
 */
export function MatchBurst({
  triggerKey,
  x,
  y,
  color = "var(--onu)",
}: MatchBurstProps) {
  const reduceMotion = useReducedMotion();
  const reactId = useId();
  const [bursts, setBursts] = useState<Burst[]>([]);

  useEffect(() => {
    if (!triggerKey || reduceMotion) return;
    const id = `${reactId}-${triggerKey}`;
    setBursts((prev) => [...prev, { id, x, y, color }]);
    const t = window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 700);
    return () => window.clearTimeout(t);
  }, [triggerKey, x, y, color, reduceMotion, reactId]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-visible"
      aria-hidden
    >
      <AnimatePresence>
        {bursts.map((burst) => (
          <BurstParticles key={burst.id} burst={burst} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function BurstParticles({ burst }: { burst: Burst }) {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (i % 2) * 0.2;
        const dist = 28 + (i % 3) * 14;
        return {
          i,
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          size: 4 + (i % 3),
          delay: i * 0.012,
        };
      }),
    [],
  );

  return (
    <motion.div
      className="absolute"
      style={{ left: burst.x, top: burst.y }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {particles.map((p) => (
        <motion.span
          key={p.i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
            background: burst.color,
            boxShadow: `0 0 8px ${burst.color}`,
          }}
          initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
          animate={{
            x: p.dx,
            y: p.dy,
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: 0.55,
            delay: p.delay,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      ))}
      <motion.span
        className="absolute rounded-full border-2"
        style={{
          width: 12,
          height: 12,
          marginLeft: -6,
          marginTop: -6,
          borderColor: burst.color,
        }}
        initial={{ scale: 0.3, opacity: 0.9 }}
        animate={{ scale: 3.2, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </motion.div>
  );
}
