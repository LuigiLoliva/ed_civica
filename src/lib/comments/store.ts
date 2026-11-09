import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

import { siteConfig } from "@/lib/site-config";
import {
  createServiceClient,
  isSupabaseConfigured,
} from "@/lib/supabase/service";
import type { CommentStatus } from "@/types/database";

import type { CommentRecord, CommentReport, PublicComment } from "./types";

type FileDb = {
  comments: CommentRecord[];
  reports: CommentReport[];
};

const DATA_PATH = path.join(process.cwd(), "data", "comments-store.json");

async function readFileDb(): Promise<FileDb> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw) as FileDb;
  } catch {
    return { comments: [], reports: [] };
  }
}

async function writeFileDb(db: FileDb): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(db, null, 2), "utf8");
}

function toPublic(comment: CommentRecord): Omit<PublicComment, "replies"> {
  return {
    id: comment.id,
    articleId: comment.articleId,
    parentId: comment.parentId,
    authorName: comment.authorName,
    body: comment.body,
    createdAt: comment.createdAt,
  };
}

function nestApproved(comments: CommentRecord[]): PublicComment[] {
  const approved = comments.filter((c) => c.status === "approvato");
  const tops = approved.filter((c) => !c.parentId);
  return tops.map((top) => ({
    ...toPublic(top),
    replies: approved
      .filter((c) => c.parentId === top.id)
      .map((r) => ({ ...toPublic(r), replies: [] })),
  }));
}

