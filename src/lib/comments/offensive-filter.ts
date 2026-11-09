/** Filtro base linguaggio offensivo / link spam (lista scolastica minimale). */
const BLOCKED_PATTERNS: RegExp[] = [
  /\b(merda|cazzo|vaffanculo|stronzo)\b/i,
  /https?:\/\/\S+/i,
  /www\.\S+/i,
];

export type FilterResult =
  | { ok: true }
  | { ok: false; reason: string };

export function checkOffensiveOrSpam(text: string): FilterResult {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      if (/https?:\/\//i.test(text) || /www\./i.test(text)) {
        return {
          ok: false,
          reason:
            "I link non sono consentiti nei commenti. Rimuovi gli URL e riprova.",
        };
      }
      return {
        ok: false,
        reason: "Il commento contiene linguaggio non consentito.",
      };
    }
  }
  return { ok: true };
}
