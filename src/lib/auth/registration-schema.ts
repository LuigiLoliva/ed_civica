import { z } from "zod";

export const registrationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "Il nome deve avere almeno 2 caratteri")
    .max(50, "Il nome è troppo lungo"),
  lastName: z
    .string()
    .trim()
    .min(2, "Il cognome deve avere almeno 2 caratteri")
    .max(50, "Il cognome è troppo lungo"),
  email: z.string().trim().email("Email non valida").max(120),
  password: z
    .string()
    .min(8, "La password deve avere almeno 8 caratteri")
    .max(72, "La password è troppo lunga"),
  className: z
    .string()
    .trim()
    .max(40, "Classe troppo lunga")
    .optional()
    .or(z.literal("")),
  privacyAccepted: z.boolean().refine((v) => v === true, {
    message: "Devi confermare di aver letto l'informativa privacy",
  }),
  turnstileToken: z.string().optional().nullable(),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

/** Indicatore di robustezza password (0–4) per UI. */
export function passwordStrength(password: string): {
  score: number;
  label: string;
} {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

  const labels = ["Molto debole", "Debole", "Discreta", "Buona", "Forte"];
  return { score, label: labels[score] ?? "Molto debole" };
}

/** Forza ruolo studente: ignora qualsiasi tentativo client di passare role=admin. */
export function forcedStudentRole(clientRole: unknown): "studente" {
  void clientRole;
  return "studente";
}
