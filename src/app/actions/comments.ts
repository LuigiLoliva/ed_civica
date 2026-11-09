"use server";

import { revalidatePath } from "next/cache";

import { getCurrentProfile, isAdmin } from "@/lib/auth/roles";
import { getClientIp, hashIp } from "@/lib/comments/ip";
import { checkOffensiveOrSpam } from "@/lib/comments/offensive-filter";
import { checkRateLimit } from "@/lib/comments/rate-limit";
import {
  createCommentSchema,
  moderateCommentSchema,
  reportCommentSchema,
} from "@/lib/comments/schema";
import {
  sanitizeCommentText,
  sanitizeDisplayName,
} from "@/lib/comments/sanitize";
import {
  adminReplyToComment,
  insertComment,
  insertReport,
  listAllCommentsForAdmin,
  listApprovedComments,
  listReports,
  moderateComment,
} from "@/lib/comments/store";
import { verifyTurnstileToken } from "@/lib/comments/turnstile";
import { siteConfig } from "@/lib/site-config";
import { isSupabaseConfigured } from "@/lib/supabase/service";

async function requireAdminForModeration(): Promise<ActionResult | null> {
  if (!isSupabaseConfigured()) return null;
  const profile = await getCurrentProfile();
  if (!isAdmin(profile)) {
    return { ok: false, message: "Solo gli admin possono moderare i commenti." };
  }
  return null;
}

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function submitCommentAction(
  raw: unknown,
): Promise<ActionResult> {
  const parsed = createCommentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dati non validi",
    };
  }

  const ip = await getClientIp();
  const ipHash = hashIp(ip);

  const rate = checkRateLimit(`comment:${ipHash}`);
  if (!rate.allowed) {
    return {
      ok: false,
      message: `Troppi commenti. Riprova tra ${rate.retryAfterSeconds} secondi.`,
    };
  }

  const turnstile = await verifyTurnstileToken(parsed.data.turnstileToken, ip);
  if (!turnstile.ok) {
    return { ok: false, message: turnstile.error };
  }

  const authorName = sanitizeDisplayName(parsed.data.authorName);
  const body = sanitizeCommentText(parsed.data.body);
  const authorEmail = parsed.data.authorEmail
    ? sanitizeCommentText(parsed.data.authorEmail).toLowerCase()
    : null;

  if (!authorName || !body) {
    return { ok: false, message: "Nome e testo sono obbligatori." };
  }

  const filter = checkOffensiveOrSpam(`${authorName} ${body}`);
  if (!filter.ok) {
    return { ok: false, message: filter.reason };
  }

  try {
    await insertComment({
      articleId: parsed.data.articleId,
      parentId: parsed.data.parentId ?? null,
      authorName,
      authorEmail,
      body,
      ipHash,
    });
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Errore nel salvataggio",
    };
  }

  revalidatePath("/articoli");
  revalidatePath("/admin/commenti");

  return {
    ok: true,
    message: siteConfig.commentsRequireApproval
      ? "Commento inviato: sarà visibile dopo l'approvazione della redazione."
      : "Commento pubblicato.",
  };
}

export async function reportCommentAction(
  raw: unknown,
): Promise<ActionResult> {
  const parsed = reportCommentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dati non validi",
    };
  }

  const ip = await getClientIp();
  const ipHash = hashIp(ip);
  const rate = checkRateLimit(`report:${ipHash}`);
  if (!rate.allowed) {
    return {
      ok: false,
      message: `Troppe segnalazioni. Riprova tra ${rate.retryAfterSeconds} secondi.`,
    };
  }

  const reason = sanitizeCommentText(parsed.data.reason);
  try {
    await insertReport({
      commentId: parsed.data.commentId,
      reason,
      ipHash,
    });
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Errore nella segnalazione",
    };
  }

  revalidatePath("/admin/commenti");
  return { ok: true, message: "Segnalazione inviata. Grazie." };
}

export async function moderateCommentAction(
  raw: unknown,
): Promise<ActionResult> {
  const denied = await requireAdminForModeration();
  if (denied) return denied;

  const parsed = moderateCommentSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Azione non valida" };
  }

  try {
    await moderateComment(parsed.data.commentId, parsed.data.action);
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Errore moderazione",
    };
  }

  revalidatePath("/admin/commenti");
  revalidatePath("/articoli");
  return {
    ok: true,
    message:
      parsed.data.action === "approve"
        ? "Commento approvato"
        : parsed.data.action === "reject"
          ? "Commento rifiutato"
          : "Commento eliminato",
  };
}

export async function adminReplyAction(raw: {
  articleId: string;
  parentId: string;
  body: string;
}): Promise<ActionResult> {
  const denied = await requireAdminForModeration();
  if (denied) return denied;

  const body = sanitizeCommentText(raw.body);
  if (!body) return { ok: false, message: "Testo obbligatorio" };
  try {
    await adminReplyToComment({
      articleId: raw.articleId,
      parentId: raw.parentId,
      body,
    });
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Errore risposta",
    };
  }
  revalidatePath("/admin/commenti");
  revalidatePath("/articoli");
  return { ok: true, message: "Risposta pubblicata" };
}

export async function fetchApprovedComments(articleId: string) {
  return listApprovedComments(articleId);
}

export async function fetchAdminModerationData() {
  const [comments, reports] = await Promise.all([
    listAllCommentsForAdmin(),
    listReports(),
  ]);
  return { comments, reports };
}
