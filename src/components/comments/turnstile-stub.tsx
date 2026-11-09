"use client";

type Props = {
  onToken: (token: string) => void;
};

/** Stub widget Cloudflare Turnstile per sviluppo / CI. */
export function TurnstileStub({ onToken }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;

  return (
    <div
      className="rounded-md border border-dashed border-primary/40 bg-muted/40 p-3 text-sm text-muted-foreground"
      role="group"
      aria-label="Verifica anti-spam"
    >
      <p className="mb-2 font-medium text-foreground">
        Protezione anti-spam (Turnstile)
      </p>
      {siteKey ? (
        <p>
          Widget Cloudflare da collegare (site key presente). Per ora usa il
          pulsante di verifica stub.
        </p>
      ) : (
        <p>
          Modalità stub attiva: nessuna chiave Turnstile configurata. Imposta{" "}
          <code>NEXT_PUBLIC_TURNSTILE_SITE_KEY</code> in produzione.
        </p>
      )}
      <button
        type="button"
        className="mt-2 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={() => onToken(`stub-token-${Date.now()}`)}
      >
        Verifica (stub)
      </button>
    </div>
  );
}
