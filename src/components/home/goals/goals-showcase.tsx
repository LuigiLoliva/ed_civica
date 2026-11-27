"use client";

import { Reveal } from "@/components/motion/reveal";

import { Goal16Section } from "./goal-16-section";
import { Goal17Network } from "./goal-17-network";

/** Sezione memorabile Goal 16 + rete interattiva Goal 17 (self-contained). */
export function GoalsShowcase() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <Reveal variant="clip-up">
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem]">
          Due Obiettivi, un impegno comune
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty sm:text-lg">
          Pace, giustizia, istituzioni solide e partnership globale: i Goal 16 e
          17 dell&apos;Agenda 2030 delle Nazioni Unite.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-8">
        <Reveal delay={0.08} variant="fade-up">
          <Goal16Section />
        </Reveal>
        <Reveal delay={0.14} variant="fade-up">
          <Goal17Network />
        </Reveal>
      </div>
    </section>
  );
}
