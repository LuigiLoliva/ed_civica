/**
 * Tipi UI per il form admin mock (localStorage).
 * Allineati a `src/types/database.ts`; poi client Supabase.
 */
import type { ArticleStatus, UserRole } from "@/types/database";

export type { ArticleStatus, UserRole };

export interface MockUser {
  id: string;
  email: string;
  nome: string;
  cognome: string;
  role: UserRole;
}

export interface MockTopic {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
}

export interface MockAuthor {
  firstName: string;
  lastName: string;
}

export interface MockImage {
  id: string;
  url: string;
  altText: string;
  caption: string;
  credit: string;
  isCover: boolean;
}

export interface MockSource {
  id: string;
  title: string;
  url: string;
  consultedAt: string;
}

export interface MockArticle {
  id: string;
  title: string;
  slug: string;
  topicId: string;
  authors: MockAuthor[];
  excerpt: string;
  body: string;
  images: MockImage[];
  sources: MockSource[];
  status: ArticleStatus;
  authorUserId: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}
