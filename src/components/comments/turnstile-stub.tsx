"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onToken: (token: string | null) => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

const SCRIPT_ID = "cf-turnstile-script";

/** Widget Cloudflare Turnstile (reale se site key presente, stub in sviluppo). */
export function TurnstileStub({ onToken }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!siteKey) return;

    if (window.turnstile) {
      setScriptReady(true);
      return;
    }

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => setScriptReady(true));
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => setScriptReady(true);
    document.head.appendChild(script);
  }, [siteKey]);

  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    if (!siteKey || !scriptReady || !containerRef.current || !window.turnstile) {
      return;
    }

    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token) => onTokenRef.current(token),
      "expired-callback": () => onTokenRef.current(null),
      "error-callback": () => onTokenRef.current(null),
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, scriptReady]);

  if (siteKey) {
    return (
      <div
        className="rounded-md border border-border bg-muted/30 p-3"
        role="group"
        aria-label="Verifica anti-spam"
      >
        <p className="mb-2 text-sm font-medium text-foreground">
          Protezione anti-spam
        </p>
        <div ref={containerRef} />
      </div>
    );
  }

  return (
    <div
      className="rounded-md border border-dashed border-primary/40 bg-muted/40 p-3 text-sm text-muted-foreground"
      role="group"
      aria-label="Verifica anti-spam"
    >
      <p className="mb-2 font-medium text-foreground">
        Protezione anti-spam (sviluppo)
      </p>
      <p>
        Nessuna chiave Turnstile configurata: in locale la verifica viene
        saltata dal server. Imposta{" "}
        <code>NEXT_PUBLIC_TURNSTILE_SITE_KEY</code> e{" "}
        <code>TURNSTILE_SECRET_KEY</code> in produzione.
      </p>
      <button
        type="button"
        className="mt-2 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={() => onToken(`stub-token-${Date.now()}`)}
      >
        Continua senza widget (dev)
      </button>
    </div>
  );
}
