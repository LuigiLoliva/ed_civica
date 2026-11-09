import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizza testo commento: niente HTML, XSS prevenuto.
 * I commenti sono plain text; strippiamo tag e entità pericolose.
 */
export function sanitizeCommentText(raw: string): string {
  const stripped = DOMPurify.sanitize(raw ?? "", {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });

  return stripped
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
