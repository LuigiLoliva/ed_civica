import type { SiteSettingsRow, SiteSocialLinks, SiteTeacher } from "@/types/database";

import { DEFAULT_SITE_SETTINGS } from "./defaults";
import type { SiteSettings } from "./types";

function asTeachers(value: unknown): SiteTeacher[] {
  if (!Array.isArray(value) || value.length === 0) {
    return DEFAULT_SITE_SETTINGS.teachers;
  }
  const teachers = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const name = typeof row.name === "string" ? row.name.trim() : "";
      const role = typeof row.role === "string" ? row.role.trim() : "";
      if (!name) return null;
      return { name, role: role || "Docente" };
    })
    .filter((t): t is SiteTeacher => Boolean(t));
  return teachers.length > 0 ? teachers : DEFAULT_SITE_SETTINGS.teachers;
}

function asSocialLinks(value: unknown): SiteSocialLinks {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_SITE_SETTINGS.socialLinks };
  }
  const row = value as Record<string, unknown>;
  return {
    instagram: typeof row.instagram === "string" ? row.instagram : "",
    schoolWebsite:
      typeof row.schoolWebsite === "string" ? row.schoolWebsite : "",
    facebook: typeof row.facebook === "string" ? row.facebook : "",
    youtube: typeof row.youtube === "string" ? row.youtube : "",
  };
}

export function rowToSiteSettings(row: SiteSettingsRow): SiteSettings {
  return {
    siteName: row.site_name || DEFAULT_SITE_SETTINGS.siteName,
    tagline: row.tagline || DEFAULT_SITE_SETTINGS.tagline,
    description: row.description || DEFAULT_SITE_SETTINGS.description,
    schoolName: row.school_name || DEFAULT_SITE_SETTINGS.schoolName,
    schoolAddress: row.school_address ?? "",
    schoolCity: row.school_city ?? "",
    schoolProvince: row.school_province ?? "",
    className: row.class_name || DEFAULT_SITE_SETTINGS.className,
    schoolYear: row.school_year || DEFAULT_SITE_SETTINGS.schoolYear,
    teachers: asTeachers(row.teachers),
    contactEmail: row.contact_email ?? "",
    socialLinks: asSocialLinks(row.social_links),
    footerHtml: row.footer_html || DEFAULT_SITE_SETTINGS.footerHtml,
    projectHtml: row.project_html || DEFAULT_SITE_SETTINGS.projectHtml,
    logoUrl: row.logo_url ?? null,
    faviconUrl: row.favicon_url ?? null,
    commentsModerationEnabled: Boolean(row.comments_moderation_enabled),
    studentRegistrationEnabled:
      row.student_registration_enabled == null
        ? DEFAULT_SITE_SETTINGS.studentRegistrationEnabled
        : Boolean(row.student_registration_enabled),
  };
}

export function settingsToRow(
  settings: SiteSettings,
): Omit<SiteSettingsRow, "id" | "created_at" | "updated_at"> {
  return {
    site_name: settings.siteName,
    tagline: settings.tagline,
    description: settings.description,
    school_name: settings.schoolName,
    school_address: settings.schoolAddress,
    school_city: settings.schoolCity,
    school_province: settings.schoolProvince,
    class_name: settings.className,
    school_year: settings.schoolYear,
    teachers: settings.teachers,
    contact_email: settings.contactEmail || null,
    social_links: {
      instagram: settings.socialLinks.instagram || undefined,
      schoolWebsite: settings.socialLinks.schoolWebsite || undefined,
      facebook: settings.socialLinks.facebook || undefined,
      youtube: settings.socialLinks.youtube || undefined,
    },
    footer_html: settings.footerHtml,
    project_html: settings.projectHtml,
    logo_url: settings.logoUrl,
    favicon_url: settings.faviconUrl,
    comments_moderation_enabled: settings.commentsModerationEnabled,
    student_registration_enabled: settings.studentRegistrationEnabled,
  };
}

/** Indirizzo scuola formattato per footer / privacy. */
export function formatSchoolLocation(settings: SiteSettings): string {
  const cityProv = [settings.schoolCity, settings.schoolProvince]
    .filter(Boolean)
    .join(settings.schoolCity && settings.schoolProvince ? " · " : "");
  return [settings.schoolAddress, cityProv].filter(Boolean).join(", ");
}

export function formatTeachers(settings: SiteSettings): string {
  return settings.teachers
    .map((t) => (t.role ? `${t.name} (${t.role})` : t.name))
    .join(", ");
}
