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
import { Magnetic } from "@/components/motion/magnetic";
import { FadeLine, TextReveal } from "@/components/motion/text-reveal";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionSpring } from "@/lib/motion/tokens";

type CinematicHeroProps = {
  siteName: string;
  tagline: string;
};

/**
 * Hero cinematografica brand-first: reveal tipografico, luce cursore,
 * tilt leggero, CTA magnetiche.
 */
export function CinematicHero({ siteName, tagline }: CinematicHeroProps) {
  const reduceMotion = usePrefersReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.4);
  const springX = useSpring(mx, motionSpring.soft);
  const springY = useSpring(my, motionSpring.soft);

  const glowX = useTransform(springX, (v) => `${v * 100}%`);
  const glowY = useTransform(springY, (v) => `${v * 100}%`);
  const glowBackground = useMotionTemplate`radial-gradient(520px circle at ${glowX} ${glowY}, rgb(0 158 219 / 32%), transparent 62%)`;

  const tiltX = useTransform(springY, [0, 1], [5, -5]);
  const tiltY = useTransform(springX, [0, 1], [-7, 7]);

  const onMove = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (reduceMotion) return;
      const rect = event.currentTarget.getBoundingClientRect();
      mx.set((event.clientX - rect.left) / rect.width);
      my.set((event.clientY - rect.top) / rect.height);
    },
    [mx, my, reduceMotion],
  );

  return (
    <section
      className="bg-hero-ocean relative isolate overflow-hidden text-hero-foreground"
      onMouseMove={onMove}
    >
      <HeroBackdrop />

      {!reduceMotion ? (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[1] opacity-80"
          style={{ background: glowBackground }}
          aria-hidden
        />
      ) : null}

      <motion.div
        className="relative z-10 mx-auto flex min-h-[min(92svh,48rem)] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:justify-center lg:pb-28 lg:pt-32"
        style={
          reduceMotion
            ? undefined
            : {
                rotateX: tiltX,
                rotateY: tiltY,
                transformPerspective: 1200,
              }
        }
      >
        <p className="mb-4 text-xs font-semibold tracking-[0.28em] text-sky-200/80 uppercase sm:text-sm">
          Agenda 2030 · Obiettivi 16 &amp; 17
        </p>

        <TextReveal
          as="h1"
          className="font-heading text-[clamp(2.85rem,10vw,6rem)] font-semibold leading-[0.92] tracking-tight text-balance"
          delay={0.05}
        >
          {siteName}
        </TextReveal>

        <FadeLine delay={0.45} className="mt-6 max-w-xl">
          <p className="text-lg text-white/80 text-pretty sm:text-xl">
            {tagline}{" "}
            <span className="text-white/55">—</span> Obiettivi{" "}
            <span className="font-semibold text-sky-200">16</span> e{" "}
            <span className="font-semibold text-sky-100">17</span> dell&apos;Agenda
            2030.
          </p>
        </FadeLine>

        <FadeLine delay={0.62} className="mt-9 flex flex-wrap gap-3">
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
        </FadeLine>
      </motion.div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-background to-transparent"
        aria-hidden
      />

      {!reduceMotion ? (
        <motion.div
          className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/45 sm:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          aria-hidden
        >
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase">
            Scorri
          </span>
          <span className="hero-scroll-pulse block h-8 w-px bg-gradient-to-b from-white/70 to-transparent" />
        </motion.div>
      ) : null}
    </section>
  );
}
