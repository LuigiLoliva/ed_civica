import { siteConfig } from "@/lib/site-config";
import {
  createServiceClient,
  isSupabaseConfigured,
} from "@/lib/supabase/service";

/**
 * Flag moderazione commenti.
 * Legge `site_settings.comments_moderation_enabled` se disponibile,
 * altrimenti fallback a `siteConfig.commentsRequireApproval`.
 */
export async function getCommentsModerationEnabled(): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const client = createServiceClient();
    if (client) {
      const { data, error } = await client
        .from("site_settings")
        .select("comments_moderation_enabled")
        .eq("id", 1)
        .maybeSingle();

      if (!error && data && typeof data.comments_moderation_enabled === "boolean") {
        return data.comments_moderation_enabled;
      }
      // Tabella assente / non migrata: fallback silenzioso al config locale.
      if (error && !/relation .*site_settings/i.test(error.message)) {
        console.error("[comments] lettura site_settings fallita:", error.message);
      }
    }
  }

  return siteConfig.commentsRequireApproval;
}

export async function setCommentsModerationEnabled(
  enabled: boolean,
): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase non configurato: imposta commentsRequireApproval in site-config per lo sviluppo locale.",
    );
  }

  const client = createServiceClient();
  if (!client) {
    throw new Error("Service role Supabase non disponibile.");
  }

  const { error } = await client.from("site_settings").upsert(
    {
      id: 1,
      comments_moderation_enabled: enabled,
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("[comments] salvataggio moderazione fallito:", error.message);
    if (/relation .*site_settings/i.test(error.message)) {
      throw new Error(
        "Tabella site_settings assente. Applica la migration 20261109000004.",
      );
    }
    throw new Error("Impossibile salvare l'impostazione di moderazione.");
  }
}
