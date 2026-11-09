"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { getCurrentProfile, isAdmin, isSupabaseConfigured } from "@/lib/auth/roles";
import {
  SITE_SETTINGS_CACHE_TAG,
  siteSettingsSchema,
  settingsToRow,
  type SiteSettings,
  type SiteSettingsFormValues,
} from "@/lib/site-settings";
import { normalizeSiteSettings } from "@/lib/site-settings/normalize";
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
  return normalizeSiteSettings({
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
  });
}

function humanizeDbError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("student_registration_enabled") ||
    lower.includes("site_name") ||
    lower.includes("column") ||
    lower.includes("schema cache")
  ) {
    return "Mancano colonne su site_settings. Esegui le migrazioni SQL (site_settings_expand e successive) su Supabase.";
  }
  if (lower.includes("bucket") || lower.includes("not found")) {
    return "Risorsa Storage mancante. Verifica il bucket site-assets nella migrazione site_settings_expand.";
  }
  if (lower.includes("row-level security") || lower.includes("rls")) {
    return "Permesso negato (RLS). Serve un admin attivo oppure SUPABASE_SERVICE_ROLE_KEY sul server.";
  }
  return "Impossibile salvare le impostazioni. Riprova o controlla i log del server.";
}

async function upsertSiteSettingsRow(
  settings: SiteSettings,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const payload = {
    id: 1,
    ...settingsToRow(settings),
  };

  const service = createServiceClient();
  if (service) {
    const { error } = await service.from("site_settings").upsert(payload, {
      onConflict: "id",
    });
    if (!error) return { ok: true };
    console.error("[site-settings] salvataggio service-role fallito:", error.message);
    // Fallback sotto: sessione admin + policy RLS
  } else {
    console.warn(
      "[site-settings] SUPABASE_SERVICE_ROLE_KEY assente: uso client autenticato (RLS admin).",
    );
  }

  // Client tipizzato a mano: cast del payload (come service client untyped).
  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert(
    payload as never,
    { onConflict: "id" },
  );

  if (error) {
    console.error("[site-settings] salvataggio autenticato fallito:", error.message);
    return { ok: false, message: humanizeDbError(error.message) };
  }

  return { ok: true };
}

function revalidateSiteSettingsPaths() {
  revalidateTag(SITE_SETTINGS_CACHE_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/progetto");
  revalidatePath("/privacy");
  revalidatePath("/cookie");
  revalidatePath("/registrati");
  revalidatePath("/auth/login");
  revalidatePath("/admin/impostazioni");
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

  let settings: SiteSettings;
  try {
    settings = normalizeForm(parsed.data);
  } catch (err) {
    console.error("[site-settings] sanitizzazione HTML fallita:", err);
    return {
      ok: false,
      message:
        "Impossibile elaborare i testi HTML (footer / progetto). Controlla la formattazione e riprova.",
    };
  }

  if (!isSupabaseConfigured()) {
    // Import dinamico: evita di caricare `fs` / `server-only` al GET della pagina.
    const { writeFileSettings } = await import("@/lib/site-settings/file-store");
    await writeFileSettings(settings);
    revalidateSiteSettingsPaths();
    return {
      ok: true,
      message: "Impostazioni salvate in locale (demo senza Supabase).",
      settings,
    };
  }

  const saved = await upsertSiteSettingsRow(settings);
  if (!saved.ok) return saved;

  revalidateSiteSettingsPaths();

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

  const ext =
    file.type === "image/svg+xml"
      ? "svg"
      : file.type === "image/webp"
        ? "webp"
        : "png";
  const path = `${kind}/${Date.now()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const uploadOpts = {
    contentType: file.type,
    upsert: true,
  };

  const service = createServiceClient();
  if (service) {
    const { error: uploadError } = await service.storage
      .from("site-assets")
      .upload(path, bytes, uploadOpts);

    if (!uploadError) {
      const { data } = service.storage.from("site-assets").getPublicUrl(path);
      return {
        ok: true,
        url: data.publicUrl,
        message: "File caricato.",
      };
    }

    console.error("[site-settings] upload service-role fallito:", uploadError.message);
    if (
      uploadError.message.toLowerCase().includes("bucket") ||
      uploadError.message.toLowerCase().includes("not found")
    ) {
      return {
        ok: false,
        message:
          "Bucket site-assets assente. Esegui la migrazione site_settings_expand su Supabase.",
      };
    }
  }

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from("site-assets")
    .upload(path, bytes, uploadOpts);

  if (uploadError) {
    console.error("[site-settings] upload autenticato fallito:", uploadError.message);
    return {
      ok: false,
      message: humanizeDbError(uploadError.message),
    };
  }

  const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
  return {
    ok: true,
    url: data.publicUrl,
    message: "File caricato.",
  };
}
