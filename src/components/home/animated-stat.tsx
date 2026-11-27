"use client";

import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

type AnimatedStatProps = {
  label: string;
  value: number;
  suffix?: string;
  /** Tone for dark cinematic chapters */
  tone?: "default" | "on-dark";
  className?: string;
};

export function AnimatedStat({
  label,
  value,
  suffix = "",
  tone = "default",
  className,
}: AnimatedStatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-22% 0px" });
  const reduceMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;

    if (reduceMotion) {
      setDisplay(value);
      return;
    }

    const duration = 1500;
    let start = 0;
    let raf = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduceMotion, value]);

  return (
    <div ref={ref} className={cn("text-left", className)}>
      <p
        className={cn(
          "font-heading font-semibold leading-none tracking-tight",
          tone === "on-dark"
            ? "text-[clamp(5rem,11vw,12rem)] tracking-[-0.04em] text-white tabular-nums"
            : "text-[clamp(3.5rem,8vw,6.5rem)] text-goal-17",
        )}
      >
        {display}
        {suffix}
      </p>
      <p
        className={cn(
          "mt-4 text-xs font-medium tracking-[0.18em] uppercase",
          tone === "on-dark" ? "text-white/55" : "text-muted-foreground",
        )}
      >
        {label}
      </p>
    </div>
  );
}
