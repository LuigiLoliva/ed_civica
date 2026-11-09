/**
 * Stub Cloudflare Turnstile.
 * Con TURNSTILE_SECRET_KEY impostata, verifica verso siteverify.
 */
export type TurnstileResult =
  | { ok: true; stub: boolean }
  | { ok: false; error: string; stub: boolean };

export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const bypass =
    process.env.TURNSTILE_BYPASS === "true" || !secret || secret.length === 0;

  if (bypass) {
    void remoteIp;
    return { ok: true, stub: true };
  }

  if (!token) {
    return { ok: false, error: "Completa la verifica anti-spam.", stub: false };
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
      return {
        ok: false,
        error: "Verifica anti-spam non riuscita.",
        stub: false,
      };
    }
    return { ok: true, stub: false };
  } catch {
    return {
      ok: false,
      error: "Servizio anti-spam temporaneamente non disponibile.",
      stub: false,
    };
  }
}
