import type { SiteSettings } from "./types";

/**
 * Valori predefiniti se la tabella non è ancora popolata / Supabase assente.
 * Allineati a `site-config.ts` e al seed SQL.
 */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "Voci Unite",
  tagline: "Blog scolastico su ONU e Agenda 2030",
  description:
    "Progetto di Educazione Civica dedicato all'Organizzazione delle Nazioni Unite e agli Obiettivi di Sviluppo Sostenibile 16 e 17.",
  schoolName: "Nome della scuola",
  schoolAddress: "",
  schoolCity: "",
  schoolProvince: "",
  className: "Classe",
  schoolYear: "2025/2026",
  teachers: [{ name: "Docente referente", role: "Referente di progetto" }],
  contactEmail: "",
  socialLinks: {
    instagram: "",
    schoolWebsite: "",
    facebook: "",
    youtube: "",
  },
  footerHtml:
    "<p>Progetto scolastico di Educazione Civica · Contenuti da verificare con i docenti</p>",
  projectHtml:
    "<p>Vogliamo trasformare lo studio dell'ONU in un laboratorio digitale: articoli con fonti, commenti moderati, quiz e giochi che aiutino a capire pace, giustizia e partnership.</p>",
  logoUrl: null,
  faviconUrl: null,
  commentsModerationEnabled: true,
  /** Default ON per uso scolastico: gli account restano pending fino all'approvazione. */
  studentRegistrationEnabled: true,
};

/** Tag Next.js cache per `getSiteSettings` / `revalidateTag`. */
export const SITE_SETTINGS_CACHE_TAG = "site-settings";
