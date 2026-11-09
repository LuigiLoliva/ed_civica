import { redirect } from "next/navigation";

import {
  getCurrentProfile,
  isActiveStatus,
  isAdmin,
  isSupabaseConfigured,
  type SessionProfile,
} from "@/lib/auth/roles";

/**
 * Per sezioni admin-only: con Supabase attivo richiede ruolo admin + status active.
 * Senza Supabase (demo locale) lascia passare e restituisce null.
 */
export async function requireAdminOrDemo(): Promise<SessionProfile | null> {
  const profile = await getCurrentProfile();
  if (isSupabaseConfigured() && !isAdmin(profile)) {
    if (profile && !isActiveStatus(profile.status)) {
      redirect(`/auth/pending?status=${profile.status}`);
    }
    redirect("/admin");
  }
  return profile;
}
