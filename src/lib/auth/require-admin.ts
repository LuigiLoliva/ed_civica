import { redirect } from "next/navigation";

import {
  getCurrentProfile,
  isAdmin,
  isSupabaseConfigured,
  type SessionProfile,
} from "@/lib/auth/roles";

/**
 * Per sezioni admin-only: con Supabase attivo richiede ruolo admin.
 * Senza Supabase (demo locale) lascia passare e restituisce null.
 */
export async function requireAdminOrDemo(): Promise<SessionProfile | null> {
  const profile = await getCurrentProfile();
  if (isSupabaseConfigured() && !isAdmin(profile)) {
    redirect("/admin");
  }
  return profile;
}
