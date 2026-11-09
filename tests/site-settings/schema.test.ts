import { describe, expect, it } from "vitest";

import { DEFAULT_SITE_SETTINGS } from "@/lib/site-settings/defaults";
import {
  formatSchoolLocation,
  formatTeachers,
  rowToSiteSettings,
} from "@/lib/site-settings/map";
import { siteSettingsSchema } from "@/lib/site-settings/schema";
import type { SiteSettingsRow } from "@/types/database";

describe("siteSettingsSchema", () => {
  it("accetta i valori predefiniti", () => {
    const parsed = siteSettingsSchema.safeParse(DEFAULT_SITE_SETTINGS);
    expect(parsed.success).toBe(true);
  });

  it("registrazione studenti attiva di default (uso scolastico)", () => {
    expect(DEFAULT_SITE_SETTINGS.studentRegistrationEnabled).toBe(true);
  });

  it("rifiuta nome sito troppo corto", () => {
    const parsed = siteSettingsSchema.safeParse({
      ...DEFAULT_SITE_SETTINGS,
      siteName: "A",
    });
    expect(parsed.success).toBe(false);
  });

  it("rifiuta URL social non validi", () => {
    const parsed = siteSettingsSchema.safeParse({
      ...DEFAULT_SITE_SETTINGS,
      socialLinks: {
        ...DEFAULT_SITE_SETTINGS.socialLinks,
        instagram: "instagram.com/senza-schema",
      },
    });
    expect(parsed.success).toBe(false);
  });

  it("accetta social vuoti", () => {
    const parsed = siteSettingsSchema.safeParse({
      ...DEFAULT_SITE_SETTINGS,
      socialLinks: {
        instagram: "",
        schoolWebsite: "",
        facebook: "",
        youtube: "",
      },
    });
    expect(parsed.success).toBe(true);
  });
});

describe("rowToSiteSettings", () => {
  it("mappa la riga DB e gestisce campi mancanti con default", () => {
    const partial = {
      id: 1,
      comments_moderation_enabled: false,
      updated_at: new Date().toISOString(),
    } as unknown as SiteSettingsRow;

    const settings = rowToSiteSettings(partial);
    expect(settings.commentsModerationEnabled).toBe(false);
    expect(settings.siteName).toBe(DEFAULT_SITE_SETTINGS.siteName);
    expect(settings.teachers.length).toBeGreaterThan(0);
  });
});

describe("format helpers", () => {
  it("formatta docenti e indirizzo", () => {
    expect(
      formatTeachers({
        ...DEFAULT_SITE_SETTINGS,
        teachers: [{ name: "Maria Rossi", role: "Referente" }],
      }),
    ).toBe("Maria Rossi (Referente)");

    expect(
      formatSchoolLocation({
        ...DEFAULT_SITE_SETTINGS,
        schoolAddress: "Via Roma 1",
        schoolCity: "Bari",
        schoolProvince: "BA",
      }),
    ).toBe("Via Roma 1, Bari · BA");
  });
});
