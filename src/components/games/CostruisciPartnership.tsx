"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  actorLabels,
  partnershipScenario,
} from "@/data/games/partnership";
import type { PartnershipActor } from "@/lib/types/games";

const ACTORS: PartnershipActor[] = [
  "governi",
  "scuole",
  "imprese",
  "ong",
  "cittadini",
];

const MAX_CHOICES = 4;

export function CostruisciPartnership() {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const connected = useMemo(() => {
    const set = new Set<PartnershipActor>();
    for (const id of selected) {
      const choice = partnershipScenario.choices.find((c) => c.id === id);
      choice?.connects.forEach((a) => set.add(a));
    }
    return set;
  }, [selected]);

  const requiredOk = partnershipScenario.requiredActors.every((a) =>
    connected.has(a),
  );

  const impactScore = useMemo(() => {
    return selected.reduce((acc, id) => {
      const choice = partnershipScenario.choices.find((c) => c.id === id);
      if (!choice) return acc;
      if (choice.impact === "alto") return acc + 3;
      if (choice.impact === "medio") return acc + 2;
      return acc + 1;
    }, 0);
  }, [selected]);

  function toggle(id: string) {
    if (submitted) return;
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_CHOICES) return prev;
      return [...prev, id];
    });
  }

  function onKeyToggle(e: React.KeyboardEvent, id: string) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(id);
    }
  }

  function reset() {
    setSelected([]);
    setSubmitted(false);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-goal-17/30 bg-goal-17/5 p-4">
        <h2 className="font-heading text-xl text-goal-17">
          {partnershipScenario.title}
        </h2>
        <p className="mt-2 text-sm text-foreground/80">
          {partnershipScenario.intro}
        </p>
        <p className="mt-2 text-sm font-medium text-foreground">
          Obiettivo: {partnershipScenario.goal}
        </p>
      </section>

      <div
        className="relative mx-auto h-56 max-w-lg"
        role="img"
        aria-label={`Mappa nodi partnership. Attori collegati: ${
          [...connected].map((a) => actorLabels[a]).join(", ") || "nessuno"
        }`}
      >
        <svg viewBox="0 0 320 220" className="h-full w-full" aria-hidden>
          {ACTORS.flatMap((a, i) => {
            const angle = (Math.PI * 2 * i) / ACTORS.length - Math.PI / 2;
            const x = 160 + Math.cos(angle) * 80;
            const y = 110 + Math.sin(angle) * 70;
            return ACTORS.slice(i + 1).flatMap((b, offset) => {
              if (!(connected.has(a) && connected.has(b))) return [];
              const j = i + 1 + offset;
              const angleB = (Math.PI * 2 * j) / ACTORS.length - Math.PI / 2;
              const xb = 160 + Math.cos(angleB) * 80;
              const yb = 110 + Math.sin(angleB) * 70;
              return [
                <motion.line
                  key={`${a}-${b}`}
                  x1={x}
                  y1={y}
                  x2={xb}
                  y2={yb}
                  stroke="var(--onu)"
                  strokeWidth={2}
                  initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.7 }}
                />,
              ];
            });
          })}
          {ACTORS.map((a, i) => {
            const angle = (Math.PI * 2 * i) / ACTORS.length - Math.PI / 2;
            const x = 160 + Math.cos(angle) * 80;
            const y = 110 + Math.sin(angle) * 70;
            const active = connected.has(a);
            return (
              <g key={a}>
                <motion.circle
                  cx={x}
                  cy={y}
                  r={active ? 18 : 14}
                  fill={active ? "var(--goal-17)" : "white"}
                  stroke="var(--goal-17)"
                  strokeWidth={2}
                  animate={reduceMotion ? undefined : { scale: active ? 1.05 : 1 }}
                />
                <text
                  x={x}
                  y={y + 36}
                  textAnchor="middle"
                  className="fill-foreground text-[10px]"
                >
                  {actorLabels[a].split(" ")[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">
          Scegli fino a {MAX_CHOICES} azioni ({selected.length}/{MAX_CHOICES})
        </legend>
        {partnershipScenario.choices.map((choice) => {
          const on = selected.includes(choice.id);
          return (
            <label
              key={choice.id}
              className={[
                "flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3",
                on
                  ? "border-goal-17 bg-goal-17/5"
                  : "border-border",
              ].join(" ")}
              onKeyDown={(e) => onKeyToggle(e, choice.id)}
            >
              <input
                type="checkbox"
                checked={on}
                disabled={submitted || (!on && selected.length >= MAX_CHOICES)}
                onChange={() => toggle(choice.id)}
                className="mt-1"
              />
              <span>
                <span className="block font-medium">{choice.text}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Collega: {choice.connects.map((a) => actorLabels[a]).join(", ")} ·
                  impatto {choice.impact}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      {!submitted ? (
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={() => setSubmitted(true)}
          className="rounded-lg bg-goal-17 px-4 py-2 text-white disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Valuta la partnership
        </button>
      ) : (
        <div
          className="space-y-3 rounded-lg border border-border bg-white p-4"
          role="status"
          aria-live="polite"
        >
          <p className="font-semibold">
            {requiredOk
              ? "Partnership multi-attore riuscita!"
              : "Rete ancora incompleta"}
          </p>
          <p className="text-sm">
            Punteggio impatto: {impactScore}. Attori collegati:{" "}
            {[...connected].map((a) => actorLabels[a]).join(", ") || "nessuno"}.
          </p>
          <p className="text-sm">
            Richiesti:{" "}
            {partnershipScenario.requiredActors
              .map((a) => `${actorLabels[a]}${connected.has(a) ? " ✓" : " ✗"}`)
              .join(" · ")}
          </p>
          <ul className="space-y-2 text-sm">
            {selected.map((id) => {
              const choice = partnershipScenario.choices.find((c) => c.id === id);
              if (!choice) return null;
              return (
                <li key={id} className="rounded-md bg-warm-surface px-3 py-2">
                  <strong>{choice.text}</strong>
                  <span className="mt-1 block">{choice.feedback}</span>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-border px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Nuova prova
          </button>
        </div>
      )}
    </div>
  );
}
