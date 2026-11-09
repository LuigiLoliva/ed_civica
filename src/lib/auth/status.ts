import type { ProfileStatus } from "@/types/database";

const STATUSES: ProfileStatus[] = [
  "pending",
  "active",
  "rejected",
  "suspended",
];

export function normalizeProfileStatus(
  status: unknown,
): ProfileStatus | null {
  if (typeof status !== "string") return null;
  const normalized = status.trim().toLowerCase();
  return STATUSES.includes(normalized as ProfileStatus)
    ? (normalized as ProfileStatus)
    : null;
}

/** Account operativo (può usare /admin e scrivere contenuti). */
export function isActiveStatus(status: unknown): boolean {
  return normalizeProfileStatus(status) === "active";
}

export function loginBlockedMessage(status: ProfileStatus | null): string {
  switch (status) {
    case "pending":
      return "Registrazione ricevuta: un docente deve ancora approvare il tuo account. Riceverai una mail quando sarà attivo.";
    case "rejected":
      return "La tua richiesta di registrazione è stata rifiutata. Contatta un docente se pensi sia un errore.";
    case "suspended":
      return "Il tuo account è sospeso. Contatta un docente referente.";
    case null:
      return "Account non disponibile. Contatta un docente.";
    default:
      return "Accesso non consentito con lo stato attuale dell'account.";
  }
}

export function profileStatusLabel(status: ProfileStatus): string {
  switch (status) {
    case "pending":
      return "In attesa";
    case "active":
      return "Attivo";
    case "rejected":
      return "Rifiutato";
    case "suspended":
      return "Sospeso";
  }
}
