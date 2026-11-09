import type { Metadata } from "next";

import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 prose-sm">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Privacy Policy
      </h1>
      <p className="mt-4 text-muted-foreground">
        Testo base da far validare alla scuola. {siteConfig.name} raccoglie il
        minimo di dati personali necessari al funzionamento del blog scolastico.
      </p>
      <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>
          Account docenti/studenti: email e nome per autenticazione e
          attribuzione degli articoli.
        </li>
        <li>
          Commenti: nickname obbligatorio; email opzionale, mai mostrata
          pubblicamente.
        </li>
        <li>Nessun tracciamento pubblicitario invasivo.</li>
      </ul>
      <p className="mt-6 text-sm text-muted-foreground">
        Contattare il docente referente per richieste relative ai dati
        personali.
      </p>
    </div>
  );
}
