/**
 * Sanitizza testo commento: plain text, niente HTML.
 * Senza isomorphic-dompurify/jsdom: un import top-level di quelle dipendenze
 * nelle Server Action faceva crashare l'SSR di /admin/commenti su Vercel
 * (stessa classe di bug di /admin/impostazioni, vedi sanitize-html.ts).
 */

export function sanitizeCommentText(raw: string): string {
  return String(raw ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#\d+|#x[\da-f]+|\w+);/gi, " ")
    .replace(/\u0000/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\r\n/g, "\n")
    .trim();
}

export function sanitizeDisplayName(raw: string): string {
  return sanitizeCommentText(raw).slice(0, 50);
}

/** Escape per rendering sicuro in HTML (se non usiamo textContent). */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
