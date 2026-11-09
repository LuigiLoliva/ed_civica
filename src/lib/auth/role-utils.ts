import type { UserRole } from "@/types/database";

const ROLES: UserRole[] = ["admin", "studente"];

/** Normalizza il ruolo da DB/cookie (spazi, casing) verso UserRole. */
export function normalizeRole(role: unknown): UserRole | null {
  if (typeof role !== "string") return null;
  const normalized = role.trim().toLowerCase();
  return ROLES.includes(normalized as UserRole)
    ? (normalized as UserRole)
    : null;
}

export function isAdminRole(role: unknown): boolean {
  return normalizeRole(role) === "admin";
}
