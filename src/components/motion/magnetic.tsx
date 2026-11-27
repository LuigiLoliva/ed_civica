"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
} from "framer-motion";
import {
  useCallback,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionSpring } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

type MagneticProps = {
  children: ReactNode;
  className?: string;
  /** Intensità attrazione (px). Default 14. */
  strength?: number;
  /** Radius di influenza dal centro. Default 100. */
  radius?: number;
} & Omit<HTMLMotionProps<"div">, "children">;

/**
 * Avvolge CTA / link con attrazione magnetica al cursore.
 * Disattivato con prefers-reduced-motion o pointer coarse.
 */
export function Magnetic({
  children,
  className,
  strength = 14,
  radius = 100,
  ...rest
}: MagneticProps) {
  const reduceMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, motionSpring.magnetic);
  const springY = useSpring(y, motionSpring.magnetic);

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const onMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (reduceMotion || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > radius) {
        reset();
        return;
      }
      const t = 1 - dist / radius;
      x.set(dx * t * (strength / radius));
      y.set(dy * t * (strength / radius));
    },
    [radius, reduceMotion, reset, strength, x, y],
  );

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn("inline-flex will-change-transform", className)}
      style={{ x: springX, y: springY }}
      onMouseMove={onMove}
      onMouseLeave={reset}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
