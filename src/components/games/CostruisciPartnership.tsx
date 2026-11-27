"use client";

import { useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  actorLabels,
  partnershipScenario,
} from "@/data/games/partnership";
import type { PartnershipActor } from "@/lib/types/games";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import {
  motionDuration,
  motionEase,
  motionSpring,
} from "@/lib/motion/tokens";

const ACTORS: PartnershipActor[] = [
  "governi",
  "scuole",
  "imprese",
  "ong",
  "cittadini",
];

const MAX_CHOICES = 4;

function nodePos(i: number) {
  const angle = (Math.PI * 2 * i) / ACTORS.length - Math.PI / 2;
  return {
    x: 160 + Math.cos(angle) * 80,
    y: 110 + Math.sin(angle) * 70,
  };
}

export function CostruisciPartnership() {
  const reduceMotion = usePrefersReducedMotion();
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

  const edges = useMemo(() => {
    const list: { a: PartnershipActor; b: PartnershipActor; key: string }[] =
      [];
    for (let i = 0; i < ACTORS.length; i += 1) {
      for (let j = i + 1; j < ACTORS.length; j += 1) {
        const a = ACTORS[i];
        const b = ACTORS[j];
        if (connected.has(a) && connected.has(b)) {
          list.push({ a, b, key: `${a}-${b}` });
        }
      }
    }
    return list;
  }, [connected]);

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
      <motion.section
        className="rounded-xl border border-goal-17/30 bg-gradient-to-br from-goal-17/5 via-white to-onu/10 p-4"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="font-heading text-xl text-goal-17">
          {partnershipScenario.title}
        </h2>
        <p className="mt-2 text-sm text-foreground/80">
          {partnershipScenario.intro}
        </p>
        <p className="mt-2 text-sm font-medium text-foreground">
          Obiettivo: {partnershipScenario.goal}
        </p>
      </motion.section>

      <div
        className="relative mx-auto h-56 max-w-lg"
        role="img"
        aria-label={`Mappa nodi partnership. Attori collegati: ${
          [...connected].map((a) => actorLabels[a]).join(", ") || "nessuno"
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle at 50% 48%, rgba(30,58,138,0.18), transparent 62%)",
          }}
          aria-hidden
        />
        <svg viewBox="0 0 320 220" className="h-full w-full" aria-hidden>
          <AnimatePresence>
            {edges.map(({ a, b, key }) => {
              const i = ACTORS.indexOf(a);
              const j = ACTORS.indexOf(b);
              const pa = nodePos(i);
              const pb = nodePos(j);
              return (
                <motion.g key={key}>
                  <motion.line
                    x1={pa.x}
                    y1={pa.y}
                    x2={pb.x}
                    y2={pb.y}
                    stroke="var(--onu)"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    initial={
                      reduceMotion
                        ? false
                        : { pathLength: 0, opacity: 0 }
                    }
                    animate={
                      reduceMotion
                        ? { pathLength: 1, opacity: 0.75 }
                        : {
                            pathLength: 1,
                            opacity: [0.45, 0.85, 0.45],
                          }
                    }
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { pathLength: 0, opacity: 0 }
                    }
                    transition={{
                      pathLength: {
                        duration: motionDuration.base,
                        ease: motionEase.out,
                      },
                      opacity: reduceMotion
                        ? { duration: motionDuration.fast }
                        : { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
                    }}
                  />
                </motion.g>
              );
            })}
          </AnimatePresence>
          {ACTORS.map((a, i) => {
            const { x, y } = nodePos(i);
            const active = connected.has(a);
            return (
              <g key={a}>
                {!reduceMotion && active && (
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={26}
                    fill="none"
                    stroke="var(--goal-17)"
                    strokeWidth={1.5}
                    initial={{ opacity: 0.5, scale: 0.8 }}
                    animate={{ opacity: [0.45, 0], scale: [0.9, 1.35] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                )}
                <motion.circle
                  cx={x}
                  cy={y}
                  r={active ? 18 : 14}
                  fill={active ? "var(--goal-17)" : "white"}
                  stroke="var(--goal-17)"
                  strokeWidth={2}
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          scale: active ? 1.06 : 1,
                          filter: active
                            ? "drop-shadow(0 0 6px rgba(23,37,84,0.45))"
                            : "drop-shadow(0 0 0 rgba(0,0,0,0))",
                        }
                  }
                  transition={{ type: "spring", ...motionSpring.magnetic }}
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
        {partnershipScenario.choices.map((choice, i) => {
          const on = selected.includes(choice.id);
          return (
            <motion.label
              key={choice.id}
              layout={!reduceMotion}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : i * 0.03 }}
              className={[
                "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors",
                on
                  ? "border-goal-17 bg-goal-17/5 shadow-[0_8px_24px_-16px_rgba(23,37,84,0.5)]"
                  : "border-border bg-white/70",
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
                  Collega:{" "}
                  {choice.connects.map((actor) => actorLabels[actor]).join(", ")}{" "}
                  · impatto {choice.impact}
                </span>
              </span>
            </motion.label>
          );
        })}
      </fieldset>

      {!submitted ? (
        <motion.button
          type="button"
          disabled={selected.length === 0}
          onClick={() => setSubmitted(true)}
          whileTap={
            reduceMotion || selected.length === 0
              ? undefined
              : { scale: 0.97 }
          }
          className="rounded-lg bg-goal-17 px-4 py-2 text-white disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Valuta la partnership
        </motion.button>
      ) : (
        <motion.div
          className="space-y-3 rounded-xl border border-border bg-white p-4 shadow-sm"
          role="status"
          aria-live="polite"
          initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", ...motionSpring.soft }}
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
                <motion.li
                  key={id}
                  className="rounded-md bg-warm-surface px-3 py-2"
                  initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <strong>{choice.text}</strong>
                  <span className="mt-1 block">{choice.feedback}</span>
                </motion.li>
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
        </motion.div>
      )}
    </div>
  );
}
