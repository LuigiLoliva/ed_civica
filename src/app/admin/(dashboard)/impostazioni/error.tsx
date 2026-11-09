"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ImpostazioniError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin/impostazioni]", error);
  }, [error]);

  return (
    <div className="space-y-4 rounded-lg border border-destructive/30 bg-card p-6">
      <h1 className="font-heading text-2xl font-semibold">
        Impostazioni non disponibili
      </h1>
      <p className="max-w-xl text-muted-foreground">
        Si è verificato un errore nel caricamento della pagina. Riprova; se il
        problema continua, verifica le migrazioni SQL di{" "}
        <code className="rounded bg-muted px-1">site_settings</code> e la chiave{" "}
        <code className="rounded bg-muted px-1">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
        su Vercel.
      </p>
      {error.digest ? (
        <p className="text-xs text-muted-foreground">Digest: {error.digest}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={reset}>
          Riprova
        </Button>
        <Button render={<Link href="/admin" />} variant="outline">
          Torna all&apos;admin
        </Button>
      </div>
    </div>
  );
}
