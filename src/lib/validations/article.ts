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

/** Schema form editor Fase 3 (mock localStorage: topicId non ancora UUID) */
export const articleEditorImageSchema = z.object({
  id: z.string(),
  url: z.string().min(1, "Immagine richiesta"),
  altText: z.string().trim().min(1, "Testo alternativo obbligatorio"),
  caption: z.string(),
  credit: z.string(),
  isCover: z.boolean(),
});

export const articleEditorSourceSchema = articleSourceSchema.extend({
  id: z.string(),
});

export const articleEditorSchema = z
  .object({
    title: z.string().trim().min(3, "Titolo troppo corto"),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug non valido"),
    topicId: z.string().min(1, "Seleziona un argomento"),
    excerpt: z
      .string()
      .trim()
      .min(10, "Riassunto troppo corto")
      .max(
        siteConfig.limits.excerptMaxLength,
        `Massimo ${siteConfig.limits.excerptMaxLength} caratteri`,
      ),
    body: z
      .string()
      .min(1, "Il corpo dell'articolo è obbligatorio")
      .refine((html) => html.replace(/<[^>]*>/g, "").trim().length >= 20, {
        message: "Il corpo dell'articolo è troppo corto",
      }),
    authors: z
      .array(articleAuthorSchema)
      .min(1, "Almeno un autore obbligatorio"),
    sources: z
      .array(articleEditorSourceSchema)
      .min(1, "Almeno una fonte obbligatoria"),
    images: z
      .array(articleEditorImageSchema)
      .max(
        siteConfig.limits.maxImagesPerArticle,
        `Massimo ${siteConfig.limits.maxImagesPerArticle} immagini`,
      ),
    featured: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const covers = data.images.filter((i) => i.isCover);
    if (data.images.length > 0 && covers.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Designa un'immagine di copertina",
        path: ["images"],
      });
    }
    if (covers.length > 1) {
      ctx.addIssue({
        code: "custom",
        message: "Solo un'immagine può essere la copertina",
        path: ["images"],
      });
    }
  });

export type ArticleEditorValues = z.infer<typeof articleEditorSchema>;

export const MAX_IMAGES = siteConfig.limits.maxImagesPerArticle;
export const MAX_IMAGE_BYTES = siteConfig.limits.maxImageSizeMb * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = siteConfig.limits.allowedImageTypes;
