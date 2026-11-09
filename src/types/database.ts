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

/** Tabella additiva Fase 4: dettaglio segnalazioni (oltre a comments.reported). */
export interface CommentReportRow {
  id: string;
  comment_id: string;
  reason: string;
  reporter_ip_hash: string | null;
  created_at: string;
  resolved_at: string | null;
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

export interface SiteTeacher {
  name: string;
  role: string;
}

export interface SiteSocialLinks {
  instagram?: string;
  schoolWebsite?: string;
  facebook?: string;
  youtube?: string;
}

/** Riga singleton `site_settings` (id = 1). */
export interface SiteSettingsRow {
  id: number;
  site_name: string;
  tagline: string;
  description: string;
  school_name: string;
  school_address: string;
  school_city: string;
  school_province: string;
  class_name: string;
  school_year: string;
  teachers: SiteTeacher[];
  contact_email: string | null;
  social_links: SiteSocialLinks;
  footer_html: string;
  project_html: string;
  logo_url: string | null;
  favicon_url: string | null;
  comments_moderation_enabled: boolean;
  student_registration_enabled: boolean;
  created_at: string;
  updated_at: string;
}

type TableDef<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

/** Schema tipizzato per il client Supabase (versione manuale) */
export interface Database {
  public: {
    Tables: {
      profiles: TableDef<
        Profile,
        Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        }
      >;
      topics: TableDef<
        Topic,
        Omit<Topic, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      articles: TableDef<
        Article,
        Omit<
          Article,
          "id" | "created_at" | "updated_at" | "reading_time_minutes"
        > & {
          id?: string;
          reading_time_minutes?: number;
          created_at?: string;
          updated_at?: string;
        }
      >;
      article_authors: TableDef<
        ArticleAuthor,
        Omit<ArticleAuthor, "id"> & { id?: string }
      >;
      article_images: TableDef<
        ArticleImage,
        Omit<ArticleImage, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        }
      >;
      article_sources: TableDef<
        ArticleSource,
        Omit<ArticleSource, "id"> & { id?: string }
      >;
      comments: TableDef<
        Comment,
        Omit<Comment, "id" | "created_at" | "updated_at" | "reported"> & {
          id?: string;
          reported?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      comment_reports: TableDef<
        CommentReportRow,
        Omit<CommentReportRow, "id" | "created_at" | "resolved_at"> & {
          id?: string;
          created_at?: string;
          resolved_at?: string | null;
        }
      >;
      quizzes: TableDef<
        Quiz,
        Omit<Quiz, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      quiz_questions: TableDef<
        QuizQuestion,
        Omit<QuizQuestion, "id"> & { id?: string }
      >;
      quiz_options: TableDef<
        QuizOption,
        Omit<QuizOption, "id"> & { id?: string }
      >;
      game_content: TableDef<
        GameContent,
        Omit<GameContent, "id" | "updated_at"> & {
          id?: string;
          updated_at?: string;
        }
      >;
      site_settings: TableDef<
        SiteSettingsRow,
        Partial<Omit<SiteSettingsRow, "id" | "created_at" | "updated_at">> & {
          id?: number;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<SiteSettingsRow, "id" | "created_at">>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      article_status: ArticleStatus;
      comment_status: CommentStatus;
      quiz_difficulty: QuizDifficulty;
      quiz_question_type: QuizQuestionType;
    };
    CompositeTypes: Record<string, never>;
  };
}
