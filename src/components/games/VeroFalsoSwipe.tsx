"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { veroFalsoItems } from "@/data/games/vero-falso";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionDuration, motionSpring } from "@/lib/motion/tokens";

type Feedback = {
  correct: boolean;
  explanation: string;
  source?: string;
} | null;

export function VeroFalsoSwipe() {
  const reduceMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [done, setDone] = useState(false);
  const [exitDir, setExitDir] = useState<1 | -1 | 0>(0);
  const touchStartX = useRef<number | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-180, 0, 180], [-10, 0, 10]);
  const veroGlow = useTransform(x, [0, 120], [0, 1]);
  const falsoGlow = useTransform(x, [-120, 0], [1, 0]);

  const item = veroFalsoItems[index];

  function answer(asTrue: boolean) {
    if (!item || feedback || done) return;
    setExitDir(asTrue ? 1 : -1);
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
      setExitDir(0);
      x.set(0);
      return;
    }
    setIndex((i) => i + 1);
    setFeedback(null);
    setExitDir(0);
    x.set(0);
  }

  function reset() {
    setIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setFeedback(null);
    setDone(false);
    setExitDir(0);
    x.set(0);
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
        Punteggio {score}/{veroFalsoItems.length} · Serie {streak} (record{" "}
        {bestStreak}). Desktop: ← Falso, → Vero. Mobile: scorri.
      </p>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3 rounded-xl border border-border bg-gradient-to-b from-white to-warm-surface p-6 text-center shadow-sm"
          >
            <p className="font-heading text-2xl text-goal-16">Fine!</p>
            <p>
              Hai indovinato {score} su {veroFalsoItems.length}. Miglior serie:{" "}
              {bestStreak}.
            </p>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg bg-primary px-4 py-2 text-white transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Ricomincia
            </button>
          </motion.div>
        ) : (
          item && (
            <motion.div
              key={item.id}
              style={
                reduceMotion
                  ? undefined
                  : { x, rotate, touchAction: "pan-y" }
              }
              drag={feedback || reduceMotion ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.85}
              onDragEnd={onDragEnd}
              onTouchStart={(e) => {
                touchStartX.current = e.changedTouches[0]?.clientX ?? null;
              }}
              onTouchEnd={(e) => {
                if (feedback || touchStartX.current == null) return;
                const dx =
                  (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
                if (Math.abs(dx) > 60) answer(dx > 0);
                touchStartX.current = null;
              }}
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, y: 24, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      x: exitDir * 160,
                      transition: { duration: motionDuration.fast },
                    }
              }
              transition={{ type: "spring", ...motionSpring.magnetic }}
              className="relative overflow-hidden rounded-xl border border-border bg-white p-6 shadow-[0_12px_40px_-18px_rgba(0,110,170,0.35)]"
            >
              {!reduceMotion && !feedback && (
                <>
                  <motion.div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-emerald-200/50"
                    style={{ opacity: veroGlow }}
                    aria-hidden
                  />
                  <motion.div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent to-rose-200/50"
                    style={{ opacity: falsoGlow }}
                    aria-hidden
                  />
                  <motion.span
                    className="pointer-events-none absolute right-4 top-4 rounded-md border border-emerald-400/60 bg-emerald-50/90 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800"
                    style={{ opacity: veroGlow }}
                    aria-hidden
                  >
                    Vero
                  </motion.span>
                  <motion.span
                    className="pointer-events-none absolute left-4 top-4 rounded-md border border-rose-400/60 bg-rose-50/90 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-rose-800"
                    style={{ opacity: falsoGlow }}
                    aria-hidden
                  >
                    Falso
                  </motion.span>
                </>
              )}

              <p className="relative mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                Affermazione {index + 1}/{veroFalsoItems.length}
              </p>
              <p className="relative font-heading text-xl text-foreground">
                {item.statement}
              </p>

              {!feedback && (
                <div className="relative mt-6 flex gap-3">
                  <motion.button
                    type="button"
                    onClick={() => answer(false)}
                    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                    className="flex-1 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 font-medium text-rose-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    ← Falso
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => answer(true)}
                    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                    className="flex-1 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 font-medium text-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    Vero →
                  </motion.button>
                </div>
              )}

              <AnimatePresence>
                {feedback && (
                  <motion.div
                    key="feedback"
                    initial={
                      reduceMotion ? false : { opacity: 0, y: 12, height: 0 }
                    }
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", ...motionSpring.magnetic }}
                    className={[
                      "relative mt-5 space-y-2 overflow-hidden rounded-lg border px-4 py-3",
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
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      {feedback.source && (
                        <a
                          href={feedback.source}
                          className="text-sm underline underline-offset-2"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Fonte
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={next}
                        className="rounded-lg bg-foreground px-4 py-2 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        Continua
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
