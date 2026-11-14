import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

import { resolveArticleUuid } from "@/lib/articles/resolve-id";
import { getCommentsModerationEnabled } from "@/lib/comments/moderation-settings";
import { getSiteSettings } from "@/lib/site-settings/get-site-settings";
import {
  createAnonClient,
  createReadClient,
  createWriteClient,
} from "@/lib/supabase/clients";
import {
  createServiceClient,
  isSupabaseConfigured,
} from "@/lib/supabase/service";
import { isUuid } from "@/lib/uuid";
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

function normalizeArticleJoin(
  articles:
    | { slug: string; title: string }
    | { slug: string; title: string }[]
    | null
    | undefined,
): { slug: string; title: string } | null {
  if (!articles) return null;
  if (Array.isArray(articles)) return articles[0] ?? null;
  return articles;
}

function mapRow(row: {
  id: string;
  article_id: string | null;
  public_slug?: string | null;
  parent_id: string | null;
  author_name: string;
  author_email: string | null;
  body: string;
  status: CommentStatus;
  reported: boolean;
  ip_hash: string | null;
  created_at: string;
  updated_at: string;
  articles?:
    | { slug: string; title: string }
    | { slug: string; title: string }[]
    | null;
}): CommentRecord {
  const article = normalizeArticleJoin(row.articles);
  const publicSlug = row.public_slug?.trim() || null;
  const articleId = row.article_id ?? publicSlug ?? "";
  return {
    id: row.id,
    articleId,
    parentId: row.parent_id,
    authorName: row.author_name,
    authorEmail: row.author_email,
    body: row.body,
    status: row.status,
    reported: row.reported,
    ipHash: row.ip_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    articleSlug: article?.slug ?? publicSlug,
    articleTitle: article?.title ?? null,
  };
}

const SELECT_COLS =
  "id, article_id, public_slug, parent_id, author_name, author_email, body, status, reported, ip_hash, created_at, updated_at";

const SELECT_COLS_ADMIN = `${SELECT_COLS}, articles ( slug, title )`;

async function sameArticle(
  parentArticleId: string,
  inputArticleId: string,
): Promise<boolean> {
  if (parentArticleId === inputArticleId) return true;
  const resolved = await resolveArticleUuid(inputArticleId);
  return resolved !== null && resolved === parentArticleId;
}

function matchesArticleKey(
  row: CommentRecord,
  articleKey: string,
  articleUuid: string | null,
): boolean {
  if (row.articleId === articleKey) return true;
  if (row.articleSlug === articleKey) return true;
  if (articleUuid && row.articleId === articleUuid) return true;
  return false;
}

export async function listApprovedComments(
  articleId: string,
): Promise<PublicComment[]> {
  if (isSupabaseConfigured()) {
    const articleUuid = await resolveArticleUuid(articleId);
    const client = await createReadClient();
    if (client) {
      const base = client
        .from("comments")
        .select(SELECT_COLS)
        .eq("status", "approvato");

      const filtered = articleUuid
        ? base.or(
            `article_id.eq.${articleUuid},public_slug.eq.${articleId}`,
          )
        : base.eq("public_slug", articleId);

      const { data, error } = await filtered.order("created_at", {
        ascending: true,
      });
      if (error) {
        // Colonna public_slug assente → migrazione non applicata: prova solo UUID.
        if (articleUuid && /public_slug/i.test(error.message)) {
          const fallback = await client
            .from("comments")
            .select(
              "id, article_id, parent_id, author_name, author_email, body, status, reported, ip_hash, created_at, updated_at",
            )
            .eq("article_id", articleUuid)
            .eq("status", "approvato")
            .order("created_at", { ascending: true });
          if (fallback.error) {
            console.error(
              "[comments] listApprovedComments:",
              fallback.error.message,
            );
            throw new Error(
              "Impossibile caricare i commenti. Verifica le migrazioni SQL su Supabase.",
            );
          }
          return nestApproved(
            (fallback.data ?? []).map((row) =>
              mapRow({ ...row, public_slug: null }),
            ),
          );
        }
        console.error("[comments] listApprovedComments:", error.message);
        throw new Error(
          "Impossibile caricare i commenti. Riprova tra poco.",
        );
      }
      return nestApproved((data ?? []).map(mapRow));
    }
  }

  const db = await readFileDb();
  const articleUuid = isUuid(articleId) ? articleId : null;
  return nestApproved(
    db.comments.filter((c) => matchesArticleKey(c, articleId, articleUuid)),
  );
}

