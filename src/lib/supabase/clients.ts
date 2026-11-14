import { createClient as createJsClient, type SupabaseClient } from "@supabase/supabase-js";

import { createClient as createServerCookieClient } from "@/lib/supabase/server";
import {
  createServiceClient,
  isSupabaseConfigured,
} from "@/lib/supabase/service";

/** Client anon senza cookie (letture pubbliche / RPC). */
export function createAnonClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createJsClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Preferisce service-role; altrimenti sessione cookie (admin RLS);
 * infine anon (policy pubbliche / RPC).
 */
export async function createWriteClient(): Promise<{
  client: SupabaseClient;
  mode: "service" | "session" | "anon";
} | null> {
  if (!isSupabaseConfigured()) return null;

  const service = createServiceClient();
  if (service) return { client: service, mode: "service" };

  try {
    const session = await createServerCookieClient();
    return { client: session as unknown as SupabaseClient, mode: "session" };
  } catch {
    // cookies() può fallire fuori da request context
  }

  const anon = createAnonClient();
  if (anon) return { client: anon, mode: "anon" };
  return null;
}

export async function createReadClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;
  return createServiceClient() ?? createAnonClient();
}
