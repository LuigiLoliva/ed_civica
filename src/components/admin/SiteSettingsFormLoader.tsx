"use client";

import dynamic from "next/dynamic";

import type { SiteSettings } from "@/lib/site-settings/types";

const SiteSettingsForm = dynamic(
  () =>
    import("@/components/admin/SiteSettingsForm").then((m) => m.SiteSettingsForm),
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

export function SiteSettingsFormLoader({ initial }: { initial: SiteSettings }) {
  return <SiteSettingsForm initial={initial} />;
}
