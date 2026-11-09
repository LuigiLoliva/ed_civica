import type { Metadata } from "next";

import { listProfiles } from "@/lib/auth/profiles-store";
import { getCurrentProfile, serverAdminAccess } from "@/lib/auth/roles";
import { getUsers } from "@/lib/mock/store";
import { siteConfig } from "@/lib/site-config";
import type { Profile } from "@/types/database";

import { UtentiClient } from "./utenti-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Utenti | ${siteConfig.name}`,
};

function mockProfiles(): Profile[] {
  return getUsers().map((u) => ({
    id: u.id,
    email: u.email,
    full_name: `${u.nome} ${u.cognome}`.trim(),
    first_name: u.nome,
    last_name: u.cognome,
    class_name: null,
    role: u.role,
    status: "active" as const,
    rejection_reason: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

export default async function UtentiPage() {
  const profile = await getCurrentProfile();
  const canManage = serverAdminAccess(profile);
  const fromDb = await listProfiles();
  const profiles = fromDb.length > 0 ? fromDb : mockProfiles();

  return (
    <UtentiClient
      serverCanManage={canManage}
      profiles={profiles}
      usingLiveData={fromDb.length > 0}
    />
  );
}
