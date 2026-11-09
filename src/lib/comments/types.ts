import type { CommentStatus } from "@/types/database";

export type { CommentStatus };

export type CommentRecord = {
  id: string;
  articleId: string;
  parentId: string | null;
  authorName: string;
  /** Mai mostrata nel frontend pubblico. */
  authorEmail: string | null;
  body: string;
  status: CommentStatus;
  reported: boolean;
  ipHash: string | null;
  createdAt: string;
  updatedAt: string;
  /** Presenti in moderazione admin quando disponibili. */
  articleSlug?: string | null;
  articleTitle?: string | null;
};

export type PublicComment = {
  id: string;
  articleId: string;
  parentId: string | null;
  authorName: string;
  body: string;
  createdAt: string;
  replies: PublicComment[];
};

export type CommentReport = {
  id: string;
  commentId: string;
  reason: string;
  createdAt: string;
  resolvedAt: string | null;
};
