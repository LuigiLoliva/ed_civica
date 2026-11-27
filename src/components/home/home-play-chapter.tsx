"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { Magnetic } from "@/components/motion/magnetic";
import { Button } from "@/components/ui/button";
import type { GameMeta } from "@/lib/types/games";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionDuration, motionEase } from "@/lib/motion/tokens";

type HomePlayChapterProps = {
  games: GameMeta[];
};

/**
 * Capitolo cinematografico «Gioca e impara»: titoli tipografici full-bleed,
 * hover magnetico, nessuna scatola card arrotolata.
 */
export function HomePlayChapter({ games }: HomePlayChapterProps) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-hero text-hero-foreground"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={reduceMotion ? undefined : { y: bgY }}
        aria-hidden
      >
        <div className="absolute -top-24 -right-16 size-[36rem] rounded-full bg-[radial-gradient(circle,rgb(0_158_219_/_35%),transparent_65%)]" />
        <div className="absolute bottom-[-20%] left-[-10%] size-[28rem] rounded-full bg-[radial-gradient(circle,rgb(0_104_157_/_40%),transparent_70%)]" />
        <div className="absolute top-1/3 left-1/2 size-[20rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(95_125_82_/_22%),transparent_70%)]" />
      </motion.div>

      <div className="relative mx-auto max-w-[90rem] px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-semibold tracking-[0.28em] text-sky-200/70 uppercase">
              Laboratori interattivi
            </p>
            <h2 className="font-heading mt-4 text-[clamp(2.6rem,7vw,5.25rem)] leading-[0.92] font-semibold tracking-tight">
              Gioca
              <span className="mt-1 block text-sky-200/90">e impara</span>
            </h2>
            <p className="mt-6 max-w-md text-base text-white/65 text-pretty sm:text-lg">
              Mini-giochi e quiz sull&apos;ONU e sull&apos;Agenda 2030 —
              contenuti seed da revisionare con i docenti.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Magnetic strength={16} radius={110}>
                <Button
                  nativeButton={false}
                  render={<Link href="/gioca" data-cursor="cta" />}
                  className="bg-white text-hero hover:bg-white/90"
                >
                  Vai a Gioca e impara
                </Button>
              </Magnetic>
              <Magnetic strength={12} radius={100}>
                <Button
                  nativeButton={false}
                  render={<Link href="/progetto" data-cursor="link" />}
                  variant="outline"
                  className="border-white/35 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  Il progetto
                </Button>
              </Magnetic>
            </div>
          </div>

          <ul className="lg:col-span-7">
            {games.map((game, index) => (
              <motion.li
                key={game.slug}
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, x: 60, filter: "blur(8px)" }
                }
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{
                  duration: motionDuration.slow,
                  delay: index * 0.08,
                  ease: motionEase.out,
                }}
                className="border-t border-white/12 last:border-b"
              >
                <Link
                  href={`/gioca/giochi/${game.slug}`}
                  data-cursor="cta"
                  className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-4 py-7 sm:gap-8 sm:py-9"
                >
                  <span className="font-heading text-3xl font-semibold text-white/20 transition-colors group-hover:text-primary sm:text-4xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-[0.65rem] font-medium tracking-[0.2em] text-primary uppercase">
                      {game.badge} · ~{game.estimatedMinutes} min
                    </span>
                    <span className="font-heading mt-2 block text-[clamp(1.4rem,3vw,2.4rem)] leading-[1.05] font-semibold transition-transform duration-500 group-hover:translate-x-2">
                      {game.title}
                    </span>
                    <span className="mt-2 block max-w-md text-sm text-white/55">
                      {game.description}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="text-2xl text-white/25 transition-all duration-500 group-hover:translate-x-1 group-hover:text-white"
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
