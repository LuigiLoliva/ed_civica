import DOMPurify from "isomorphic-dompurify";

/** Sanitizza HTML Tiptap per footer / pagina progetto. */
export function sanitizeSiteHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "a",
      "ul",
      "ol",
      "li",
      "h2",
      "h3",
      "blockquote",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
  });
}
