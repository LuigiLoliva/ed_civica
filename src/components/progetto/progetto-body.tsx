"use client";

import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";
import { ProgettoGoalTile } from "@/components/progetto/progetto-goal-tile";

import styles from "@/components/content-stage/content-stage.module.css";

type ProgettoBodyProps = {
  projectHtml: string;
  schoolBlock: ReactNode;
};

export function ProgettoBody({ projectHtml, schoolBlock }: ProgettoBodyProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6">
      <Reveal as="section" variant="fade-up">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Perché esiste
        </h2>
        <div
          className="prose prose-slate mt-4 max-w-none text-sm leading-relaxed text-muted-foreground sm:text-base"
          dangerouslySetInnerHTML={{ __html: projectHtml }}
        />
      </Reveal>

      <Reveal as="section" variant="clip-up" delay={0.05}>
        {schoolBlock}
      </Reveal>

      <Reveal
        as="section"
        className="grid gap-4 sm:grid-cols-2"
        delay={0.08}
        variant="fade-up"
      >
        <ProgettoGoalTile tone="goal-16" title="Docenti (admin)">
          <p>
            Revisione contenuti, pubblicazione articoli, moderazione commenti,
            gestione utenti e quiz.
          </p>
        </ProgettoGoalTile>
        <ProgettoGoalTile tone="goal-17" title="Studenti (editor)">
          <p>
            Scrivono bozze, aggiungono fonti e immagini, inviano gli articoli in
            revisione.
          </p>
        </ProgettoGoalTile>
      </Reveal>

      <Reveal delay={0.1}>
        <p
          className={`rounded-xl border px-4 py-3 text-sm text-muted-foreground ${styles.contentPanel}`}
        >
          Aggiorna scuola, docenti e testi da{" "}
          <strong className="text-foreground">Admin → Impostazioni</strong>. I testi
          dimostrativi degli articoli sono marcati come segnaposto e vanno
          verificati su fonti ufficiali.
        </p>
      </Reveal>
    </div>
  );
}