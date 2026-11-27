"use client";

import { motion, useScroll, useSpring } from "framer-motion";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Barra sottile di avanzamento scroll pagina (solo sito pubblico).
 * Transform-only; nascosta con reduced-motion.
 */
export function SectionProgress() {
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.4,
  });

  if (reduceMotion) return null;

  return (
    <motion.div
      className="pointer-events-none fixed top-0 right-0 left-0 z-[60] h-[2px] origin-left bg-primary"
      style={{ scaleX }}
      aria-hidden
    />
  );
}
