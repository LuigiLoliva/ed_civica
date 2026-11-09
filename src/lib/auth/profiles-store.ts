import { createServiceClient } from "@/lib/supabase/service";
import { normalizeProfileRow } from "@/lib/auth/session-user";
import type { Profile, ProfileStatus, UserRole } from "@/types/database";

export async function listProfiles(): Promise<Profile[]> {
  const service = createServiceClient();
  if (!service) return [];

  const { data, error } = await service
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("[profiles] listProfiles:", error);
    return [];
  }

  return (data as Profile[]).map(normalizeProfileRow);
}

export async function countPendingRegistrations(): Promise<number> {
  const service = createServiceClient();
  if (!service) return 0;

  const { count, error } = await service
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending")
    .eq("role", "studente");

  if (error) {
    console.error("[profiles] countPendingRegistrations:", error);
    return 0;
  }
  return count ?? 0;
}

export async function getProfileById(
  id: string,
): Promise<Profile | null> {
  const service = createServiceClient();
  if (!service) return null;

  const { data, error } = await service
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return normalizeProfileRow(data as Profile);
}

export async function updateProfileStatus(
  id: string,
  status: ProfileStatus,
  rejectionReason?: string | null,
): Promise<Profile | null> {
  const service = createServiceClient();
  if (!service) return null;

  const payload: Record<string, unknown> = {
    status,
    rejection_reason:
      status === "rejected" ? rejectionReason?.trim() || null : null,
  };

  const { data, error } = await service
    .from("profiles")
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    console.error("[profiles] updateProfileStatus:", error);
    return null;
  }
  return normalizeProfileRow(data as Profile);
}

export async function updateProfileRole(
  id: string,
  role: UserRole,
): Promise<Profile | null> {
  const service = createServiceClient();
  if (!service) return null;

  const { data, error } = await service
    .from("profiles")
    .update({ role })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    console.error("[profiles] updateProfileRole:", error);
    return null;
  }
  return normalizeProfileRow(data as Profile);
}

export async function deleteUserCompletely(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const service = createServiceClient();
  if (!service) {
    return { ok: false, error: "Service role non configurata." };
  }

  const { error } = await service.auth.admin.deleteUser(id);
  if (error) {
    console.error("[profiles] deleteUserCompletely:", error);
    return {
      ok: false,
      error: "Impossibile eliminare l'account. Riprova o usa la dashboard Supabase.",
    };
  }
  return { ok: true };
}

export async function listAdminEmails(): Promise<string[]> {
  const service = createServiceClient();
  if (!service) return [];

  const { data, error } = await service
    .from("profiles")
    .select("email")
    .eq("role", "admin")
    .eq("status", "active");

  if (error || !data) return [];
  return data
    .map((row) => (row as { email: string }).email)
    .filter(Boolean);
}
