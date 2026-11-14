"use client";

import dynamic from "next/dynamic";

import type {
  saveSiteSettingsAction,
  uploadSiteAssetAction,
} from "@/app/actions/site-settings";
import type { SiteSettings } from "@/lib/site-settings/types";

/**
 * Form impostazioni solo client (`ssr: false`) per evitare il crash Vercel
 * tipico di TipTap/Base UI sullo SSR (vedi #16).
 * Le Server Action arrivano come props dal Server Component della pagina,
 * così restano registrate nel manifest anche con dynamic import.
 */
const SiteSettingsForm = dynamic(
  () =>
    import("@/components/admin/SiteSettingsForm").then(
      (m) => m.SiteSettingsForm,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded-lg border border-border bg-card/50 p-8 text-sm text-muted-foreground"
        role="status"
      >
        Caricamento impostazioni…
      </div>
    ),
  },
);

type SaveAction = typeof saveSiteSettingsAction;
type UploadAction = typeof uploadSiteAssetAction;

export function SiteSettingsFormLoader({
  initial,
  saveAction,
  uploadAction,
}: {
  initial: SiteSettings;
  saveAction: SaveAction;
  uploadAction: UploadAction;
}) {
  return (
    <SiteSettingsForm
      initial={initial}
      saveAction={saveAction}
      uploadAction={uploadAction}
    />
  );
}
