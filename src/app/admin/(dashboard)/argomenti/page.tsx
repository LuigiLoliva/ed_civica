import type { Metadata } from "next";

import { getCurrentProfile, serverAdminAccess } from "@/lib/auth/roles";
import { siteConfig } from "@/lib/site-config";

import { ArgomentiClient } from "./argomenti-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Argomenti | ${siteConfig.name}`,
};

export default async function ArgomentiPage() {
  const profile = await getCurrentProfile();
  return <ArgomentiClient serverCanManage={serverAdminAccess(profile)} />;
}
