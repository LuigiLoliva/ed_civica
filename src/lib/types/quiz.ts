/** Tipi di domanda supportati dall'editor e dal player. */
export type QuestionType = "single" | "multiple" | "true_false";

export type QuizDifficulty = "facile" | "medio" | "difficile";

export interface QuizOption {
  id: string;
  text: string;
  /** true se l'opzione è corretta (una o più per tipo multiple). */
  correct: boolean;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options: QuizOption[];
  /** Spiegazione mostrata dopo la risposta. */
  explanation: string;
  /** Fonte opzionale (URL o citazione). */
  source?: string;
}

export interface Quiz {
  id: string;
  slug: string;
  title: string;
  description: string;
  /** Argomento collegato (slug o etichetta, in attesa della tabella topics). */
  topicSlug: string;
  topicLabel: string;
  difficulty: QuizDifficulty;
  questions: QuizQuestion[];
  /**
   * Seed generato dall'IA: i contenuti vanno controllati dai docenti
   * prima dell'uso in classe.
   */
  needsTeacherReview: boolean;
  reviewNote?: string;
}
