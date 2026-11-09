import {
  createServiceClient,
  isSupabaseConfigured,
} from "@/lib/supabase/service";
import { isUuid } from "@/lib/uuid";

/**
 * Risolve una chiave articolo (UUID oppure slug mock/pubblico) in un UUID
 * Supabase. Non passa mai uno slug a colonne `uuid`.
 *
 * - Se `key` è già UUID → lo restituisce.
 * - Altrimenti cerca `articles.slug = key` (testo) e restituisce `id`.
 * - Se non trovato / Supabase non configurato → `null` (usare store file).
 */
export async function resolveArticleUuid(
  key: string,
): Promise<string | null> {
  const trimmed = key.trim();
  if (!trimmed) return null;
  if (isUuid(trimmed)) return trimmed;

  if (!isSupabaseConfigured()) return null;
  const client = createServiceClient();
  if (!client) return null;

  const { data, error } = await client
    .from("articles")
    .select("id")
    .eq("slug", trimmed)
    .maybeSingle();

  if (error) {
    // Schema assente / rete: non propagare errori UUID; fallback file store.
    return null;
  }
  const id = data?.id;
  return typeof id === "string" && isUuid(id) ? id : null;
}
