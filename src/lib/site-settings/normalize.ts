import { DEFAULT_SITE_SETTINGS } from "./defaults";
import type { SiteSettings } from "./types";

/**
 * Garantisce un oggetto plain JSON-serializzabile per Client Components.
 * Evita `undefined` su logo/favicon e teachers vuoti che fanno fallire Zod/RHF.
 */
export function normalizeSiteSettings(
  input: Partial<SiteSettings> | null | undefined,
): SiteSettings {
  const base = { ...DEFAULT_SITE_SETTINGS, ...(input ?? {}) };

  const teachers =
    Array.isArray(base.teachers) && base.teachers.length > 0
      ? base.teachers
          .map((t) => ({
            name: typeof t?.name === "string" ? t.name.trim() : "",
            role:
              typeof t?.role === "string" && t.role.trim()
                ? t.role.trim()
                : "Docente",
          }))
          .filter((t) => t.name.length > 0)
      : [];

  const social = base.socialLinks ?? DEFAULT_SITE_SETTINGS.socialLinks;

  return {
    siteName: base.siteName || DEFAULT_SITE_SETTINGS.siteName,
    tagline: base.tagline || DEFAULT_SITE_SETTINGS.tagline,
    description: base.description || DEFAULT_SITE_SETTINGS.description,
    schoolName: base.schoolName || DEFAULT_SITE_SETTINGS.schoolName,
    schoolAddress: base.schoolAddress ?? "",
    schoolCity: base.schoolCity ?? "",
    schoolProvince: base.schoolProvince ?? "",
    className: base.className || DEFAULT_SITE_SETTINGS.className,
    schoolYear: base.schoolYear || DEFAULT_SITE_SETTINGS.schoolYear,
    teachers: teachers.length > 0 ? teachers : DEFAULT_SITE_SETTINGS.teachers,
    contactEmail: base.contactEmail ?? "",
    socialLinks: {
      instagram: social.instagram ?? "",
      schoolWebsite: social.schoolWebsite ?? "",
      facebook: social.facebook ?? "",
      youtube: social.youtube ?? "",
    },
    footerHtml: base.footerHtml || DEFAULT_SITE_SETTINGS.footerHtml,
    projectHtml: base.projectHtml || DEFAULT_SITE_SETTINGS.projectHtml,
    logoUrl: base.logoUrl ?? null,
    faviconUrl: base.faviconUrl ?? null,
    commentsModerationEnabled: Boolean(base.commentsModerationEnabled),
    studentRegistrationEnabled: Boolean(
      base.studentRegistrationEnabled ??
        DEFAULT_SITE_SETTINGS.studentRegistrationEnabled,
    ),
  };
}
