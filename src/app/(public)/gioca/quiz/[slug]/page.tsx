import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { QuizPageChrome } from "@/components/immersive/quiz-page-chrome";
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
    <QuizPageChrome>
      <QuizPlayer quiz={quiz} />
    </QuizPageChrome>
  );
}