"use client";

import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

import { AnimatedStat } from "@/components/home/animated-stat";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type HomeStatsChapterProps = {
  articles: number;
  authors: number;
  quizzes: number;
};

/**
 * Capitolo numerico: un pannello scuro che si apre a tutta larghezza con lo
 * scroll (da riquadro arrotondato a pieno schermo), cifre monumentali
 * sfalsate e un wordmark fantasma in controscorrimento.
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
  const ghostX = useTransform(scrollYProgress, [0, 1], ["4%", "-30%"]);

  const { scrollYProgress: open } = useScroll({
    target: ref,
    offset: ["start end", "start 0.3"],
  });
  const insetX = useTransform(open, [0, 1], [9, 0]);
  const insetY = useTransform(open, [0, 1], [7, 0]);
  const radius = useTransform(open, [0, 1], [56, 0]);
  const clipPath = useMotionTemplate`inset(${insetY}% ${insetX}% round ${radius}px)`;
  const numbersY = useTransform(open, [0, 1], [90, 0]);

  return (
    <section
      ref={ref}
      data-header-theme="dark"
      className="relative text-hero-foreground"
      aria-label="Numeri della redazione"
    >
      <motion.div
        className="relative overflow-hidden bg-hero"
        style={reduceMotion ? undefined : { clipPath }}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_82%_18%,rgb(0_158_219_/_24%),transparent_55%),radial-gradient(ellipse_50%_45%_at_8%_92%,rgb(0_104_157_/_30%),transparent_52%)]"
          aria-hidden
        />

        <motion.p
          className="font-heading pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 text-[clamp(10rem,34vw,30rem)] leading-none font-semibold whitespace-nowrap text-white/[0.04] select-none"
          style={reduceMotion ? undefined : { x: ghostX }}
          aria-hidden
        >
          Voci Unite · Voci Unite
        </motion.p>

        <div className="relative mx-auto max-w-[100rem] px-5 py-28 sm:px-8 sm:py-36 lg:px-12 lg:py-44">
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-4">
              <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.28em] text-sky-200/75 uppercase">
                <span className="h-px w-10 bg-sky-200/50" aria-hidden />
                La redazione in numeri
              </p>
              <h2 className="font-heading mt-5 max-w-sm text-[clamp(2.25rem,4.4vw,4rem)] leading-[1.02] font-semibold tracking-[-0.02em]">
                Voci che contano, insieme.
              </h2>
            </div>

            <motion.div
              className="grid gap-14 sm:grid-cols-3 sm:gap-8 lg:col-span-8"
              style={reduceMotion ? undefined : { y: numbersY }}
            >
              <AnimatedStat
                label="Articoli pubblicati"
                value={articles}
                tone="on-dark"
                className="border-t border-white/20 pt-6"
              />
              <AnimatedStat
                label="Autori"
                value={authors}
                tone="on-dark"
                className="border-t border-white/20 pt-6 sm:mt-20"
              />
              <AnimatedStat
                label="Quiz disponibili"
                value={quizzes}
                tone="on-dark"
                className="border-t border-white/20 pt-6 sm:mt-40"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
