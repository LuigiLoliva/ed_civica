import type { Metadata } from "next";

import { getCurrentProfile, serverAdminAccess } from "@/lib/auth/roles";
import { siteConfig } from "@/lib/site-config";

import { UtentiClient } from "./utenti-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Utenti | ${siteConfig.name}`,
};

export default async function UtentiPage() {
  const profile = await getCurrentProfile();
  return <UtentiClient serverCanManage={serverAdminAccess(profile)} />;
}
