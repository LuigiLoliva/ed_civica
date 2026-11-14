/**
 * Verifica Cloudflare Turnstile.
 * - Chiavi presenti → verifica verso siteverify
 * - Chiavi assenti → skip sicuro con rate-limit applicativo (scuola / Free Vercel)
 * - TURNSTILE_BYPASS=true consentito solo fuori produzione
 *
 * In produzione senza chiavi la registrazione e i commenti restano usabili:
 * non blocchiamo il flusso scolastico, ma loggiamo un avviso chiaro.
 */
export type TurnstileResult =
  | { ok: true; stub: boolean }
  | { ok: false; error: string; stub: boolean };

function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}

export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim() ?? "";
  const configured = secret.length > 0;
  const production = isProductionRuntime();

  if (!configured) {
    console.warn(
      production
        ? "[turnstile] TURNSTILE_SECRET_KEY assente in produzione: verifica saltata (rate-limit attivo). Imposta le chiavi Cloudflare su Vercel per l'anti-spam completo."
        : "[turnstile] Chiavi assenti: verifica anti-spam saltata in sviluppo.",
    );
    return { ok: true, stub: true };
  }

  if (!production && process.env.TURNSTILE_BYPASS === "true") {
    console.warn(
      "[turnstile] TURNSTILE_BYPASS=true: verifica saltata (solo sviluppo).",
    );
    return { ok: true, stub: true };
  }

  if (!token) {
    return {
      ok: false,
      error: "Completa la verifica anti-spam prima di inviare.",
      stub: false,
    };
  }

  try {
    const form = new URLSearchParams();
    form.set("secret", secret);
    form.set("response", token);
    if (remoteIp) form.set("remoteip", remoteIp);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: form },
    );
    const data = (await res.json()) as { success?: boolean };
    if (!data.success) {
      console.error("[turnstile] siteverify ha rifiutato il token");
      return {
        ok: false,
        error: "Verifica anti-spam non riuscita. Riprova.",
        stub: false,
      };
    }
    return { ok: true, stub: false };
  } catch (err) {
    console.error("[turnstile] errore di rete verso siteverify:", err);
    return {
      ok: false,
      error: "Servizio anti-spam temporaneamente non disponibile.",
      stub: false,
    };
  }
}
