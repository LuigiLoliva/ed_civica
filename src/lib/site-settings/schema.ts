import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || /^https?:\/\//i.test(v),
    "Inserisci un URL completo (https://…) oppure lascia vuoto",
  );

const optionalEmail = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || z.email().safeParse(v).success,
    "Indirizzo email non valido",
  );

export const teacherSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Il nome del docente deve avere almeno 2 caratteri")
    .max(80, "Massimo 80 caratteri"),
  role: z
    .string()
    .trim()
    .min(2, "Il ruolo deve avere almeno 2 caratteri")
    .max(80, "Massimo 80 caratteri"),
});

export const siteSettingsSchema = z.object({
  siteName: z
    .string()
    .trim()
    .min(2, "Il nome del sito deve avere almeno 2 caratteri")
    .max(80, "Massimo 80 caratteri"),
  tagline: z
    .string()
    .trim()
    .min(2, "Lo slogan deve avere almeno 2 caratteri")
    .max(160, "Massimo 160 caratteri"),
  description: z
    .string()
    .trim()
    .min(10, "La descrizione deve avere almeno 10 caratteri")
    .max(500, "Massimo 500 caratteri"),
  schoolName: z
    .string()
    .trim()
    .min(2, "Il nome della scuola è obbligatorio")
    .max(160, "Massimo 160 caratteri"),
  schoolAddress: z.string().trim().max(200, "Massimo 200 caratteri"),
  schoolCity: z.string().trim().max(80, "Massimo 80 caratteri"),
  schoolProvince: z.string().trim().max(40, "Massimo 40 caratteri"),
  className: z
    .string()
    .trim()
    .min(1, "Indica la classe/sezione")
    .max(40, "Massimo 40 caratteri"),
  schoolYear: z
    .string()
    .trim()
    .min(4, "Indica l'anno scolastico")
    .max(20, "Massimo 20 caratteri"),
  teachers: z
    .array(teacherSchema)
    .min(1, "Aggiungi almeno un docente referente")
    .max(10, "Massimo 10 docenti"),
  contactEmail: optionalEmail,
  socialLinks: z.object({
    instagram: optionalUrl,
    schoolWebsite: optionalUrl,
    facebook: optionalUrl,
    youtube: optionalUrl,
  }),
  footerHtml: z
    .string()
    .min(1, "Il testo del footer è obbligatorio")
    .max(5000, "Footer troppo lungo"),
  projectHtml: z
    .string()
    .min(1, "Il testo della pagina Il progetto è obbligatorio")
    .max(20000, "Testo del progetto troppo lungo"),
  logoUrl: z.string().nullable(),
  faviconUrl: z.string().nullable(),
  commentsModerationEnabled: z.boolean(),
  studentRegistrationEnabled: z.boolean(),
});

export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;
