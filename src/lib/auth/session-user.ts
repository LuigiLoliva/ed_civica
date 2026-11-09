import type { MockUser } from "@/lib/mock/article-types";
import type { Profile } from "@/types/database";

/** Mappa un profilo Supabase nella forma usata dai componenti admin mock. */
export function profileToSessionUser(profile: Profile): MockUser {
  const parts = (profile.full_name ?? "").trim().split(/\s+/).filter(Boolean);
  const nome = parts[0] || profile.email.split("@")[0] || "Utente";
  const cognome = parts.slice(1).join(" ");
  return {
    id: profile.id,
    email: profile.email,
    nome,
    cognome,
    role: profile.role,
  };
}
