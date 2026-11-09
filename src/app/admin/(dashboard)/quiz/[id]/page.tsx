import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { QuizEditorStub } from "@/components/admin/QuizEditorStub";
import { getQuizById, quizzes } from "@/data/quizzes";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return quizzes.map((q) => ({ id: q.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const quiz = getQuizById(id);
  return { title: quiz ? `Modifica: ${quiz.title}` : "Quiz non trovato" };
}

export default async function AdminQuizEditPage({ params }: Props) {
  const { id } = await params;
  const quiz = getQuizById(id);
  if (!quiz) notFound();

  return (
    <div className="space-y-4">
      <Link
        href="/admin/quiz"
        className="text-sm text-primary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        ← Elenco quiz
      </Link>
      {quiz.needsTeacherReview && (
        <aside className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {quiz.reviewNote}
        </aside>
      )}
      <QuizEditorStub mode="edit" initial={quiz} />
      <p className="text-sm text-muted-foreground">
        Anteprima pubblica:{" "}
        <Link href={`/gioca/quiz/${quiz.slug}`} className="text-primary underline">
          /gioca/quiz/{quiz.slug}
        </Link>
      </p>
    </div>
  );
}
