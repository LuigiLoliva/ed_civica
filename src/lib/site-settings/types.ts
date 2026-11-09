import type { SiteSocialLinks, SiteTeacher } from "@/types/database";

/** Forma applicativa (camelCase) delle impostazioni del sito. */
export interface SiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  schoolName: string;
  schoolAddress: string;
  schoolCity: string;
  schoolProvince: string;
  className: string;
  schoolYear: string;
  teachers: SiteTeacher[];
  contactEmail: string;
  socialLinks: SiteSocialLinks;
  footerHtml: string;
  projectHtml: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  commentsModerationEnabled: boolean;
  studentRegistrationEnabled: boolean;
}

export type { SiteSocialLinks, SiteTeacher };
