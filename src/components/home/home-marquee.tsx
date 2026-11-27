"use client";

import { motion } from "framer-motion";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const PHRASES = [
  "Pace",
  "Giustizia",
  "Istituzioni solide",
  "Partnership",
  "Cooperazione",
  "Agenda 2030",
  "Obiettivo 16",
  "Obiettivo 17",
  "Diritti umani",
];

/** Nastro tipografico orizzontale — ponte cinematografico tra capitoli. */
export function HomeMarquee() {
  const reduceMotion = usePrefersReducedMotion();
  const line = [...PHRASES, ...PHRASES].map((phrase, i) => (
    <span key={`${phrase}-${i}`} className="inline-flex items-center gap-8">
      <span className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
        {phrase}
      </span>
      <span className="size-1.5 rounded-full bg-primary/70" aria-hidden />
    </span>
  ));

  return (
    <div
      className="overflow-hidden border-y border-border/60 bg-warm-surface/60 py-5 text-goal-17"
      aria-hidden
    >
      {reduceMotion ? (
        <div className="flex flex-wrap justify-center gap-8 px-4 opacity-80">
          {PHRASES.slice(0, 5).map((phrase) => (
            <span
              key={phrase}
              className="font-heading text-xl font-semibold tracking-tight"
            >
              {phrase}
            </span>
          ))}
        </div>
      ) : (
        <motion.div
          className="flex w-max gap-8 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 42, ease: "linear", repeat: Infinity }}
        >
          <div className="flex gap-8 px-4">{line}</div>
        </motion.div>
      )}
    </div>
  );
}
