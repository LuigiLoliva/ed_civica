"use client";

import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";
import type { SiteSettings } from "@/lib/site-settings/types";

/**
 * Wrapper client per il form impostazioni.
 * Import statico (non dynamic ssr:false): altrimenti su Vercel le Server Action
 * di salvataggio/upload non risultano registrate e il client mostra
 * «Non è possibile farlo attualmente».
 */
export function SiteSettingsFormLoader({ initial }: { initial: SiteSettings }) {
  return <SiteSettingsForm initial={initial} />;
}
