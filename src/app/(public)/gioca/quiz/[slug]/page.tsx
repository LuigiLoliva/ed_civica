import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";
import { getQuizBySlug, quizzes } from "@/data/quizzes";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return quizzes.map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const quiz = getQuizBySlug(slug);
  if (!quiz) return { title: "Quiz non trovato" };
  return { title: quiz.title, description: quiz.description };
}

export default async function QuizPage({ params }: Props) {
  const { slug } = await params;
  const quiz = getQuizBySlug(slug);
  if (!quiz) notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-12 sm:px-6">
      <p>
        <Link
          href="/gioca"
          className="text-sm text-primary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          ← Torna a Gioca e impara
        </Link>
      </p>
      <QuizPlayer quiz={quiz} />
    </div>
  );
}
