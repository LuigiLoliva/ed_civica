import { z } from "zod";

import { siteConfig } from "@/lib/site-config";

/** Validazioni base articolo (Zod). Usate dal form admin in Fase 3. */
export const articleAuthorSchema = z.object({
  firstName: z.string().trim().min(1, "Nome obbligatorio"),
  lastName: z.string().trim().min(1, "Cognome obbligatorio"),
});

export const articleSourceSchema = z.object({
  title: z.string().trim().min(1, "Titolo fonte obbligatorio"),
  url: z.string().url("URL non valido"),
  consultedAt: z.string().min(1, "Data di consultazione obbligatoria"),
});

export const articleImageMetaSchema = z.object({
  altText: z.string().trim().min(1, "Testo alternativo obbligatorio"),
  caption: z.string().trim().optional(),
  credit: z.string().trim().optional(),
  isCover: z.boolean().default(false),
});

export const articleFormSchema = z.object({
  title: z.string().trim().min(3, "Titolo troppo corto"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug non valido"),
  topicId: z.string().uuid("Seleziona un argomento"),
  excerpt: z
    .string()
    .trim()
    .min(1, "Riassunto obbligatorio")
    .max(
      siteConfig.limits.excerptMaxLength,
      `Massimo ${siteConfig.limits.excerptMaxLength} caratteri`,
    ),
  body: z.string().min(1, "Il corpo dell'articolo è obbligatorio"),
  authors: z
    .array(articleAuthorSchema)
    .min(1, "Almeno un autore obbligatorio"),
  sources: z
    .array(articleSourceSchema)
    .min(1, "Almeno una fonte obbligatoria"),
  images: z
    .array(articleImageMetaSchema)
    .max(
      siteConfig.limits.maxImagesPerArticle,
      `Massimo ${siteConfig.limits.maxImagesPerArticle} immagini`,
    ),
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;
