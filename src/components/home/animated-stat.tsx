"use client";

import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type AnimatedStatProps = {
  label: string;
  value: number;
  suffix?: string;
};

export function AnimatedStat({ label, value, suffix = "" }: AnimatedStatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduceMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;

    if (reduceMotion) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const totalFrames = 36;
    let raf = 0;
    const tick = () => {
      frame += 1;
      const progress = Math.min(frame / totalFrames, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduceMotion, value]);

  return (
    <div ref={ref} className="text-center">
      <p className="font-heading text-4xl font-semibold tracking-tight text-goal-17 sm:text-5xl">
        {display}
        {suffix}
      </p>
      <p className="mt-2 text-sm font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
    </div>
  );
}
