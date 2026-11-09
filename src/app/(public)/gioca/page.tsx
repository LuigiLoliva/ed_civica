import Link from "next/link";
import type { Metadata } from "next";
import { quizzes } from "@/data/quizzes";
import { games } from "@/data/games";

export const metadata: Metadata = {
  title: "Gioca e impara",
  description: "Quiz e mini-giochi su ONU e Agenda 2030 (Obiettivi 16 e 17).",
};

export default function GiocaPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6">
      <header className="max-w-2xl space-y-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Gioca e impara
        </h1>
        <p className="text-muted-foreground">
          Metti alla prova le conoscenze sull&apos;ONU e sull&apos;Agenda 2030. Nessun login
          richiesto. I quiz seed sono marcati per revisione docente.
        </p>
      </header>

      <section aria-labelledby="quiz-heading" className="space-y-4">
        <h2
          id="quiz-heading"
          className="font-heading text-2xl text-goal-16"
        >
          Quiz
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <li key={quiz.id}>
              <Link
                href={`/gioca/quiz/${quiz.slug}`}
                className="block h-full rounded-xl border border-border bg-white/80 p-5 transition hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <p className="text-xs uppercase tracking-wide text-primary">
                  {quiz.topicLabel} · {quiz.difficulty}
                </p>
                <h3 className="mt-2 font-heading text-xl">
                  {quiz.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {quiz.description}
                </p>
                <p className="mt-3 text-sm font-medium text-foreground">
                  {quiz.questions.length} domande
                </p>
                {quiz.needsTeacherReview && (
                  <p className="mt-2 text-xs text-amber-800">Da revisionare dai docenti</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="games-heading" className="space-y-4">
        <h2
          id="games-heading"
          className="font-heading text-2xl text-goal-17"
        >
          Mini-giochi
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {games.map((game) => (
            <li key={game.slug}>
              <Link
                href={`/gioca/giochi/${game.slug}`}
                className="block h-full rounded-xl border border-border bg-white/80 p-5 transition hover:border-goal-17 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <p className="text-xs uppercase tracking-wide text-goal-17">
                  {game.badge} · ~{game.estimatedMinutes} min
                </p>
                <h3 className="mt-2 font-heading text-xl">
                  {game.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {game.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
