import { describe, expect, it } from "vitest";

import { DEFAULT_SITE_SETTINGS } from "@/lib/site-settings/defaults";
import { normalizeSiteSettings } from "@/lib/site-settings/normalize";
import { sanitizeSiteHtml } from "@/lib/site-settings/sanitize-html";
import { rowToSiteSettings } from "@/lib/site-settings/map";
import type { SiteSettingsRow } from "@/types/database";

describe("sanitizeSiteHtml", () => {
  it("mantiene tag consentiti e toglie script", () => {
    const out = sanitizeSiteHtml(
      '<p>Ciao <strong>mondo</strong></p><script>alert(1)</script><img src=x onerror=alert(1)>',
    );
    expect(out).toContain("<p>");
    expect(out).toContain("<strong>");
    expect(out).not.toContain("<script");
    expect(out).not.toContain("<img");
  });

  it("accetta solo href sicuri", () => {
    const out = sanitizeSiteHtml(
      '<a href="https://example.com">ok</a><a href="javascript:alert(1)">no</a>',
    );
    expect(out).toContain('href="https://example.com"');
    expect(out).not.toContain("javascript:");
  });
});

describe("normalizeSiteSettings", () => {
  it("riempie teachers vuoti e logo undefined → null", () => {
    const out = normalizeSiteSettings({
      ...DEFAULT_SITE_SETTINGS,
      teachers: [],
      logoUrl: undefined as unknown as null,
      faviconUrl: undefined as unknown as null,
      socialLinks: undefined as unknown as SiteSettingsRow["social_links"],
    });
    expect(out.teachers.length).toBeGreaterThan(0);
    expect(out.logoUrl).toBeNull();
    expect(out.faviconUrl).toBeNull();
    expect(out.socialLinks.instagram).toBe("");
  });
});

describe("rowToSiteSettings edge cases", () => {
  it("teachers filtrati vuoti tornano al default", () => {
    const row = {
      id: 1,
      comments_moderation_enabled: true,
      teachers: [{ name: "", role: "" }],
      updated_at: new Date().toISOString(),
    } as unknown as SiteSettingsRow;
    const settings = rowToSiteSettings(row);
    expect(settings.teachers).toEqual(DEFAULT_SITE_SETTINGS.teachers);
    expect(settings.logoUrl).toBeNull();
    expect(settings.studentRegistrationEnabled).toBe(true);
  });
});
