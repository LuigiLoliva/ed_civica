"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useCallback, type MouseEvent, type ReactNode } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

type SpotlightProps = {
  children: ReactNode;
  className?: string;
  /** Colore alone (CSS color). Default blu ONU soft. */
  color?: string;
  size?: number;
};

/**
 * Alone luminoso che segue il cursore (hero / pannelli scuri).
 */
export function Spotlight({
  children,
  className,
  color = "rgb(0 158 219 / 28%)",
  size = 420,
}: SpotlightProps) {
  const reduceMotion = usePrefersReducedMotion();
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(40);
  const background = useMotionTemplate`radial-gradient(${size}px circle at ${mouseX}% ${mouseY}%, ${color}, transparent 65%)`;

  const onMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (reduceMotion) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const px = ((event.clientX - rect.left) / rect.width) * 100;
      const py = ((event.clientY - rect.top) / rect.height) * 100;
      mouseX.set(px);
      mouseY.set(py);
    },
    [mouseX, mouseY, reduceMotion],
  );

  return (
    <div className={cn("relative isolate", className)} onMouseMove={onMove}>
      {!reduceMotion ? (
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 opacity-90 transition-opacity duration-500"
          style={{ background }}
          aria-hidden
        />
      ) : null}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
