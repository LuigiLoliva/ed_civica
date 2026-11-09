import { normalizeRole } from "@/lib/auth/role-utils";
import { normalizeProfileStatus } from "@/lib/auth/status";
import type { MockUser } from "@/lib/mock/article-types";
import type { Profile, UserRole } from "@/types/database";

/** Mappa un profilo Supabase nella forma usata dai componenti admin. */
export function profileToSessionUser(profile: Profile): MockUser {
  const role = normalizeRole(profile.role) ?? ("studente" as UserRole);
  const first =
    profile.first_name?.trim() ||
    (profile.full_name ?? "").trim().split(/\s+/).filter(Boolean)[0] ||
    profile.email.split("@")[0] ||
    "Utente";
  const lastFromFull = (profile.full_name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(1)
    .join(" ");
  const cognome = profile.last_name?.trim() || lastFromFull;
  return {
    id: profile.id,
    email: profile.email,
    nome: first,
    cognome,
    role,
  };
}

/** Garantisce campi status/nome anche su righe pre-migrazione. */
export function normalizeProfileRow(row: Profile): Profile {
  const role = normalizeRole(row.role) ?? "studente";
  const status = normalizeProfileStatus(row.status) ?? "active";
  return {
    ...row,
    role,
    status,
    first_name: row.first_name ?? null,
    last_name: row.last_name ?? null,
    class_name: row.class_name ?? null,
    rejection_reason: row.rejection_reason ?? null,
  };
}
