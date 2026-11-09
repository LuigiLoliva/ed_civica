import type { Metadata } from "next";
import Link from "next/link";

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
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header className="space-y-3">
        <p className="text-sm font-medium text-primary">Informativa · bozza scolastica</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-pretty">
          Questa pagina descrive in modo sintetico come {settings.siteName} tratta i
          dati personali. Il sito è un progetto didattico di Educazione Civica (
          {settings.schoolName}, {settings.className}, a.s.{" "}
          {settings.schoolYear}). Il testo è una <strong>base da far validare</strong>{" "}
          alla scuola prima della pubblicazione definitiva.
        </p>
      </header>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-2" aria-labelledby="titolare">
          <h2 id="titolare" className="font-heading text-xl font-semibold text-foreground">
            1. Titolare del trattamento
          </h2>
          <p>
            Il titolare è l&apos;istituzione scolastica indicato in{" "}
            <Link href="/progetto" className="text-primary underline-offset-2 hover:underline">
              Il progetto
            </Link>
            . Per richieste relative ai dati personali contattare il docente
            referente ({teachers}) o la segreteria
            scolastica / DPO secondo le procedure interne della scuola
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
        </section>

        <section className="space-y-2" aria-labelledby="finalita">
          <h2 id="finalita" className="font-heading text-xl font-semibold text-foreground">
            2. Dati raccolti e finalità
          </h2>
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
        </section>

        <section className="space-y-2" aria-labelledby="base">
          <h2 id="base" className="font-heading text-xl font-semibold text-foreground">
            3. Base giuridica e minori
          </h2>
          <p>
            Il trattamento è legato allo svolgimento di un progetto scolastico di
            Educazione Civica. Se vengono pubblicati nomi e cognomi di studenti
            minorenni (autori degli articoli), la scuola valuta e acquisisce gli
            eventuali consensi / autorizzazioni previsti dalle procedure interne.
          </p>
        </section>

        <section className="space-y-2" aria-labelledby="conservazione">
          <h2
            id="conservazione"
            className="font-heading text-xl font-semibold text-foreground"
          >
            4. Conservazione e fornitori
          </h2>
          <p>
            I dati sono conservati per il tempo necessario al progetto e alle
            esigenze scolastiche. L&apos;hosting dell&apos;applicazione può avvenire
            su Vercel; il database, autenticazione e storage immagini su Supabase.
            Eventuali strumenti di analytics privacy-friendly (es. Vercel Analytics
            o Plausible) saranno attivati solo dopo valutazione della scuola e
            aggiornamento di questa informativa.
          </p>
        </section>

        <section className="space-y-2" aria-labelledby="diritti">
          <h2 id="diritti" className="font-heading text-xl font-semibold text-foreground">
            5. Diritti degli interessati
          </h2>
          <p>
            Gli interessati possono chiedere accesso, rettifica, cancellazione o
            limitazione del trattamento secondo la normativa applicabile (GDPR /
            Codice Privacy), rivolgendosi al referente scolastico indicato sopra.
          </p>
        </section>

        <section className="space-y-2" aria-labelledby="cookie-ref">
          <h2
            id="cookie-ref"
            className="font-heading text-xl font-semibold text-foreground"
          >
            6. Cookie
          </h2>
          <p>
            Per i cookie e tecnologie simili si veda la{" "}
            <Link href="/cookie" className="text-primary underline-offset-2 hover:underline">
              Cookie Policy
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2" aria-labelledby="aggiornamenti">
          <h2
            id="aggiornamenti"
            className="font-heading text-xl font-semibold text-foreground"
          >
            7. Aggiornamenti
          </h2>
          <p>
            Questa informativa può essere aggiornata in caso di modifiche al sito
            o alle indicazioni della scuola. Ultimo aggiornamento bozza: novembre
            2026.
          </p>
        </section>
      </div>
    </article>
  );
}
