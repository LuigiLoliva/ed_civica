"use client";

import Link from "next/link";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion, useSpring } from "framer-motion";

import { Reveal } from "@/components/motion/reveal";
import { Spotlight } from "@/components/motion/spotlight";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionSpring } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

type TiltLinkCardProps = {
  href: string;
  className?: string;
  index?: number;
  children: ReactNode;
};

/** Card navigabile con tilt 3D e spotlight (lista gioca). */
export function TiltLinkCard({
  href,
  className,
  index = 0,
  children,
}: TiltLinkCardProps) {
  const reduceMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(0, motionSpring.soft);
  const rotateY = useSpring(0, motionSpring.soft);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateX.set((0.5 - py) * 8);
    rotateY.set((px - 0.5) * 10);
  }

  function handlePointerLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <Reveal as="li" variant="fade-up" delay={index * 0.06} className="h-full list-none">
      <Spotlight hoverOnly className="h-full rounded-2xl">
        <motion.div
          ref={ref}
          className="h-full will-change-transform"
          style={
            reduceMotion
              ? undefined
              : { rotateX, rotateY, transformPerspective: 900 }
          }
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <Link
            href={href}
            data-cursor="link"
            className={cn(
              "shadow-depth block h-full rounded-2xl border border-border/80 bg-card/92 p-5 transition-[border-color,box-shadow] hover:border-primary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
              className,
            )}
          >
            {children}
          </Link>
        </motion.div>
      </Spotlight>
    </Reveal>
  );
}