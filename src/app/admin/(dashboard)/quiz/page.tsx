import Link from "next/link";
import type { Metadata } from "next";
import { quizzes } from "@/data/quizzes";
import { requireAdminOrDemo } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gestione quiz",
  description: "Stub admin per creare e modificare i quiz.",
};

export default async function AdminQuizListPage() {
  await requireAdminOrDemo();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">Gestione quiz</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stub pannello docenti. Auth e persistenza dopo fondamenta.
          </p>
        </div>
        <Link
          href="/admin/quiz/nuovo"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Nuovo quiz
        </Link>
      </header>

      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        I tre quiz seed sotto sono marcati <strong>needsTeacherReview</strong>: da controllare
        con fonti ufficiali prima dell&apos;uso in classe.
      </div>

      <ul className="divide-y divide-border rounded-xl border border-border bg-white">
        {quizzes.map((quiz) => (
          <li key={quiz.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium">{quiz.title}</p>
              <p className="text-sm text-muted-foreground">
                {quiz.topicLabel} · {quiz.questions.length} domande · {quiz.difficulty}
                {quiz.needsTeacherReview ? " · da revisionare" : ""}
              </p>
            </div>
            <Link
              href={`/admin/quiz/${quiz.id}`}
              className="text-sm text-primary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Modifica (stub)
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
