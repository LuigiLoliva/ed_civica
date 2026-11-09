import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** True se URL + anon key sono presenti. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Client service-role (bypass RLS) per insert pubblici e moderazione.
 * Tipizzazione lasca: lo schema manuale non è ancora allineato al GenericSchema
 * di supabase-js v2; i payload sono validati in Zod/store.
 */
export function createServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
