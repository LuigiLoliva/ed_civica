"use client";

import { useState } from "react";
import type { Quiz, QuizDifficulty, QuestionType } from "@/lib/types/quiz";

/**
 * Stub dell'editor quiz admin.
 * Persistenza Supabase da collegare dopo il merge delle fondamenta (SEC-1).
 */
export function QuizEditorStub({
  initial,
  mode,
}: {
  initial?: Partial<Quiz>;
  mode: "create" | "edit";
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [topicLabel, setTopicLabel] = useState(initial?.topicLabel ?? "");
  const [difficulty, setDifficulty] = useState<QuizDifficulty>(
    initial?.difficulty ?? "medio",
  );
  const [questionCount, setQuestionCount] = useState(initial?.questions?.length ?? 1);
  const [sampleType, setSampleType] = useState<QuestionType>("single");
  const [savedHint, setSavedHint] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavedHint(
      "Stub: il salvataggio su database sarà disponibile dopo le fondamenta (tabella quizzes + RLS admin). Nessun dato è stato persistito.",
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <strong>Editor stub.</strong> UI di anteprima per docenti. Collegare Auth/RLS e
        Server Actions dopo SEC-1.
      </div>

      <fieldset className="space-y-4">
        <legend className="font-heading text-xl">
          {mode === "create" ? "Nuovo quiz" : "Modifica quiz"}
        </legend>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Titolo</span>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Descrizione</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Argomento collegato</span>
          <input
            value={topicLabel}
            onChange={(e) => setTopicLabel(e.target.value)}
            placeholder="es. Obiettivo 16"
            className="w-full rounded-lg border border-border px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Difficoltà</span>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as QuizDifficulty)}
            className="w-full rounded-lg border border-border px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <option value="facile">Facile</option>
            <option value="medio">Medio</option>
            <option value="difficile">Difficile</option>
          </select>
        </label>
      </fieldset>

      <fieldset className="space-y-3 rounded-lg border border-dashed border-border p-4">
        <legend className="px-1 text-sm font-medium">Domande (anteprima struttura)</legend>
        <p className="text-sm text-muted-foreground">
          Tipi supportati: scelta multipla (una risposta), vero/falso, risposta multipla.
          Ogni domanda avrà spiegazione e fonte opzionale.
        </p>
        <label className="flex items-center gap-2 text-sm">
          Numero domande (stub)
          <input
            type="number"
            min={1}
            max={30}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-20 rounded border border-border px-2 py-1"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          Tipo domanda di esempio
          <select
            value={sampleType}
            onChange={(e) => setSampleType(e.target.value as QuestionType)}
            className="rounded border border-border px-2 py-1"
          >
            <option value="single">Scelta multipla (una)</option>
            <option value="true_false">Vero/Falso</option>
            <option value="multiple">Risposta multipla</option>
          </select>
        </label>
        <button
          type="button"
          disabled
          className="rounded-lg border border-border px-3 py-1.5 text-sm opacity-50"
          title="Disponibile dopo persistenza DB"
        >
          + Aggiungi domanda (prossimamente)
        </button>
      </fieldset>

      <button
        type="submit"
        className="rounded-lg bg-primary px-5 py-2.5 font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Salva (stub)
      </button>

      {savedHint && (
        <p className="text-sm text-muted-foreground" role="status">
          {savedHint}
        </p>
      )}
    </form>
  );
}
