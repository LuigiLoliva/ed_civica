import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Informativa cookie di base del blog scolastico Voci Unite. Testo da far validare alla scuola.",
};

/**
 * Testo base italiano per progetto scolastico.
 * NON è una consulenza legale: va validato da dirigente/docente referente / DPO scolastico.
 */
export default function CookiePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header className="space-y-3">
        <p className="text-sm font-medium text-primary">Informativa · bozza scolastica</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Cookie Policy
        </h1>
        <p className="text-muted-foreground text-pretty">
          {siteConfig.name} utilizza un numero minimo di cookie e tecnologie
          simili, necessari al funzionamento del sito. Questo testo è una{" "}
          <strong>base da far validare</strong> alla scuola.
        </p>
      </header>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-2" aria-labelledby="cosa-sono">
          <h2
            id="cosa-sono"
            className="font-heading text-xl font-semibold text-foreground"
          >
            1. Cosa sono i cookie
          </h2>
          <p>
            I cookie sono piccoli file di testo memorizzati sul dispositivo
            dell&apos;utente. Possono essere strettamente necessari (tecnici) o
            usati per misurazione / profilazione. Questo progetto privilegia i
            soli cookie tecnici.
          </p>
        </section>

        <section className="space-y-2" aria-labelledby="cookie-usati">
          <h2
            id="cookie-usati"
            className="font-heading text-xl font-semibold text-foreground"
          >
            2. Cookie e storage utilizzati
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Sessione autenticazione</strong>{" "}
              (area riservata docenti/studenti via Supabase Auth): cookie o
              storage tecnico necessari al login e alla protezione di{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">/admin</code>
              .
            </li>
            <li>
              <strong className="text-foreground">Preferenza avviso cookie</strong>
              : memorizzazione locale (localStorage) dell&apos;avvenuto
              riconoscimento dell&apos;informativa, senza profilazione.
            </li>
            <li>
              <strong className="text-foreground">Anti-spam commenti</strong>{" "}
              (Cloudflare Turnstile, se configurato): può impostare cookie di
              sicurezza del fornitore solo per verificare che l&apos;utente non
              sia un bot.
            </li>
          </ul>
        </section>

        <section className="space-y-2" aria-labelledby="non-usiamo">
          <h2
            id="non-usiamo"
            className="font-heading text-xl font-semibold text-foreground"
          >
            3. Cosa non usiamo (stato attuale)
          </h2>
          <p>
            Non sono attivi cookie di profilazione pubblicitaria né tool di
            remarketing. Eventuali analytics privacy-friendly (es. Vercel
            Analytics o Plausible) verranno documentati qui{" "}
            <em>prima</em> dell&apos;attivazione e, se necessario, gestiti con
            consenso secondo le indicazioni della scuola.
          </p>
        </section>

        <section className="space-y-2" aria-labelledby="gestione">
          <h2
            id="gestione"
            className="font-heading text-xl font-semibold text-foreground"
          >
            4. Come gestirli
          </h2>
          <p>
            I cookie tecnici sono necessari al funzionamento dell&apos;area
            riservata. È comunque possibile eliminarli o bloccarli dalle
            impostazioni del browser; in tal caso alcune funzioni (login)
            potrebbero non essere disponibili. Per la privacy in generale si veda
            la{" "}
            <Link href="/privacy" className="text-primary underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2" aria-labelledby="contatti">
          <h2
            id="contatti"
            className="font-heading text-xl font-semibold text-foreground"
          >
            5. Contatti e aggiornamenti
          </h2>
          <p>
            Per domande: docente referente ({siteConfig.school.teachers.join(", ")}
            ). Ultimo aggiornamento bozza: novembre 2026.
          </p>
        </section>
      </div>
    </article>
  );
}
