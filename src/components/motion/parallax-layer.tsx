"use client";

import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef, type ReactNode } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

type ParallaxLayerProps = {
  children: ReactNode;
  className?: string;
  /** Spostamento verticale in px sull'intero scroll del contenitore. */
  offset?: number;
  /** Usa scroll della finestra invece del contenitore padre. */
  viewport?: boolean;
};

/**
 * Layer parallax leggero (solo transform). Per hero e sezioni narrative.
 */
export function ParallaxLayer({
  children,
  className,
  offset = 40,
  viewport = false,
}: ParallaxLayerProps) {
  const reduceMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll(
    viewport
      ? undefined
      : { target: ref, offset: ["start end", "end start"] },
  );
  const yRaw = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const y = useSpring(yRaw, { stiffness: 80, damping: 28, mass: 0.6 });

  if (reduceMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cn("will-change-transform", className)}
      style={{ y: y as MotionValue<number> }}
    >
      {children}
    </motion.div>
  );
}
