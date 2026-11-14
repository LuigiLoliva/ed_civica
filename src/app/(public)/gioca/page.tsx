import Link from "next/link";
import type { Metadata } from "next";

import { PageBanner } from "@/components/layout/page-banner";
import { quizzes } from "@/data/quizzes";
import { games } from "@/data/games";

export const metadata: Metadata = {
  title: "Gioca e impara",
  description: "Quiz e mini-giochi su ONU e Agenda 2030 (Obiettivi 16 e 17).",
};

export default function GiocaPage() {
  return (
    <div className="bg-partnership-pattern">
      <PageBanner
        title="Gioca e impara"
        description="Metti alla prova le conoscenze sull'ONU e sull'Agenda 2030. Nessun login richiesto. I quiz seed sono marcati per revisione docente."
      />

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-12 sm:px-6">
        <section aria-labelledby="quiz-heading" className="space-y-5">
          <h2
            id="quiz-heading"
            className="font-heading text-2xl font-semibold text-goal-16 sm:text-3xl"
          >
            Quiz
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <li key={quiz.id}>
                <Link
                  href={`/gioca/quiz/${quiz.slug}`}
                  className="block h-full rounded-2xl border border-border/80 bg-card/90 p-5 shadow-[0_1px_0_rgb(12_26_40_/_4%)] transition hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                    {quiz.topicLabel} · {quiz.difficulty}
                  </p>
                  <h3 className="font-heading mt-2 text-xl">{quiz.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {quiz.description}
                  </p>
                  <p className="mt-3 text-sm font-medium text-foreground">
                    {quiz.questions.length} domande
                  </p>
                  {quiz.needsTeacherReview && (
                    <p className="mt-2 text-xs text-amber-800">
                      Da revisionare dai docenti
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="games-heading" className="space-y-5">
          <h2
            id="games-heading"
            className="font-heading text-2xl font-semibold text-goal-17 sm:text-3xl"
          >
            Mini-giochi
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {games.map((game) => (
              <li key={game.slug}>
                <Link
                  href={`/gioca/giochi/${game.slug}`}
                  className="block h-full rounded-2xl border border-border/80 bg-card/90 p-5 shadow-[0_1px_0_rgb(12_26_40_/_4%)] transition hover:-translate-y-0.5 hover:border-goal-17/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <p className="text-xs font-semibold tracking-wide text-goal-17 uppercase">
                    {game.badge} · ~{game.estimatedMinutes} min
                  </p>
                  <h3 className="font-heading mt-2 text-xl">{game.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {game.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
