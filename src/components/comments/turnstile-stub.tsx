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

/**
 * Widget Cloudflare Turnstile se la site key è presente.
 * Senza chiavi: nessun blocco UX — il server applica rate-limit.
 */
export function TurnstileStub({ onToken }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    if (!siteKey) {
      // Token stub: il server salta la verifica se SECRET assente.
      onTokenRef.current(`no-turnstile-${Date.now()}`);
      return;
    }

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
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => setScriptReady(true);
    document.head.appendChild(script);
  }, [siteKey]);

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
      className="rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground"
      role="status"
      aria-label="Protezione anti-spam"
    >
      <p className="font-medium text-foreground">Protezione anti-spam attiva</p>
      <p className="mt-1">
        Limite di invii per dispositivo. Per Cloudflare Turnstile imposta{" "}
        <code>NEXT_PUBLIC_TURNSTILE_SITE_KEY</code> e{" "}
        <code>TURNSTILE_SECRET_KEY</code> su Vercel.
      </p>
    </div>
  );
}
