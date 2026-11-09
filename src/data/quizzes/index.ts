import type { Quiz } from "@/lib/types/quiz";
import { quizOnuStrutturaStoria } from "./onu-struttura-storia";
import { quizObiettivo16 } from "./obiettivo-16";
import { quizObiettivo17 } from "./obiettivo-17";

/** Catalogo seed dei quiz pubblici (file separati, modificabili). */
export const quizzes: Quiz[] = [
  quizOnuStrutturaStoria,
  quizObiettivo16,
  quizObiettivo17,
];

export function getQuizBySlug(slug: string): Quiz | undefined {
  return quizzes.find((q) => q.slug === slug);
}

export function getQuizById(id: string): Quiz | undefined {
  return quizzes.find((q) => q.id === id);
}

export {
  quizOnuStrutturaStoria,
  quizObiettivo16,
  quizObiettivo17,
};
