"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import { veroFalsoItems } from "@/data/games/vero-falso";

type Feedback = {
  correct: boolean;
  explanation: string;
  source?: string;
} | null;

export function VeroFalsoSwipe() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [done, setDone] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const item = veroFalsoItems[index];

  function answer(asTrue: boolean) {
    if (!item || feedback || done) return;
    const correct = asTrue === item.isTrue;
    setFeedback({
      correct,
      explanation: item.explanation,
      source: item.source,
    });
    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  }

  function next() {
    if (index + 1 >= veroFalsoItems.length) {
      setDone(true);
      setFeedback(null);
      return;
    }
    setIndex((i) => i + 1);
    setFeedback(null);
  }

  function reset() {
    setIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setFeedback(null);
    setDone(false);
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (Math.abs(info.offset.x) < 80) return;
    answer(info.offset.x > 0);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (feedback || done) {
      if (e.key === "Enter" || e.key === "ArrowRight") {
        e.preventDefault();
        if (done) reset();
        else next();
      }
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      answer(true);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      answer(false);
    }
  }

  return (
    <div
      className="space-y-4 outline-none"
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label="Gioco vero o falso. Freccia sinistra: falso. Freccia destra: vero."
    >
      <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
        Punteggio {score}/{veroFalsoItems.length} · Serie {streak} (record {bestStreak}).
        Desktop: ← Falso, → Vero. Mobile: scorri.
      </p>

      {done ? (
        <div className="space-y-3 rounded-lg border border-border bg-white p-6 text-center">
          <p className="font-heading text-2xl">Fine!</p>
          <p>
            Hai indovinato {score} su {veroFalsoItems.length}. Miglior serie: {bestStreak}.
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-primary px-4 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Ricomincia
          </button>
        </div>
      ) : (
        item && (
          <motion.div
            key={item.id}
            drag={feedback || reduceMotion ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={onDragEnd}
            onTouchStart={(e) => {
              touchStartX.current = e.changedTouches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              if (feedback || touchStartX.current == null) return;
              const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
              if (Math.abs(dx) > 60) answer(dx > 0);
              touchStartX.current = null;
            }}
            className="rounded-xl border border-border bg-white p-6 shadow-sm"
          >
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              Affermazione {index + 1}/{veroFalsoItems.length}
            </p>
            <p className="font-heading text-xl text-foreground">
              {item.statement}
            </p>

            {!feedback && (
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => answer(false)}
                  className="flex-1 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 font-medium text-rose-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  ← Falso
                </button>
                <button
                  type="button"
                  onClick={() => answer(true)}
                  className="flex-1 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 font-medium text-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Vero →
                </button>
              </div>
            )}

            {feedback && (
              <div
                className={[
                  "mt-5 space-y-2 rounded-lg border px-4 py-3",
                  feedback.correct
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-rose-300 bg-rose-50",
                ].join(" ")}
                role="status"
              >
                <p className="font-semibold">
                  {feedback.correct ? "Esatto" : "Non corretto"} — era{" "}
                  {item.isTrue ? "Vero" : "Falso"}
                </p>
                <p>{feedback.explanation}</p>
                {feedback.source && (
                  <a
                    href={feedback.source}
                    className="text-sm underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Fonte
                  </a>
                )}
                <button
                  type="button"
                  onClick={next}
                  className="mt-2 rounded-lg bg-foreground px-4 py-2 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Continua
                </button>
              </div>
            )}
          </motion.div>
        )
      )}
    </div>
  );
}
