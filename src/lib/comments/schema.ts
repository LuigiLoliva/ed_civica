import { z } from "zod";

export const createCommentSchema = z.object({
  /** UUID (Supabase) oppure slug mock/pubblico. */
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
    .min(2, "Il nome deve avere almeno 2 caratteri")
    .max(50, "Massimo 50 caratteri"),
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
    .min(2, "Il commento deve avere almeno 2 caratteri")
    .max(1000, "Massimo 1000 caratteri"),
  turnstileToken: z.string().optional().nullable(),
});

export const reportCommentSchema = z.object({
  commentId: z.string().uuid("Commento non valido"),
  reason: z
    .string()
    .trim()
    .min(3, "Descrivi brevemente il problema")
    .max(500, "Massimo 500 caratteri"),
});

export const moderateCommentSchema = z.object({
  commentId: z.string().uuid("Commento non valido"),
  action: z.enum(["approve", "reject", "delete"]),
});

export type CreateCommentValues = z.infer<typeof createCommentSchema>;
