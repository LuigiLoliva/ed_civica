"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "voci-unite-cookie-notice-dismissed";

/**
 * Avviso leggero sui cookie tecnici (nessun tracking).
 * Non è un CMP: solo informativa dismissibile.
 */
export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== "1") {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Informativa cookie"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 p-4 shadow-lg backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground text-pretty">
          Usiamo solo cookie tecnici necessari all&apos;autenticazione e al
          funzionamento del sito. Nessun tracciamento pubblicitario.{" "}
          <Link
            href="/cookie"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Cookie Policy
          </Link>
          {" · "}
          <Link
            href="/privacy"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Privacy
          </Link>
        </p>
        <Button type="button" size="sm" onClick={dismiss} className="shrink-0">
          Ho capito
        </Button>
      </div>
    </div>
  );
}
