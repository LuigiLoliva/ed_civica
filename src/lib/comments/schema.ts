import { z } from "zod";

export const createCommentSchema = z.object({
  /** UUID (Supabase) oppure slug mock Fase 2. */
  articleId: z
    .string()
    .trim()
    .min(1, "Articolo non valido")
    .max(120, "Articolo non valido"),
  parentId: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .nullable()
    .optional(),
  authorName: z
    .string()
    .trim()
    .min(1, "Inserisci un nome o nickname")
    .max(80, "Massimo 80 caratteri"),
  authorEmail: z
    .string()
    .trim()
    .max(254)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null))
    .refine((v) => v === null || z.string().email().safeParse(v).success, {
      message: "Email non valida",
    }),
  body: z
    .string()
    .trim()
    .min(1, "Scrivi un commento")
    .max(2000, "Massimo 2000 caratteri"),
  turnstileToken: z.string().optional().nullable(),
});

export const reportCommentSchema = z.object({
  commentId: z.string().uuid(),
  reason: z
    .string()
    .trim()
    .min(3, "Descrivi brevemente il problema")
    .max(500, "Massimo 500 caratteri"),
});

export const moderateCommentSchema = z.object({
  commentId: z.string().uuid(),
  action: z.enum(["approve", "reject", "delete"]),
});

export type CreateCommentValues = z.infer<typeof createCommentSchema>;