export async function listAllCommentsForAdmin(): Promise<CommentRecord[]> {
  if (isSupabaseConfigured()) {
    const write = await createWriteClient();
    if (write) {
      const { data, error } = await write.client
        .from("comments")
        .select(SELECT_COLS_ADMIN)
        .order("created_at", { ascending: false });
      if (error) {
        if (/public_slug/i.test(error.message)) {
          const fallback = await write.client
            .from("comments")
            .select(
              "id, article_id, parent_id, author_name, author_email, body, status, reported, ip_hash, created_at, updated_at, articles ( slug, title )",
            )
            .order("created_at", { ascending: false });
          if (fallback.error) {
            console.error(
              "[comments] listAllCommentsForAdmin:",
              fallback.error.message,
            );
            throw new Error(fallback.error.message);
          }
          return (fallback.data ?? []).map((row) =>
            mapRow({ ...row, public_slug: null }),
          );
        }
        console.error("[comments] listAllCommentsForAdmin:", error.message);
        throw new Error(error.message);
      }
      return (data ?? []).map(mapRow);
    }
  }
  const db = await readFileDb();
  return [...db.comments].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function countPendingComments(): Promise<number> {
  if (isSupabaseConfigured()) {
    const client = await createReadClient();
    if (client) {
      const { count, error } = await client
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("status", "in_attesa");
      // Anon non vede in_attesa: prova service/session
      if (!error && typeof count === "number") return count;
      const write = await createWriteClient();
      if (write) {
        const res = await write.client
          .from("comments")
          .select("id", { count: "exact", head: true })
          .eq("status", "in_attesa");
        if (!res.error && typeof res.count === "number") return res.count;
      }
    }
  }
  const db = await readFileDb();
  return db.comments.filter((c) => c.status === "in_attesa").length;
}

export async function getCommentById(
  id: string,
): Promise<CommentRecord | null> {
  if (isSupabaseConfigured() && isUuid(id)) {
    // Preferisci client con privilegi (pending nascosti all'anon).
    const write = await createWriteClient();
    const client = write?.client ?? (await createReadClient());
    if (client) {
      const { data, error } = await client
        .from("comments")
        .select(SELECT_COLS)
        .eq("id", id)
        .maybeSingle();
      if (error) {
        if (/public_slug/i.test(error.message)) {
          const fallback = await client
            .from("comments")
            .select(
              "id, article_id, parent_id, author_name, author_email, body, status, reported, ip_hash, created_at, updated_at",
            )
            .eq("id", id)
            .maybeSingle();
          if (fallback.error) {
            console.error("[comments] getCommentById:", fallback.error.message);
            throw new Error(fallback.error.message);
          }
          return fallback.data
            ? mapRow({ ...fallback.data, public_slug: null })
            : null;
        }
        console.error("[comments] getCommentById:", error.message);
        throw new Error(error.message);
      }
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
    if (!(await sameArticle(parent.articleId, input.articleId))) {
      // Confronta anche via slug pubblico del padre
      if (
        parent.articleSlug !== input.articleId &&
        parent.articleId !== input.articleId
      ) {
        throw new Error("La risposta deve essere sullo stesso articolo");
      }
    }
  }

  const now = new Date().toISOString();
  const moderationOn = await getCommentsModerationEnabled();
  const status: CommentStatus = input.forceApproved
    ? "approvato"
    : moderationOn
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
    articleSlug: isUuid(input.articleId) ? null : input.articleId,
  };

  if (isSupabaseConfigured()) {
    const articleUuid = await resolveArticleUuid(input.articleId);
    const publicSlug = articleUuid
      ? isUuid(input.articleId)
        ? null
        : input.articleId
      : input.articleId;

    // Preferisci RPC (rispetta moderazione senza service role).
    if (!input.forceApproved) {
      const anon = createAnonClient() ?? createServiceClient();
      if (anon) {
        const { data, error } = await anon.rpc("submit_public_comment", {
          p_article_id: articleUuid,
          p_public_slug: publicSlug,
          p_parent_id: record.parentId,
          p_author_name: record.authorName,
          p_author_email: record.authorEmail,
          p_body: record.body,
          p_ip_hash: record.ipHash,
        });
        if (!error && data) {
          const row = Array.isArray(data) ? data[0] : data;
          return mapRow(row as Parameters<typeof mapRow>[0]);
        }
        if (error && !/submit_public_comment|Could not find the function/i.test(error.message)) {
          console.error("[comments] insertComment RPC:", error.message);
          throw new Error(
            "Non è stato possibile salvare il commento. Se il problema continua, chiedi di applicare la migrazione SQL dei commenti su Supabase.",
          );
        }
        // RPC assente: fallback insert diretto sotto.
        if (error) {
          console.warn(
            "[comments] RPC submit_public_comment assente, fallback insert:",
            error.message,
          );
        }
      }
    }

    const write = await createWriteClient();
    if (write) {
      const payload: Record<string, unknown> = {
        id: record.id,
        article_id: articleUuid,
        parent_id: record.parentId,
        author_name: record.authorName,
        author_email: record.authorEmail,
        body: record.body,
        status: record.status,
        reported: false,
        ip_hash: record.ipHash,
      };
      if (publicSlug) payload.public_slug = publicSlug;

      // Senza service role l'insert anon consente solo in_attesa.
      if (write.mode === "anon" && record.status === "approvato") {
        payload.status = "in_attesa";
      }

      const { data, error } = await write.client
        .from("comments")
        .insert(payload)
        .select(SELECT_COLS)
        .single();

      if (error) {
        // Schema senza public_slug: richiede UUID articolo reale.
        if (/public_slug/i.test(error.message)) {
          if (!articleUuid) {
            throw new Error(
              "Per i commenti sugli articoli del sito applica la migrazione SQL 20261114000001 (public_slug) su Supabase.",
            );
          }
          const { data: d2, error: e2 } = await write.client
            .from("comments")
            .insert({
              id: record.id,
              article_id: articleUuid,
              parent_id: record.parentId,
              author_name: record.authorName,
              author_email: record.authorEmail,
              body: record.body,
              status:
                write.mode === "anon" && record.status === "approvato"
                  ? "in_attesa"
                  : record.status,
              reported: false,
              ip_hash: record.ipHash,
            })
            .select(
              "id, article_id, parent_id, author_name, author_email, body, status, reported, ip_hash, created_at, updated_at",
            )
            .single();
          if (e2) {
            console.error("[comments] insertComment:", e2.message);
            throw new Error(e2.message);
          }
          return mapRow({ ...d2, public_slug: null });
        }

        if (/row-level security|rls|permission|policy/i.test(error.message)) {
          throw new Error(
            "Permesso negato sui commenti. Imposta SUPABASE_SERVICE_ROLE_KEY su Vercel oppure applica la migrazione RLS commenti.",
          );
        }
        console.error("[comments] insertComment:", error.message);
        throw new Error(error.message);
      }
      return mapRow(data);
    }

    throw new Error(
      "Supabase configurato ma nessun client disponibile per salvare i commenti.",
    );
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
    if (isSupabaseConfigured() && isUuid(commentId)) {
      const write = await createWriteClient();
      if (write) {
        const { error } = await write.client
          .from("comments")
          .delete()
          .eq("id", commentId);
        if (error) {
          console.error("[comments] delete:", error.message);
          throw new Error(error.message);
        }
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

  if (isSupabaseConfigured() && isUuid(commentId)) {
    const write = await createWriteClient();
    if (write) {
      const { error } = await write.client
        .from("comments")
        .update({ status })
        .eq("id", commentId);
      if (error) {
        console.error("[comments] moderate:", error.message);
        throw new Error(error.message);
      }
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

  if (isSupabaseConfigured() && isUuid(input.commentId)) {
    const write = await createWriteClient();
    const client = write?.client ?? createAnonClient();
    if (client) {
      const { error: flagError } = await client
        .from("comments")
        .update({ reported: true })
        .eq("id", input.commentId);
      if (flagError) {
        console.error("[comments] flag reported:", flagError.message);
        throw new Error(flagError.message);
      }

      const { error: reportError } = await client
        .from("comment_reports")
        .insert({
          id: report.id,
          comment_id: report.commentId,
          reason: report.reason,
          reporter_ip_hash: input.ipHash,
        });
      if (
        reportError &&
        !/relation .*comment_reports/i.test(reportError.message)
      ) {
        console.error("[comments] insertReport:", reportError.message);
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
    const write = await createWriteClient();
    if (write) {
      const { data, error } = await write.client
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
  return [...db.reports].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function adminReplyToComment(input: {
  articleId: string;
  parentId: string;
  body: string;
  authorName?: string;
}): Promise<CommentRecord> {
  const settings = await getSiteSettings();
  return insertComment({
    articleId: input.articleId,
    parentId: input.parentId,
    authorName: input.authorName ?? `${settings.siteName} (redazione)`,
    authorEmail: null,
    body: input.body,
    ipHash: null,
    forceApproved: true,
  });
}
