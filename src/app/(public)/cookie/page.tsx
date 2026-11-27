import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageShell } from "@/components/immersive/legal-page-shell";
import { LegalScroll, LegalSection } from "@/components/immersive/legal-scroll";
import { getSiteSettings } from "@/lib/site-settings/get-site-settings";
import { formatTeachers } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "Cookie Policy",
    description: `Informativa cookie di base del blog scolastico ${settings.siteName}. Testo da far validare alla scuola.`,
  };
}

/**
 * Testo base italiano per progetto scolastico.
 * NON è una consulenza legale: va validato da dirigente/docente referente / DPO scolastico.
 */
export default async function CookiePage() {
  const settings = await getSiteSettings();
  const teachers = formatTeachers(settings);

  return (
    <LegalPageShell
      scene="cookie"
      title="Cookie Policy"
      lead={
        <>
          {settings.siteName} utilizza un numero minimo di cookie e tecnologie
          simili, necessari al funzionamento del sito. Questo testo è una{" "}
          <strong>base da far validare</strong> alla scuola.
        </>
      }
    >
      <LegalScroll>
        <LegalSection id="cosa-sono" title="1. Cosa sono i cookie" index={0}>
          <p>
            I cookie sono piccoli file di testo memorizzati sul dispositivo
            dell&apos;utente. Possono essere strettamente necessari (tecnici) o
            usati per misurazione / profilazione. Questo progetto privilegia i
            soli cookie tecnici.
          </p>
        </LegalSection>

        <LegalSection id="cookie-usati" title="2. Cookie e storage utilizzati" index={1}>
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
        </LegalSection>

        <LegalSection id="non-usiamo" title="3. Cosa non usiamo (stato attuale)" index={2}>
          <p>
            Non sono attivi cookie di profilazione pubblicitaria né tool di
            remarketing. Eventuali analytics privacy-friendly (es. Vercel
            Analytics o Plausible) verranno documentati qui{" "}
            <em>prima</em> dell&apos;attivazione e, se necessario, gestiti con
            consenso secondo le indicazioni della scuola.
          </p>
        </LegalSection>

        <LegalSection id="gestione" title="4. Come gestirli" index={3}>
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
        </LegalSection>

        <LegalSection id="contatti" title="5. Contatti e aggiornamenti" index={4}>
          <p>
            Per domande: docente referente ({teachers}
            ). Ultimo aggiornamento bozza: novembre 2026.
          </p>
        </LegalSection>
      </LegalScroll>
    </LegalPageShell>
  );
}