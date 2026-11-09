/**
 * Tipi allineati allo schema Supabase (vedi supabase/migrations).
 * Quando si genera tipizzazione automatica da Supabase, sostituire questo file.
 */

export type UserRole = "admin" | "studente";

export type ArticleStatus = "bozza" | "in_revisione" | "pubblicato";

export type CommentStatus = "in_attesa" | "approvato" | "rifiutato";

export type QuizDifficulty = "facile" | "medio" | "difficile";

export type QuizQuestionType =
  | "scelta_multipla"
  | "vero_falso"
  | "risposta_multipla";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: ArticleStatus;
  topic_id: string;
  author_id: string;
  featured: boolean;
  reading_time_minutes: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleAuthor {
  id: string;
  article_id: string;
  first_name: string;
  last_name: string;
  sort_order: number;
}

export interface ArticleImage {
  id: string;
  article_id: string;
  storage_path: string;
  alt_text: string;
  caption: string | null;
  credit: string | null;
  is_cover: boolean;
  sort_order: number;
  created_at: string;
}

export interface ArticleSource {
  id: string;
  article_id: string;
  title: string;
  url: string;
  consulted_at: string;
  sort_order: number;
}

export interface Comment {
  id: string;
  article_id: string;
  parent_id: string | null;
  author_name: string;
  author_email: string | null;
  body: string;
  status: CommentStatus;
  reported: boolean;
  ip_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  topic_id: string | null;
  difficulty: QuizDifficulty;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  prompt: string;
  question_type: QuizQuestionType;
  explanation: string;
  source_url: string | null;
  sort_order: number;
}

export interface QuizOption {
  id: string;
  question_id: string;
  label: string;
  is_correct: boolean;
  sort_order: number;
}

export interface GameContent {
  id: string;
  game_key: string;
  title: string;
  description: string | null;
  payload: Record<string, unknown>;
  published: boolean;
  updated_at: string;
}

/** Schema tipizzato per il client Supabase (versione manuale) */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Profile>;
      };
      topics: {
        Row: Topic;
        Insert: Omit<Topic, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Topic>;
      };
      articles: {
        Row: Article;
        Insert: Omit<
          Article,
          "id" | "created_at" | "updated_at" | "reading_time_minutes"
        > & {
          id?: string;
          reading_time_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Article>;
      };
      article_authors: {
        Row: ArticleAuthor;
        Insert: Omit<ArticleAuthor, "id"> & { id?: string };
        Update: Partial<ArticleAuthor>;
      };
      article_images: {
        Row: ArticleImage;
        Insert: Omit<ArticleImage, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<ArticleImage>;
      };
      article_sources: {
        Row: ArticleSource;
        Insert: Omit<ArticleSource, "id"> & { id?: string };
        Update: Partial<ArticleSource>;
      };
      comments: {
        Row: Comment;
        Insert: Omit<Comment, "id" | "created_at" | "updated_at" | "reported"> & {
          id?: string;
          reported?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Comment>;
      };
      quizzes: {
        Row: Quiz;
        Insert: Omit<Quiz, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Quiz>;
      };
      quiz_questions: {
        Row: QuizQuestion;
        Insert: Omit<QuizQuestion, "id"> & { id?: string };
        Update: Partial<QuizQuestion>;
      };
      quiz_options: {
        Row: QuizOption;
        Insert: Omit<QuizOption, "id"> & { id?: string };
        Update: Partial<QuizOption>;
      };
      game_content: {
        Row: GameContent;
        Insert: Omit<GameContent, "id" | "updated_at"> & {
          id?: string;
          updated_at?: string;
        };
        Update: Partial<GameContent>;
      };
    };
  };
}
