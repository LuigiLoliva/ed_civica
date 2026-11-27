"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion, useSpring } from "framer-motion";

import { Spotlight } from "@/components/motion/spotlight";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionSpring } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

type ProgettoGoalTileProps = {
  title: string;
  children: ReactNode;
  tone: "goal-16" | "goal-17";
  className?: string;
};

/** Pannello ruolo con tilt foundation (progetto). */
export function ProgettoGoalTile({
  title,
  children,
  tone,
  className,
}: ProgettoGoalTileProps) {
  const reduceMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(0, motionSpring.soft);
  const rotateY = useSpring(0, motionSpring.soft);

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateX.set((0.5 - py) * 8);
    rotateY.set((px - 0.5) * 10);
  };

  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={cn("h-full", className)}
      style={
        reduceMotion
          ? undefined
          : { rotateX, rotateY, transformPerspective: 900 }
      }
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <Spotlight
        hoverOnly
        color="rgb(255 255 255 / 18%)"
        size={320}
        className={cn(
          "h-full overflow-hidden rounded-2xl px-5 py-6 text-white shadow-depth",
          tone === "goal-16" ? "bg-goal-16" : "bg-goal-17",
        )}
      >
        <h3 className="font-heading text-lg font-semibold">{title}</h3>
        <div className="mt-2 text-sm text-white/85">{children}</div>
      </Spotlight>
    </motion.div>
  );
}