import { siteConfig } from "@/lib/site-config";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site-settings/defaults";
import { readFileSettings, writeFileSettings } from "@/lib/site-settings/file-store";
import {
  createServiceClient,
  isSupabaseConfigured,
} from "@/lib/supabase/service";

/**
 * Flag moderazione commenti.
 * Preferisce `site_settings.comments_moderation_enabled`, poi file store demo,
 * infine `siteConfig.commentsRequireApproval`.
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

      if (
        !error &&
        data &&
        typeof data.comments_moderation_enabled === "boolean"
      ) {
        return data.comments_moderation_enabled;
      }
      if (error && !/relation .*site_settings/i.test(error.message)) {
        console.error(
          "[comments] lettura site_settings fallita:",
          error.message,
        );
      }
    }
  } else {
    const local = await readFileSettings();
    return local.commentsModerationEnabled;
  }

  return (
    siteConfig.commentsRequireApproval ??
    DEFAULT_SITE_SETTINGS.commentsModerationEnabled
  );
}

export async function setCommentsModerationEnabled(
  enabled: boolean,
): Promise<void> {
  if (!isSupabaseConfigured()) {
    const current = await readFileSettings();
    await writeFileSettings({
      ...current,
      commentsModerationEnabled: enabled,
    });
    return;
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
    console.error("[comments] salvataggio moderazione fallita:", error.message);
    if (/relation .*site_settings/i.test(error.message)) {
      throw new Error(
        "Tabella site_settings assente. Applica la migration 20261109000004.",
      );
    }
    throw new Error("Impossibile salvare l'impostazione di moderazione.");
  }
}
