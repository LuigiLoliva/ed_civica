"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { Magnetic } from "@/components/motion/magnetic";
import { buttonVariants } from "@/components/ui/button";
import type { GameMeta } from "@/lib/types/games";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import { motionDuration, motionEase } from "@/lib/motion/tokens";

type HomePlayChapterProps = {
  games: GameMeta[];
};

/**
 * Capitolo «Gioca e impara»: titolo ancorato a sinistra mentre l'indice dei
 * giochi scorre; ogni riga si riempie di luce in hover con un taglio laterale.
 */
export function HomePlayChapter({ games }: HomePlayChapterProps) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const glowY = useTransform(scrollYProgress, [0, 1], ["-12%", "16%"]);
  const ghostX = useTransform(scrollYProgress, [0, 1], ["10%", "-26%"]);

  return (
    <section
      ref={ref}
      data-header-theme="dark"
      className="relative isolate overflow-x-clip bg-hero text-hero-foreground"
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <motion.div
          className="absolute inset-0"
          style={reduceMotion ? undefined : { y: glowY }}
        >
          <div className="absolute -top-24 -right-16 size-[38rem] rounded-full bg-[radial-gradient(circle,rgb(0_158_219_/_32%),transparent_65%)]" />
          <div className="absolute bottom-[-20%] left-[-10%] size-[30rem] rounded-full bg-[radial-gradient(circle,rgb(0_104_157_/_40%),transparent_70%)]" />
          <div className="absolute top-1/3 left-1/2 size-[20rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(95_125_82_/_20%),transparent_70%)]" />
        </motion.div>
        <motion.p
          className="font-heading absolute bottom-[-0.16em] left-0 text-[clamp(8rem,30vw,27rem)] leading-none font-semibold whitespace-nowrap text-white/[0.035] select-none"
          style={reduceMotion ? undefined : { x: ghostX }}
        >
          Gioca
        </motion.p>
      </div>

      <div className="relative mx-auto max-w-[100rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-40">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.28em] text-sky-200/75 uppercase">
              <span className="h-px w-10 bg-sky-200/50" aria-hidden />
              Laboratori interattivi
            </p>
            <h2 className="font-heading mt-5 text-[clamp(3rem,8vw,7rem)] leading-[0.88] font-semibold tracking-[-0.03em]">
              Gioca{" "}
              <span className="block pl-[0.5em] text-sky-200">e impara</span>
            </h2>
            <p className="mt-8 max-w-md text-base text-white/65 text-pretty sm:text-lg">
              Mini-giochi e quiz sull&apos;ONU e sull&apos;Agenda 2030 —
              contenuti seed da revisionare con i docenti.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Magnetic strength={16} radius={110}>
                <Link
                  href="/gioca"
                  data-cursor="cta"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 rounded-full bg-white px-6 text-sm text-hero hover:bg-white/90",
                  )}
                >
                  Vai a Gioca e impara
                </Link>
              </Magnetic>
              <Magnetic strength={12} radius={100}>
                <Link
                  href="/progetto"
                  data-cursor="link"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "h-12 rounded-full border-white/35 bg-transparent px-6 text-sm text-white hover:bg-white/10 hover:text-white",
                  )}
                >
                  Il progetto
                </Link>
              </Magnetic>
            </div>
          </div>

          <ul className="border-t border-white/15 lg:col-span-7">
            {games.map((game, index) => (
              <motion.li
                key={game.slug}
                className="border-b border-white/15"
                initial={
                  reduceMotion ? false : { clipPath: "inset(0% 0% 0% 100%)" }
                }
                whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{
                  duration: motionDuration.cinematic,
                  delay: index * 0.09,
                  ease: motionEase.clip,
                }}
              >
                <Link
                  href={`/gioca/giochi/${game.slug}`}
                  data-cursor="cta"
                  className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-5 overflow-hidden px-2 py-8 outline-none sm:gap-9 sm:px-5 sm:py-11"
                >
                  <span
                    className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
                    aria-hidden
                  />
                  <span className="font-heading relative text-[clamp(2.25rem,4.4vw,4rem)] leading-none font-semibold tracking-[-0.04em] text-white/25 transition-colors duration-500 group-hover:text-goal-16 group-focus-visible:text-goal-16">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="relative block transition-[transform,color] duration-700 ease-out group-hover:translate-x-2 group-hover:text-hero group-focus-visible:text-hero">
                    <span className="block text-[0.66rem] font-semibold tracking-[0.22em] text-primary uppercase transition-colors duration-500 group-hover:text-goal-16 group-focus-visible:text-goal-16">
                      {game.badge} · ~{game.estimatedMinutes} min
                    </span>
                    <span className="font-heading mt-2 block text-[clamp(1.6rem,3.4vw,2.9rem)] leading-[1.04] font-semibold tracking-[-0.015em]">
                      {game.title}
                    </span>
                    <span className="mt-3 block max-w-md text-sm text-white/60 transition-colors duration-500 group-hover:text-hero/70 group-focus-visible:text-hero/70">
                      {game.description}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="relative flex size-12 shrink-0 items-center justify-center rounded-full border border-white/25 text-lg transition-[transform,background-color,color,border-color] duration-500 group-hover:-rotate-45 group-hover:border-hero group-hover:bg-hero group-hover:text-white group-focus-visible:border-hero group-focus-visible:bg-hero"
                  >
                    →
                  </span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
