import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageShell } from "@/components/immersive/legal-page-shell";
import { LegalScroll, LegalSection } from "@/components/immersive/legal-scroll";
import { getSiteSettings } from "@/lib/site-settings/get-site-settings";
import { formatTeachers } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "Privacy Policy",
    description: `Informativa privacy di base del blog scolastico ${settings.siteName}. Testo da far validare alla scuola.`,
  };
}

/**
 * Testo base italiano per progetto scolastico.
 * NON è una consulenza legale: va validato da dirigente/docente referente / DPO scolastico.
 */
export default async function PrivacyPage() {
  const settings = await getSiteSettings();
  const teachers = formatTeachers(settings);

  return (
    <LegalPageShell
      scene="privacy"
      title="Privacy Policy"
      lead={
        <>
          Questa pagina descrive in modo sintetico come {settings.siteName} tratta i
          dati personali. Il sito è un progetto didattico di Educazione Civica (
          {settings.schoolName}, {settings.className}, a.s. {settings.schoolYear}
          ). Il testo è una <strong>base da far validare</strong> alla scuola prima
          della pubblicazione definitiva.
        </>
      }
    >
      <LegalScroll>
        <LegalSection id="titolare" title="1. Titolare del trattamento" index={0}>
          <p>
            Il titolare è l&apos;istituzione scolastica indicato in{" "}
            <Link href="/progetto" className="text-primary underline-offset-2 hover:underline">
              Il progetto
            </Link>
            . Per richieste relative ai dati personali contattare il docente
            referente ({teachers}) o la segreteria scolastica / DPO secondo le
            procedure interne della scuola
            {settings.contactEmail ? (
              <>
                {" "}
                (
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {settings.contactEmail}
                </a>
                )
              </>
            ) : null}
            .
          </p>
        </LegalSection>

        <LegalSection id="finalita" title="2. Dati raccolti e finalità" index={1}>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Account docenti e studenti:</strong>{" "}
              email, nome visualizzato e ruolo (admin/studente) per autenticazione,
              attribuzione degli articoli e gestione del pannello redazionale.
            </li>
            <li>
              <strong className="text-foreground">Commenti pubblici:</strong> nickname
              obbligatorio e testo del commento; email opzionale, usata solo per
              eventuali contatti di moderazione e <em>mai</em> mostrata
              pubblicamente.
            </li>
            <li>
              <strong className="text-foreground">Dati tecnici minimi:</strong>{" "}
              identificatori di sessione per l&apos;area riservata; eventuali hash
              IP (non in chiaro) per rate limiting anti-spam sui commenti.
            </li>
            <li>
              Non vengono raccolti dati di profilazione pubblicitaria né tracking
              invasivo di terzi.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="base" title="3. Base giuridica e minori" index={2}>
          <p>
            Il trattamento è legato allo svolgimento di un progetto scolastico di
            Educazione Civica. Se vengono pubblicati nomi e cognomi di studenti
            minorenni (autori degli articoli), la scuola valuta e acquisisce gli
            eventuali consensi / autorizzazioni previsti dalle procedure interne.
          </p>
        </LegalSection>

        <LegalSection id="conservazione" title="4. Conservazione e fornitori" index={3}>
          <p>
            I dati sono conservati per il tempo necessario al progetto e alle
            esigenze scolastiche. L&apos;hosting dell&apos;applicazione può avvenire
            su Vercel; il database, autenticazione e storage immagini su Supabase.
            Eventuali strumenti di analytics privacy-friendly (es. Vercel Analytics
            o Plausible) saranno attivati solo dopo valutazione della scuola e
            aggiornamento di questa informativa.
          </p>
        </LegalSection>

        <LegalSection id="diritti" title="5. Diritti degli interessati" index={4}>
          <p>
            Gli interessati possono chiedere accesso, rettifica, cancellazione o
            limitazione del trattamento secondo la normativa applicabile (GDPR /
            Codice Privacy), rivolgendosi al referente scolastico indicato sopra.
          </p>
        </LegalSection>

        <LegalSection id="cookie-ref" title="6. Cookie" index={5}>
          <p>
            Per i cookie e tecnologie simili si veda la{" "}
            <Link href="/cookie" className="text-primary underline-offset-2 hover:underline">
              Cookie Policy
            </Link>
            .
          </p>
        </LegalSection>

        <LegalSection id="aggiornamenti" title="7. Aggiornamenti" index={6}>
          <p>
            Questa informativa può essere aggiornata in caso di modifiche al sito
            o alle indicazioni della scuola. Ultimo aggiornamento bozza: novembre
            2026.
          </p>
        </LegalSection>
      </LegalScroll>
    </LegalPageShell>
  );
}