import type { Metadata } from "next";

import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Il progetto",
  description: "Descrizione del progetto scolastico Voci Unite.",
};

export default function ProgettoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Il progetto
      </h1>
      <p className="mt-4 text-muted-foreground">{siteConfig.description}</p>
      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="font-semibold">Scuola</dt>
          <dd className="text-muted-foreground">{siteConfig.school.name}</dd>
        </div>
        <div>
          <dt className="font-semibold">Classe</dt>
          <dd className="text-muted-foreground">{siteConfig.school.className}</dd>
        </div>
        <div>
          <dt className="font-semibold">Anno scolastico</dt>
          <dd className="text-muted-foreground">{siteConfig.school.year}</dd>
        </div>
        <div>
          <dt className="font-semibold">Docenti</dt>
          <dd className="text-muted-foreground">
            {siteConfig.school.teachers.join(", ")}
          </dd>
        </div>
      </dl>
      <p className="mt-8 rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
        Aggiorna i dati in <code>src/lib/site-config.ts</code> con i riferimenti
        reali della scuola.
      </p>
    </div>
  );
}
