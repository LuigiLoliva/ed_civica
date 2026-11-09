/**
 * Sanitizza HTML Tiptap per footer / pagina progetto.
 * Implementazione senza jsdom/isomorphic-dompurify: quelle dipendenze
 * caricate a top-level nelle Server Action facevano crashare l'SSR di
 * /admin/impostazioni su Vercel (ERR_REQUIRE_ESM / cold-start).
 */

const ALLOWED_TAGS = new Set([
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
]);

const SELF_CLOSING = new Set(["br"]);

function escapeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizeHref(raw: string): string | null {
  const href = raw.trim();
  if (!href) return null;
  if (/^(https?:|mailto:)/i.test(href)) return href;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  if (href.startsWith("#")) return href;
  return null;
}

/**
 * Parser minimale: mantiene solo tag allowlistati e href sicuri su <a>.
 * Rimuove script/event handler/stili pericolosi.
 */
export function sanitizeSiteHtml(html: string): string {
  if (!html) return "";

  const input = String(html);
  let out = "";
  let i = 0;

  while (i < input.length) {
    const lt = input.indexOf("<", i);
    if (lt === -1) {
      out += escapeText(input.slice(i));
      break;
    }
    if (lt > i) {
      out += escapeText(input.slice(i, lt));
    }

    const gt = input.indexOf(">", lt + 1);
    if (gt === -1) {
      out += escapeText(input.slice(lt));
      break;
    }

    const rawTag = input.slice(lt + 1, gt).trim();
    i = gt + 1;

    // commenti / doctype / processing instructions
    if (!rawTag || rawTag.startsWith("!") || rawTag.startsWith("?")) {
      continue;
    }

    const isClose = rawTag.startsWith("/");
    const body = isClose ? rawTag.slice(1).trim() : rawTag;
    const nameMatch = /^([a-zA-Z][\w-]*)/.exec(body);
    if (!nameMatch) continue;

    const tagName = nameMatch[1].toLowerCase();
    if (!ALLOWED_TAGS.has(tagName)) {
      continue;
    }

    if (isClose) {
      if (!SELF_CLOSING.has(tagName)) {
        out += `</${tagName}>`;
      }
      continue;
    }

    if (SELF_CLOSING.has(tagName) || body.endsWith("/")) {
      out += `<${tagName}>`;
      continue;
    }

    if (tagName === "a") {
      const hrefMatch = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(
        body,
      );
      const rawHref = hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "";
      const href = sanitizeHref(rawHref);
      if (href) {
        out += `<a href="${escapeText(href)}" rel="noopener noreferrer">`;
      } else {
        out += "<a>";
      }
      continue;
    }

    out += `<${tagName}>`;
  }

  return out;
}
