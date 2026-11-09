/**
 * Verifica Cloudflare Turnstile.
 * - Chiavi presenti → verifica verso siteverify
 * - Chiavi assenti in sviluppo → skip + console.warn
 * - Chiavi assenti in produzione → obbligatoria (errore utente)
 * - TURNSTILE_BYPASS=true consentito solo fuori produzione
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

export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim() ?? "";
  const configured = secret.length > 0;
  const production = isProductionRuntime();

  if (!configured) {
    if (production) {
      console.error(
        "[turnstile] TURNSTILE_SECRET_KEY mancante: in produzione la verifica è obbligatoria.",
      );
      return {
        ok: false,
        error:
          "La verifica anti-spam non è disponibile al momento. Riprova più tardi.",
        stub: false,
      };
    }
    console.warn(
      "[turnstile] Chiavi assenti: verifica anti-spam saltata in sviluppo.",
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
