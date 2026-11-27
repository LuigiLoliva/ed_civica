"use client";

import { Goal16Section } from "./goal-16-section";
import { Goal17Network } from "./goal-17-network";

/**
 * Vetrina immersiva Goal 16 + Goal 17.
 * Composizioni full-bleed self-contained — niente card wrapper.
 */
export function GoalsShowcase() {
  return (
    <div className="relative">
      <header className="relative z-10 mx-auto max-w-6xl px-4 pb-4 pt-16 sm:px-6 sm:pt-24">
        <p className="text-[0.72rem] font-semibold tracking-[0.28em] text-primary uppercase">
          Agenda 2030 · Nazioni Unite
        </p>
        <h2 className="font-heading mt-3 max-w-4xl text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[0.95] tracking-tight text-pretty">
          Due Obiettivi,
          <span className="block text-goal-16">un impegno comune</span>
        </h2>
        <p className="mt-5 max-w-xl text-base text-muted-foreground text-pretty sm:text-lg">
          Pace, giustizia, istituzioni solide e partnership globale: esperienze
          interattive sui Goal 16 e 17.
        </p>
      </header>

      <Goal16Section />
      <Goal17Network />
    </div>
  );
}
