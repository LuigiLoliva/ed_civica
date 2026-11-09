import type { Metadata } from "next";
import Link from "next/link";

import { requireAdminOrDemo } from "@/lib/auth/require-admin";
import { getCommentsModerationEnabled } from "@/lib/comments/moderation-settings";
import { siteConfig } from "@/lib/site-config";

import { ModerationSettingsClient } from "./moderation-settings-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Impostazioni | ${siteConfig.name}`,
};

export default async function AdminImpostazioniPage() {
  await requireAdminOrDemo();
  const moderationEnabled = await getCommentsModerationEnabled();

  return (
    <div className="space-y-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/admin" className="hover:underline">
          Admin
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Impostazioni</span>
      </nav>
      <header>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Impostazioni del sito
        </h1>
        <p className="mt-2 text-muted-foreground">
          Per ora è disponibile l&apos;interruttore di moderazione commenti.
          Gli altri campi (scuola, logo, footer, ecc.) arriveranno con
          l&apos;aggiornamento successivo.
        </p>
      </header>
      <ModerationSettingsClient initialEnabled={moderationEnabled} />
    </div>
  );
}