function mapRow(row: {
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
}): CommentRecord {
  return {
    id: row.id,
    articleId: row.article_id,
    parentId: row.parent_id,
    authorName: row.author_name,
    authorEmail: row.author_email,
    body: row.body,
    status: row.status,
    reported: row.reported,
    ipHash: row.ip_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const SELECT_COLS =
  "id, article_id, parent_id, author_name, author_email, body, status, reported, ip_hash, created_at, updated_at";

export async function listApprovedComments(
  articleId: string,
): Promise<PublicComment[]> {
  if (isSupabaseConfigured()) {
    const client = createServiceClient();
    if (client) {
      const { data, error } = await client
        .from("comments")
        .select(SELECT_COLS)
        .eq("article_id", articleId)
        .eq("status", "approvato")
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return nestApproved((data ?? []).map(mapRow));
    }
  }

  const db = await readFileDb();
  return nestApproved(db.comments.filter((c) => c.articleId === articleId));
}

export async function listAllCommentsForAdmin(): Promise<CommentRecord[]> {
  if (isSupabaseConfigured()) {
    const client = createServiceClient();
    if (client) {
      const { data, error } = await client
        .from("comments")
        .select(SELECT_COLS)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []).map(mapRow);
    }
  }
  const db = await readFileDb();
  return [...db.comments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getCommentById(
  id: string,
): Promise<CommentRecord | null> {
  if (isSupabaseConfigured()) {
    const client = createServiceClient();
    if (client) {
      const { data, error } = await client
        .from("comments")
        .select(SELECT_COLS)
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data ? mapRow(data) : null;
    }
  }
  const db = await readFileDb();
  return db.comments.find((c) => c.id === id) ?? null;
}

export async function insertComment(input: {
  articleId: string;
  parentId: string | null;
  authorName: string;
  authorEmail: string | null;
  body: string;
  ipHash: string | null;
  /** Se true, pubblica subito (risposte redazione). */
  forceApproved?: boolean;
}): Promise<CommentRecord> {
  if (input.parentId) {
    const parent = await getCommentById(input.parentId);
    if (!parent) throw new Error("Commento padre non trovato");
    if (parent.parentId) {
      throw new Error("Sono consentite solo risposte a un livello");
    }
    if (parent.articleId !== input.articleId) {
      throw new Error("La risposta deve essere sullo stesso articolo");
    }
  }

  const now = new Date().toISOString();
  const status: CommentStatus = input.forceApproved
    ? "approvato"
    : siteConfig.commentsRequireApproval
      ? "in_attesa"
      : "approvato";

  const record: CommentRecord = {
    id: randomUUID(),
    articleId: input.articleId,
    parentId: input.parentId,
    authorName: input.authorName,
    authorEmail: input.authorEmail,
    body: input.body,
    status,
    reported: false,
    ipHash: input.ipHash,
    createdAt: now,
    updatedAt: now,
  };

  if (isSupabaseConfigured()) {
    const client = createServiceClient();
    if (client) {
      const { data, error } = await client
        .from("comments")
        .insert({
          id: record.id,
          article_id: record.articleId,
          parent_id: record.parentId,
          author_name: record.authorName,
          author_email: record.authorEmail,
          body: record.body,
          status: record.status,
          reported: false,
          ip_hash: record.ipHash,
        })
        .select(SELECT_COLS)
        .single();
      if (error) throw new Error(error.message);
      return mapRow(data);
    }
  }

  const db = await readFileDb();
  db.comments.push(record);
  await writeFileDb(db);
  return record;
}

export async function moderateComment(
  commentId: string,
  action: "approve" | "reject" | "delete",
): Promise<void> {
  if (action === "delete") {
    if (isSupabaseConfigured()) {
      const client = createServiceClient();
      if (client) {
        const { error } = await client
          .from("comments")
          .delete()
          .eq("id", commentId);
        if (error) throw new Error(error.message);
        return;
      }
    }
    const db = await readFileDb();
    db.comments = db.comments.filter(
      (c) => c.id !== commentId && c.parentId !== commentId,
    );
    db.reports = db.reports.filter((r) => r.commentId !== commentId);
    await writeFileDb(db);
    return;
  }

  const status: CommentStatus =
    action === "approve" ? "approvato" : "rifiutato";

  if (isSupabaseConfigured()) {
    const client = createServiceClient();
    if (client) {
      const { error } = await client
        .from("comments")
        .update({ status })
        .eq("id", commentId);
      if (error) throw new Error(error.message);
      return;
    }
  }

  const db = await readFileDb();
  const idx = db.comments.findIndex((c) => c.id === commentId);
  if (idx === -1) throw new Error("Commento non trovato");
  db.comments[idx] = {
    ...db.comments[idx],
    status,
    updatedAt: new Date().toISOString(),
  };
  await writeFileDb(db);
}

export async function insertReport(input: {
  commentId: string;
  reason: string;
  ipHash: string | null;
}): Promise<CommentReport> {
  const comment = await getCommentById(input.commentId);
  if (!comment) throw new Error("Commento non trovato");

  const report: CommentReport = {
    id: randomUUID(),
    commentId: input.commentId,
    reason: input.reason,
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  };

  if (isSupabaseConfigured()) {
    const client = createServiceClient();
    if (client) {
      const { error: flagError } = await client
        .from("comments")
        .update({ reported: true })
        .eq("id", input.commentId);
      if (flagError) throw new Error(flagError.message);

      const { error: reportError } = await client
        .from("comment_reports")
        .insert({
          id: report.id,
          comment_id: report.commentId,
          reason: report.reason,
          reporter_ip_hash: input.ipHash,
        });
      // Se la migration additiva non è ancora applicata, resta solo `reported`.
      if (reportError && !/relation .*comment_reports/i.test(reportError.message)) {
        throw new Error(reportError.message);
      }
      return report;
    }
  }

  const db = await readFileDb();
  const idx = db.comments.findIndex((c) => c.id === input.commentId);
  if (idx >= 0) {
    db.comments[idx] = { ...db.comments[idx], reported: true };
  }
  db.reports.push(report);
  await writeFileDb(db);
  return report;
}

export async function listReports(): Promise<CommentReport[]> {
  if (isSupabaseConfigured()) {
    const client = createServiceClient();
    if (client) {
      const { data, error } = await client
        .from("comment_reports")
        .select("id, comment_id, reason, created_at, resolved_at")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map((row) => ({
          id: row.id,
          commentId: row.comment_id,
          reason: row.reason,
          createdAt: row.created_at,
          resolvedAt: row.resolved_at,
        }));
      }
      // Fallback: commenti segnalati senza dettaglio motivo
      const flagged = await listAllCommentsForAdmin();
      return flagged
        .filter((c) => c.reported)
        .map((c) => ({
          id: c.id,
          commentId: c.id,
          reason: "(segnalato — motivo non disponibile)",
          createdAt: c.updatedAt,
          resolvedAt: null,
        }));
    }
  }
  const db = await readFileDb();
  return [...db.reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function adminReplyToComment(input: {
  articleId: string;
  parentId: string;
  body: string;
  authorName?: string;
}): Promise<CommentRecord> {
  return insertComment({
    articleId: input.articleId,
    parentId: input.parentId,
    authorName: input.authorName ?? `${siteConfig.name} (redazione)`,
    authorEmail: null,
    body: input.body,
    ipHash: null,
    forceApproved: true,
  });
}
