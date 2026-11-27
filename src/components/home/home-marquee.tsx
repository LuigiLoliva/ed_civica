"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useRef } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

const PHRASES = [
  "Pace",
  "Giustizia",
  "Istituzioni solide",
  "Partnership",
  "Cooperazione",
  "Diritti umani",
  "Agenda 2030",
];

/**
 * Nastro tipografico tra i capitoli: scorre da solo, accelera e si inclina
 * con la velocità dello scroll e ne segue la direzione.
 */
export function HomeMarquee() {
  const reduceMotion = usePrefersReducedMotion();
  const offset = useMotionValue(0);
  const direction = useRef(-1);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 320 });
  const boost = useTransform(smoothVelocity, [-2400, 0, 2400], [-6, 0, 6], {
    clamp: true,
  });
  const skewX = useTransform(smoothVelocity, [-2400, 0, 2400], [9, 0, -9], {
    clamp: true,
  });
  const x = useTransform(offset, (v) => `${v}%`);

  useAnimationFrame((_, delta) => {
    if (reduceMotion) return;
    const extra = boost.get();
    if (extra < -0.2) direction.current = 1;
    else if (extra > 0.2) direction.current = -1;
    const step = direction.current * (1.6 + Math.abs(extra) * 2.2) * (delta / 1000);
    let next = offset.get() + step;
    if (next <= -50) next += 50;
    if (next > 0) next -= 50;
    offset.set(next);
  });

  if (reduceMotion) {
    return (
      <div className="border-y border-foreground/15 px-5 py-8" aria-hidden>
        <p className="font-heading text-center text-2xl font-semibold tracking-tight text-goal-17 sm:text-3xl">
          {PHRASES.slice(0, 5).join(" · ")}
        </p>
      </div>
    );
  }

  const group = (
    <div className="flex shrink-0 items-center">
      {PHRASES.map((phrase, index) => (
        <span key={phrase} className="flex items-center">
          <span
            className={cn(
              "font-heading px-[0.35em] text-[clamp(2.75rem,7.5vw,7rem)] leading-none font-semibold tracking-[-0.03em]",
              index % 2 ? "text-goal-16" : "text-goal-17/20",
            )}
          >
            {phrase}
          </span>
          <span className="size-[clamp(0.5rem,1vw,0.9rem)] rounded-full bg-primary" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden border-y border-foreground/15 py-7 sm:py-10" aria-hidden>
      <motion.div className="flex w-max whitespace-nowrap will-change-transform" style={{ x, skewX }}>
        {group}
        {group}
      </motion.div>
    </div>
  );
}
