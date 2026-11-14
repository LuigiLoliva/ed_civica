import { createAnonClient } from "@/lib/supabase/clients";
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
 * - Altrimenti cerca `articles.slug = key` (service role o anon).
 * - Se non trovato / Supabase non configurato → `null` (usare `public_slug`).
 */
export async function resolveArticleUuid(
  key: string,
): Promise<string | null> {
  const trimmed = key.trim();
  if (!trimmed) return null;
  if (isUuid(trimmed)) return trimmed;

  if (!isSupabaseConfigured()) return null;

  const client = createServiceClient() ?? createAnonClient();
  if (!client) return null;

  const { data, error } = await client
    .from("articles")
    .select("id")
    .eq("slug", trimmed)
    .maybeSingle();

  if (error) {
    // Schema assente / rete: non propagare; fallback public_slug.
    return null;
  }
  const id = data?.id;
  return typeof id === "string" && isUuid(id) ? id : null;
}
