import type { Metadata } from "next";
import Link from "next/link";

import {
  saveSiteSettingsAction,
  uploadSiteAssetAction,
} from "@/app/actions/site-settings";
import { SiteSettingsFormLoader } from "@/components/admin/SiteSettingsFormLoader";
import { requireAdminOrDemo } from "@/lib/auth/require-admin";
import { getSiteSettingsFresh } from "@/lib/site-settings/get-site-settings";
import { normalizeSiteSettings } from "@/lib/site-settings/normalize";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Impostazioni | ${siteConfig.name}`,
};

export default async function AdminImpostazioniPage() {
  await requireAdminOrDemo();

  let settings;
  try {
    settings = normalizeSiteSettings(await getSiteSettingsFresh());
  } catch (err) {
    console.error("[admin/impostazioni] getSiteSettingsFresh:", err);
    settings = normalizeSiteSettings(null);
  }

  return (
    <div className="space-y-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/admin" className="hover:underline">
          Admin
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Impostazioni</span>
      </nav>
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Impostazioni del sito
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Modifica nome, scuola, footer, logo e interruttori senza toccare il
          codice. Le modifiche si riflettono sul sito pubblico dopo il
          salvataggio.
        </p>
      </header>
      <SiteSettingsFormLoader
        initial={settings}
        saveAction={saveSiteSettingsAction}
        uploadAction={uploadSiteAssetAction}
      />
    </div>
  );
}
