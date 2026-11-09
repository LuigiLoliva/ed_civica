import "server-only";

import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

import {
  createServiceClient,
  isSupabaseConfigured,
} from "@/lib/supabase/service";
import type { Database, SiteSettingsRow } from "@/types/database";

import { DEFAULT_SITE_SETTINGS, SITE_SETTINGS_CACHE_TAG } from "./defaults";
import { normalizeSiteSettings } from "./normalize";
import { rowToSiteSettings } from "./map";
import type { SiteSettings } from "./types";

function createAnonReadClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function readFileSettingsSafe(): Promise<SiteSettings> {
  try {
    const { readFileSettings } = await import("./file-store");
    return normalizeSiteSettings(await readFileSettings());
  } catch (err) {
    console.error("[site-settings] lettura file store fallita:", err);
    return { ...DEFAULT_SITE_SETTINGS };
  }
}

async function fetchSiteSettingsUncached(): Promise<SiteSettings> {
  try {
    if (!isSupabaseConfigured()) {
      return readFileSettingsSafe();
    }

    const supabase = createServiceClient() ?? createAnonReadClient();
    if (!supabase) {
      return readFileSettingsSafe();
    }

    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("[site-settings] lettura fallita:", error.message);
      return { ...DEFAULT_SITE_SETTINGS };
    }

    if (!data) {
      return { ...DEFAULT_SITE_SETTINGS };
    }

    return normalizeSiteSettings(rowToSiteSettings(data as SiteSettingsRow));
  } catch (err) {
    console.error("[site-settings] lettura eccezione:", err);
    return { ...DEFAULT_SITE_SETTINGS };
  }
}

/**
 * Impostazioni del sito con cache Next.js.
 * Dopo un salvataggio admin chiamare `revalidateTag(SITE_SETTINGS_CACHE_TAG)`.
 */
export const getSiteSettings = unstable_cache(
  fetchSiteSettingsUncached,
  ["site-settings"],
  { tags: [SITE_SETTINGS_CACHE_TAG], revalidate: 60 },
);

/** Lettura senza cache (form admin). */
export async function getSiteSettingsFresh(): Promise<SiteSettings> {
  return fetchSiteSettingsUncached();
}
