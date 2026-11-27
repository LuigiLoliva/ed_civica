"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { AnimatedStat } from "@/components/home/animated-stat";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type HomeStatsChapterProps = {
  articles: number;
  authors: number;
  quizzes: number;
};

/**
 * Capitolo numerico a tutta larghezza: cifre monumentali, parallax tipografico.
 */
export function HomeStatsChapter({
  articles,
  authors,
  quizzes,
}: HomeStatsChapterProps) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const ghostX = useTransform(scrollYProgress, [0, 1], ["-6%", "8%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], [36, -36]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-hero text-hero-foreground"
      aria-label="Numeri della redazione"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_80%_20%,rgb(30_58_138_/_22%),transparent_55%),radial-gradient(ellipse_50%_40%_at_10%_90%,rgb(30_58_138_/_28%),transparent_50%)]"
        aria-hidden
      />

      {!reduceMotion ? (
        <motion.p
          className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 font-heading text-[clamp(9rem,32vw,26rem)] leading-none font-semibold text-white/[0.045] whitespace-nowrap select-none"
          style={{ x: ghostX }}
          aria-hidden
        >
          VOCI UNITE
        </motion.p>
      ) : null}

      <motion.div
        className="relative mx-auto grid max-w-[96rem] gap-14 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-12 lg:items-end lg:gap-10"
        style={reduceMotion ? undefined : { y: contentY }}
      >
        <div className="lg:col-span-4">
          <p className="text-xs font-semibold tracking-[0.28em] text-blue-100/70 uppercase">
            La redazione in numeri
          </p>
          <h2 className="font-heading mt-4 max-w-sm text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] font-semibold">
            Voci che contano, insieme.
          </h2>
        </div>

        <div className="grid gap-12 sm:grid-cols-3 lg:col-span-8 lg:gap-8">
          <AnimatedStat
            label="Articoli pubblicati"
            value={articles}
            tone="on-dark"
          />
          <AnimatedStat label="Autori" value={authors} tone="on-dark" />
          <AnimatedStat
            label="Quiz disponibili"
            value={quizzes}
            tone="on-dark"
          />
        </div>
      </motion.div>
    </section>
  );
}
