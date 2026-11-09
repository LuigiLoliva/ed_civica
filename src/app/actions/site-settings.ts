"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { getCurrentProfile, isAdmin, isSupabaseConfigured } from "@/lib/auth/roles";
import { writeFileSettings } from "@/lib/site-settings/file-store";
import {
  SITE_SETTINGS_CACHE_TAG,
  siteSettingsSchema,
  settingsToRow,
  type SiteSettings,
  type SiteSettingsFormValues,
} from "@/lib/site-settings";

import { sanitizeSiteHtml } from "@/lib/site-settings/sanitize-html";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type SiteSettingsActionResult =
  | { ok: true; message: string; settings: SiteSettings }
  | { ok: false; message: string };

async function assertAdminOrDemo(): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: true };
  }
  const profile = await getCurrentProfile();
  if (!isAdmin(profile)) {
    return {
      ok: false,
      message: "Solo gli admin possono modificare le impostazioni del sito.",
    };
  }
  return { ok: true };
}

function normalizeForm(values: SiteSettingsFormValues): SiteSettings {
  return {
    ...values,
    contactEmail: values.contactEmail.trim(),
    footerHtml: sanitizeSiteHtml(values.footerHtml),
    projectHtml: sanitizeSiteHtml(values.projectHtml),
    socialLinks: {
      instagram: values.socialLinks.instagram?.trim() || "",
      schoolWebsite: values.socialLinks.schoolWebsite?.trim() || "",
      facebook: values.socialLinks.facebook?.trim() || "",
      youtube: values.socialLinks.youtube?.trim() || "",
    },
    logoUrl: values.logoUrl || null,
    faviconUrl: values.faviconUrl || null,
  };
}

export async function saveSiteSettingsAction(
  raw: unknown,
): Promise<SiteSettingsActionResult> {
  const gate = await assertAdminOrDemo();
  if (!gate.ok) return gate;

  const parsed = siteSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dati non validi",
    };
  }

  const settings = normalizeForm(parsed.data);

  if (!isSupabaseConfigured()) {
    await writeFileSettings(settings);
    revalidateTag(SITE_SETTINGS_CACHE_TAG);
    revalidatePath("/", "layout");
    revalidatePath("/admin/impostazioni");
    return {
      ok: true,
      message: "Impostazioni salvate in locale (demo senza Supabase).",
      settings,
    };
  }

  // Service client (untyped): schema manuale non allineato a GenericSchema.
  const supabase = createServiceClient();
  if (!supabase) {
    return {
      ok: false,
      message:
        "Service role Supabase non disponibile. Imposta SUPABASE_SERVICE_ROLE_KEY.",
    };
  }
  const row = settingsToRow(settings);
  const { error } = await supabase.from("site_settings").upsert(
    {
      id: 1,
      ...row,
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("[site-settings] salvataggio fallito:", error.message);
    return {
      ok: false,
      message:
        "Impossibile salvare le impostazioni. Verifica di essere admin e che la migrazione sia applicata.",
    };
  }

  revalidateTag(SITE_SETTINGS_CACHE_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/progetto");
  revalidatePath("/privacy");
  revalidatePath("/cookie");
  revalidatePath("/admin/impostazioni");

  return {
    ok: true,
    message: "Impostazioni salvate correttamente.",
    settings,
  };
}

const ALLOWED_ASSET_TYPES = new Set([
  "image/png",
  "image/svg+xml",
  "image/webp",
]);
const MAX_ASSET_BYTES = 1024 * 1024; // 1 MB

export type UploadSiteAssetResult =
  | { ok: true; url: string; message: string }
  | { ok: false; message: string };

export async function uploadSiteAssetAction(
  formData: FormData,
): Promise<UploadSiteAssetResult> {
  const gate = await assertAdminOrDemo();
  if (!gate.ok) return gate;

  const kind = String(formData.get("kind") ?? "");
  if (kind !== "logo" && kind !== "favicon") {
    return { ok: false, message: "Tipo file non valido." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Seleziona un file da caricare." };
  }

  if (!ALLOWED_ASSET_TYPES.has(file.type)) {
    return {
      ok: false,
      message: "Formato non supportato. Usa PNG, SVG o WebP.",
    };
  }

  if (file.size > MAX_ASSET_BYTES) {
    return {
      ok: false,
      message: "Il file supera 1 MB. Riduci le dimensioni e riprova.",
    };
  }

  if (!isSupabaseConfigured()) {
    // Demo: data URL (non persistito in Storage)
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    return {
      ok: true,
      url: dataUrl,
      message: "Anteprima locale (senza Storage Supabase).",
    };
  }

  const supabase = await createClient();
  const ext =
    file.type === "image/svg+xml"
      ? "svg"
      : file.type === "image/webp"
        ? "webp"
        : "png";
  const path = `${kind}/${Date.now()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("site-assets")
    .upload(path, bytes, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("[site-settings] upload fallito:", uploadError.message);
    return {
      ok: false,
      message:
        "Upload non riuscito. Verifica di essere admin e che il bucket site-assets esista.",
    };
  }

  const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
  return {
    ok: true,
    url: data.publicUrl,
    message: "File caricato.",
  };
}
