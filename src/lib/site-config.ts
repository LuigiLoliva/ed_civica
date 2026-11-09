/**
 * Configurazione statica del sito (nav, colori, limiti).
 * Nome scuola, slogan, footer, logo, moderazione, ecc. si modificano da
 * Admin → Impostazioni (`getSiteSettings()`), non da questo file.
 */
export const siteConfig = {
  /** Fallback sincrono (metadata statici / test); preferire getSiteSettings(). */
  name: "Voci Unite",
  tagline: "Blog scolastico su ONU e Agenda 2030",
  description:
    "Progetto di Educazione Civica dedicato all'Organizzazione delle Nazioni Unite e agli Obiettivi di Sviluppo Sostenibile 16 e 17.",
  locale: "it-IT",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  goals: {
    16: {
      number: 16,
      title: "Pace, giustizia e istituzioni solide",
      color: "#00689D",
      slug: "obiettivo-16",
    },
    17: {
      number: 17,
      title: "Partnership per gli obiettivi",
      color: "#19486A",
      slug: "obiettivo-17",
    },
  },

  /** Colori istituzionali (allineati ai CSS tokens) */
  colors: {
    onu: "#009EDB",
    goal16: "#00689D",
    goal17: "#19486A",
  },

  nav: [
    { href: "/", label: "Home" },
    { href: "/articoli", label: "Articoli" },
    { href: "/gioca", label: "Gioca e impara" },
    { href: "/progetto", label: "Il progetto" },
  ],

  footerLinks: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/cookie", label: "Cookie Policy" },
    { href: "https://www.un.org/", label: "Nazioni Unite", external: true },
    { href: "https://sdgs.un.org/", label: "Agenda 2030", external: true },
  ],

  /**
   * Fallback sincrono se `site_settings` non è ancora migrata.
   * Fonte di verità: Admin → Impostazioni (`commentsModerationEnabled`).
   */
  commentsRequireApproval: true,

  /** Limiti editoriali */
  limits: {
    maxImagesPerArticle: 4,
    maxImageSizeMb: 3,
    allowedImageTypes: ["image/jpeg", "image/png", "image/webp"] as const,
    excerptMaxLength: 200,
  },
} as const;

export type SiteConfig = typeof siteConfig;
