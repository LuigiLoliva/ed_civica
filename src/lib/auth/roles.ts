import type { User } from "@supabase/supabase-js";

import { normalizeRole } from "@/lib/auth/role-utils";
import { normalizeProfileRow } from "@/lib/auth/session-user";
import { isActiveStatus } from "@/lib/auth/status";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/database";

export type SessionProfile = Profile;
export { isAdminRole, normalizeRole } from "@/lib/auth/role-utils";
export {
  isActiveStatus,
  loginBlockedMessage,
  normalizeProfileStatus,
  profileStatusLabel,
} from "@/lib/auth/status";

/**
 * Restituisce il profilo dell'utente autenticato, o null se non loggato /
 * Supabase non configurato.
 */
export async function getCurrentProfile(): Promise<SessionProfile | null> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) return null;

  const row = normalizeProfileRow(profile as Profile);
  if (!normalizeRole(row.role)) return null;

  return row;
}

export async function getCurrentUser(): Promise<User | null> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export function hasRole(
  profile: SessionProfile | null,
  roles: UserRole | UserRole[],
): boolean {
  if (!profile) return false;
  const current = normalizeRole(profile.role);
  if (!current) return false;
  const allowed = Array.isArray(roles) ? roles : [roles];
  return allowed.includes(current);
}

export function isAdmin(profile: SessionProfile | null): boolean {
  return hasRole(profile, "admin") && isActiveStatus(profile?.status);
}

export function canAccessAdmin(profile: SessionProfile | null): boolean {
  return (
    hasRole(profile, ["admin", "studente"]) &&
    isActiveStatus(profile?.status)
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Usato da pagine admin: true se admin reale, null se modalità demo locale. */
export function serverAdminAccess(
  profile: SessionProfile | null,
): boolean | null {
  if (profile) return isAdmin(profile);
  if (isSupabaseConfigured()) return false;
  return null;
}
