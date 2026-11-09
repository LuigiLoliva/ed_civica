"use server";

import { revalidatePath } from "next/cache";

import { getCurrentProfile, isAdmin } from "@/lib/auth/roles";
import { getClientIp, hashIp } from "@/lib/comments/ip";
import {
  getCommentsModerationEnabled,
  setCommentsModerationEnabled,
} from "@/lib/comments/moderation-settings";
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
import { isSupabaseConfigured } from "@/lib/supabase/service";

async function requireAdminForModeration(): Promise<ActionResult | null> {
  if (!isSupabaseConfigured()) return null;
  const profile = await getCurrentProfile();
  if (!isAdmin(profile)) {
    return { ok: false, message: "Solo gli admin possono moderare i commenti." };
  }
  return null;
}

function userFacingError(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;
  const msg = err.message;
  // Messaggi già pensati per l'utente (validazioni di dominio).
  if (
    /commento padre|un solo livello|stesso articolo|non trovato|site_settings|Supabase/i.test(
      msg,
    )
  ) {
    return msg;
  }
  return fallback;
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

  if (!authorName || authorName.length < 2 || !body || body.length < 2) {
    return { ok: false, message: "Nome e testo sono obbligatori." };
  }

  const filter = checkOffensiveOrSpam(`${authorName} ${body}`);
  if (!filter.ok) {
    return { ok: false, message: filter.reason };
  }

  let moderationOn = true;
  try {
    moderationOn = await getCommentsModerationEnabled();
    await insertComment({
      articleId: parsed.data.articleId,
      parentId: parsed.data.parentId ?? null,
      authorName,
      authorEmail,
      body,
      ipHash,
    });
  } catch (err) {
    console.error("[comments] submitCommentAction fallita:", err);
    return {
      ok: false,
      message: userFacingError(
        err,
        "Non è stato possibile salvare il commento. Riprova tra poco.",
      ),
    };
  }

  revalidatePath(`/articoli/${parsed.data.articleId}`);
  revalidatePath("/articoli");
  revalidatePath("/admin/commenti");

  return {
    ok: true,
    message: moderationOn
      ? "Grazie! Il tuo commento sarà visibile dopo l'approvazione dei docenti"
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
    console.error("[comments] reportCommentAction fallita:", err);
    return {
      ok: false,
      message: userFacingError(
        err,
        "Non è stato possibile inviare la segnalazione. Riprova.",
      ),
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
    console.error("[comments] moderateCommentAction fallita:", err);
    return {
      ok: false,
      message: userFacingError(err, "Operazione di moderazione non riuscita."),
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
  if (!body || body.length < 2) {
    return { ok: false, message: "Testo obbligatorio (minimo 2 caratteri)" };
  }
  try {
    await adminReplyToComment({
      articleId: raw.articleId,
      parentId: raw.parentId,
      body,
    });
  } catch (err) {
    console.error("[comments] adminReplyAction fallita:", err);
    return {
      ok: false,
      message: userFacingError(err, "Non è stato possibile pubblicare la risposta."),
    };
  }
  revalidatePath("/admin/commenti");
  revalidatePath("/articoli");
  return { ok: true, message: "Risposta pubblicata" };
}

export async function updateCommentsModerationAction(
  enabled: boolean,
): Promise<ActionResult> {
  const denied = await requireAdminForModeration();
  if (denied) return denied;

  try {
    await setCommentsModerationEnabled(enabled);
  } catch (err) {
    console.error("[comments] updateCommentsModerationAction fallita:", err);
    return {
      ok: false,
      message: userFacingError(
        err,
        "Impossibile aggiornare la moderazione commenti.",
      ),
    };
  }

  revalidatePath("/admin/impostazioni");
  revalidatePath("/admin/commenti");
  revalidatePath("/articoli");
  return {
    ok: true,
    message: enabled
      ? "Moderazione commenti attiva: i nuovi commenti restano in attesa."
      : "Moderazione commenti disattivata: i nuovi commenti sono pubblicati subito.",
  };
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
