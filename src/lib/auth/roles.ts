import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/database";

export type SessionProfile = Profile;

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
  return profile;
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
  const allowed = Array.isArray(roles) ? roles : [roles];
  return allowed.includes(profile.role);
}

export function isAdmin(profile: SessionProfile | null): boolean {
  return hasRole(profile, "admin");
}

export function canAccessAdmin(profile: SessionProfile | null): boolean {
  return hasRole(profile, ["admin", "studente"]);
}
