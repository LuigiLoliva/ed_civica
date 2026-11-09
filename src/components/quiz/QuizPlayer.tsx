"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Quiz, QuizQuestion } from "@/lib/types/quiz";

type Phase = "intro" | "playing" | "feedback" | "result";

function isAnswerCorrect(question: QuizQuestion, selected: string[]): boolean {
  const correctIds = question.options.filter((o) => o.correct).map((o) => o.id).sort();
  const chosen = [...selected].sort();
  if (correctIds.length !== chosen.length) return false;
  return correctIds.every((id, i) => id === chosen[i]);
}

function toggleOption(
  question: QuizQuestion,
  selected: string[],
  optionId: string,
): string[] {
  if (question.type === "multiple") {
    return selected.includes(optionId)
      ? selected.filter((id) => id !== optionId)
      : [...selected, optionId];
  }
  return [optionId];
}

export function QuizPlayer({ quiz }: { quiz: Quiz }) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [lastCorrect, setLastCorrect] = useState(false);

  const question = quiz.questions[index];
  const progress = useMemo(
    () => ((index + (phase === "feedback" || phase === "result" ? 1 : 0)) / quiz.questions.length) * 100,
    [index, phase, quiz.questions.length],
  );

  function start() {
    setPhase("playing");
    setIndex(0);
    setSelected([]);
    setScore(0);
  }

  function submitAnswer() {
    if (!question || selected.length === 0) return;
    const ok = isAnswerCorrect(question, selected);
    setLastCorrect(ok);
    if (ok) setScore((s) => s + 1);
    setPhase("feedback");
  }

  function next() {
    if (index + 1 >= quiz.questions.length) {
      setPhase("result");
      return;
    }
    setIndex((i) => i + 1);
    setSelected([]);
    setPhase("playing");
  }

  function shareResult() {
    const text = `Ho totalizzato ${score}/${quiz.questions.length} su «${quiz.title}» — ${siteShareLabel()}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      void navigator.share({ title: quiz.title, text }).catch(() => {
        void navigator.clipboard?.writeText(text);
      });
      return;
    }
    void navigator.clipboard?.writeText(text);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {quiz.needsTeacherReview && (
        <aside
          role="note"
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        >
          <strong className="font-semibold">Da revisionare dai docenti.</strong>{" "}
          {quiz.reviewNote ??
            "Contenuti seed generati dall'IA: verificare prima dell'uso in classe."}
        </aside>
      )}

      <div
        className="h-2 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(phase === "intro" ? 0 : progress)}
        aria-label="Avanzamento quiz"
      >
        <motion.div
          className="h-full bg-primary"
          initial={false}
          animate={{ width: `${phase === "intro" ? 0 : progress}%` }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.section
            key="intro"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <p className="text-sm uppercase tracking-wide text-goal-16">
              {quiz.topicLabel} · {quiz.difficulty}
            </p>
            <h1 className="font-heading text-3xl text-foreground">
              {quiz.title}
            </h1>
            <p className="text-foreground/80">{quiz.description}</p>
            <p className="text-sm text-muted-foreground">
              {quiz.questions.length} domande · nessun login richiesto
            </p>
            <button
              type="button"
              onClick={start}
              className="rounded-lg bg-primary px-5 py-2.5 font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Inizia il quiz
            </button>
          </motion.section>
        )}

        {(phase === "playing" || phase === "feedback") && question && (
          <motion.section
            key={question.id + phase}
            initial={reduceMotion ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
            className="space-y-5"
            aria-live="polite"
          >
            <p className="text-sm text-muted-foreground">
              Domanda {index + 1} di {quiz.questions.length}
              {question.type === "multiple" ? " · più risposte possibili" : ""}
            </p>
            <h2 className="font-heading text-2xl text-foreground">
              {question.prompt}
            </h2>

            <fieldset disabled={phase === "feedback"} className="space-y-2">
              <legend className="sr-only">Opzioni di risposta</legend>
              {question.options.map((opt) => {
                const checked = selected.includes(opt.id);
                const showState = phase === "feedback";
                const isCorrectOpt = opt.correct;
                return (
                  <label
                    key={opt.id}
                    className={[
                      "flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition",
                      checked
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                      showState && isCorrectOpt ? "border-emerald-500 bg-emerald-50" : "",
                      showState && checked && !isCorrectOpt ? "border-rose-400 bg-rose-50" : "",
                    ].join(" ")}
                  >
                    <input
                      type={question.type === "multiple" ? "checkbox" : "radio"}
                      name={question.id}
                      value={opt.id}
                      checked={checked}
                      onChange={() =>
                        setSelected((prev) => toggleOption(question, prev, opt.id))
                      }
                      className="mt-1"
                    />
                    <span>{opt.text}</span>
                  </label>
                );
              })}
            </fieldset>

            {phase === "playing" && (
              <button
                type="button"
                onClick={submitAnswer}
                disabled={selected.length === 0}
                className="rounded-lg bg-primary px-5 py-2.5 font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Conferma risposta
              </button>
            )}

            {phase === "feedback" && (
              <div
                className={[
                  "space-y-3 rounded-lg border px-4 py-3",
                  lastCorrect
                    ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                    : "border-rose-300 bg-rose-50 text-rose-950",
                ].join(" ")}
                role="status"
              >
                <p className="font-semibold">
                  {lastCorrect ? "Corretto!" : "Non esatto"}
                </p>
                <p>{question.explanation}</p>
                {question.source && (
                  <p className="text-sm">
                    Fonte:{" "}
                    <a
                      href={question.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {question.source}
                    </a>
                  </p>
                )}
                <button
                  type="button"
                  onClick={next}
                  className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {index + 1 >= quiz.questions.length ? "Vedi risultato" : "Domanda successiva"}
                </button>
              </div>
            )}
          </motion.section>
        )}

        {phase === "result" && (
          <motion.section
            key="result"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 text-center"
          >
            <h2 className="font-heading text-3xl">Risultato</h2>
            <p className="text-5xl font-semibold text-primary" aria-live="polite">
              {score}/{quiz.questions.length}
            </p>
            <p className="text-muted-foreground">
              {score === quiz.questions.length
                ? "Perfetto! Hai risposto a tutto correttamente."
                : "Puoi rifare il quiz per migliorare il punteggio."}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={start}
                className="rounded-lg bg-primary px-5 py-2.5 font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Rifai il quiz
              </button>
              <button
                type="button"
                onClick={shareResult}
                className="rounded-lg border border-border px-5 py-2.5 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Condividi risultato
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              La condivisione non include dati personali.
            </p>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

function siteShareLabel() {
  return "Voci Unite · Gioca e impara";
}
