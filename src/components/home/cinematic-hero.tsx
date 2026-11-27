"use client";

import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useCallback, type MouseEvent } from "react";

import { HeroBackdrop } from "@/components/home/hero-backdrop";
import { HeroMotif3D } from "@/components/home/hero-motif-3d";
import { Magnetic } from "@/components/motion/magnetic";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionDuration, motionEase, motionSpring } from "@/lib/motion/tokens";

type CinematicHeroProps = {
  siteName: string;
  tagline: string;
};

/**
 * Hero immersivo brand-first: tipografia oversized che interseca
 * il motivo 3D centrale (pace / giustizia / cooperazione).
 */
export function CinematicHero({ siteName, tagline }: CinematicHeroProps) {
  const reduceMotion = usePrefersReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.4);
  const springX = useSpring(mx, motionSpring.soft);
  const springY = useSpring(my, motionSpring.soft);

  const glowX = useTransform(springX, (v) => `${v * 100}%`);
  const glowY = useTransform(springY, (v) => `${v * 100}%`);
  const glowBackground = useMotionTemplate`radial-gradient(720px circle at ${glowX} ${glowY}, rgb(0 158 219 / 30%), transparent 58%)`;

  const onMove = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (reduceMotion) return;
      const rect = event.currentTarget.getBoundingClientRect();
      mx.set((event.clientX - rect.left) / rect.width);
      my.set((event.clientY - rect.top) / rect.height);
    },
    [mx, my, reduceMotion],
  );

  const words = siteName.trim().split(/\s+/);
  const primary = words[0] ?? siteName;
  const secondary = words.slice(1).join(" ");

  return (
    <section
      className="bg-hero-ocean relative isolate flex min-h-[100svh] flex-col overflow-hidden text-hero-foreground"
      onMouseMove={onMove}
    >
      <HeroBackdrop />

      {!reduceMotion ? (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[1] opacity-90"
          style={{ background: glowBackground }}
          aria-hidden
        />
      ) : null}

      <div className="relative z-10 flex flex-1 flex-col justify-center px-4 pt-24 pb-20 sm:px-6 lg:pb-16">
        <div className="relative mx-auto w-full max-w-[96rem]">
          {/* Motivo 3D — interseca tipografia (overlap intenzionale) */}
          <div className="pointer-events-none absolute top-[6%] right-[-10%] z-[2] w-[min(92vw,30rem)] sm:top-[2%] sm:right-[-6%] sm:w-[min(68vw,34rem)] lg:top-[48%] lg:right-auto lg:left-[8%] lg:w-[min(62vw,44rem)] lg:-translate-y-1/2 xl:left-[12%] xl:w-[min(58vw,46rem)]">
            <motion.div
              className="pointer-events-auto w-full"
              initial={reduceMotion ? false : { scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: motionDuration.cinematic,
                delay: 0.15,
                ease: motionEase.out,
              }}
            >
              <HeroMotif3D />
            </motion.div>
          </div>

          <div className="relative z-[3] max-w-4xl pt-[min(58vw,20rem)] sm:pt-[min(42vw,18rem)] lg:max-w-[72%] lg:pt-0">
            <motion.p
              className="mb-4 text-[0.7rem] font-semibold tracking-[0.34em] text-sky-200/80 uppercase sm:mb-5 sm:text-xs"
              initial={reduceMotion ? false : { opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: motionDuration.slow,
                ease: motionEase.out,
              }}
            >
              Agenda 2030 · Obiettivi 16 &amp; 17
            </motion.p>

            <h1 className="font-heading leading-[0.76] tracking-tight">
              <motion.span
                className="block text-[clamp(5rem,18vw,13rem)] font-semibold text-balance drop-shadow-[0_16px_48px_rgb(6_18_32_/_65%)]"
                initial={
                  reduceMotion
                    ? false
                    : { clipPath: "inset(0 100% 0 0)", opacity: 0.25 }
                }
                animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
                transition={{
                  duration: motionDuration.cinematic,
                  ease: motionEase.clip,
                }}
              >
                {primary}
              </motion.span>
              {secondary ? (
                <motion.span
                  className="mt-[-0.06em] block text-[clamp(4rem,15vw,11rem)] font-semibold text-sky-100/95 text-balance drop-shadow-[0_16px_48px_rgb(6_18_32_/_55%)]"
                  initial={
                    reduceMotion
                      ? false
                      : { clipPath: "inset(0 0 0 100%)", opacity: 0.25 }
                  }
                  animate={{ clipPath: "inset(0 0 0 0%)", opacity: 1 }}
                  transition={{
                    duration: motionDuration.cinematic,
                    delay: 0.16,
                    ease: motionEase.clip,
                  }}
                >
                  {secondary}
                </motion.span>
              ) : null}
            </h1>

            <motion.p
              className="mt-6 max-w-md text-base text-white/75 text-pretty sm:mt-8 sm:text-lg"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5,
                duration: motionDuration.slow,
                ease: motionEase.out,
              }}
            >
              {tagline}
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap gap-3 sm:mt-10"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.68,
                duration: motionDuration.base,
                ease: motionEase.out,
              }}
            >
              <Magnetic strength={18} radius={120}>
                <Button
                  nativeButton={false}
                  render={<Link href="/articoli" data-cursor="cta" />}
                  size="lg"
                  className="bg-white text-hero hover:bg-white/90"
                >
                  Leggi gli articoli
                </Button>
              </Magnetic>
              <Magnetic strength={14} radius={110}>
                <Button
                  nativeButton={false}
                  render={<Link href="/gioca" data-cursor="link" />}
                  size="lg"
                  variant="outline"
                  className="border-white/35 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  Metti alla prova le tue conoscenze
                </Button>
              </Magnetic>
            </motion.div>
          </div>

          <motion.p
            className="pointer-events-none absolute right-4 bottom-[-2.5rem] hidden text-[0.7rem] tracking-[0.28em] text-white/45 uppercase lg:block"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.05, duration: 0.6 }}
            aria-hidden
          >
            Pace · Giustizia · Cooperazione
          </motion.p>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-background to-transparent"
        aria-hidden
      />

      {!reduceMotion ? (
        <motion.div
          className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/40 sm:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          aria-hidden
        >
          <span className="text-[10px] font-medium tracking-[0.22em] uppercase">
            Scorri
          </span>
          <span className="hero-scroll-pulse block h-9 w-px bg-gradient-to-b from-white/70 to-transparent" />
        </motion.div>
      ) : null}
    </section>
  );
}
