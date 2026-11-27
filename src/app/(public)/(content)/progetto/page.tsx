import type { Metadata } from "next";

import { PageBanner } from "@/components/layout/page-banner";
import { getSiteSettings } from "@/lib/site-settings/get-site-settings";
import {
  formatSchoolLocation,
  formatTeachers,
} from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "Il progetto",
    description: `Chi siamo: il progetto scolastico ${settings.siteName} su ONU e Agenda 2030 (Obiettivi 16 e 17).`,
  };
}

export default async function ProgettoPage() {
  const settings = await getSiteSettings();
  const location = formatSchoolLocation(settings);

  return (
    <div className="bg-partnership-pattern">
      <PageBanner title="Il progetto" description={settings.description} />

      <div className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6">
        <section>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Perché esiste
          </h2>
          <div
            className="prose prose-slate mt-4 max-w-none text-sm leading-relaxed text-muted-foreground sm:text-base"
            dangerouslySetInnerHTML={{ __html: settings.projectHtml }}
          />
        </section>

        <section className="rounded-2xl border border-border/80 bg-card/90 px-5 py-6 sm:px-7">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Scuola e classe
          </h2>
          <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-foreground">Scuola</dt>
              <dd className="mt-1 text-muted-foreground">{settings.schoolName}</dd>
            </div>
            {location ? (
              <div>
                <dt className="font-semibold text-foreground">Indirizzo</dt>
                <dd className="mt-1 text-muted-foreground">{location}</dd>
              </div>
            ) : null}
            <div>
              <dt className="font-semibold text-foreground">Classe</dt>
              <dd className="mt-1 text-muted-foreground">{settings.className}</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Anno scolastico</dt>
              <dd className="mt-1 text-muted-foreground">{settings.schoolYear}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-semibold text-foreground">Docenti</dt>
              <dd className="mt-1 text-muted-foreground">
                {formatTeachers(settings)}
              </dd>
            </div>
            {settings.contactEmail ? (
              <div className="sm:col-span-2">
                <dt className="font-semibold text-foreground">Email</dt>
                <dd className="mt-1 text-muted-foreground">
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {settings.contactEmail}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-goal-16 px-5 py-6 text-white">
            <h3 className="font-heading text-lg font-semibold">Docenti (admin)</h3>
            <p className="mt-2 text-sm text-white/80">
              Revisione contenuti, pubblicazione articoli, moderazione commenti,
              gestione utenti e quiz.
            </p>
          </div>
          <div className="rounded-2xl bg-goal-17 px-5 py-6 text-white">
            <h3 className="font-heading text-lg font-semibold">Studenti (editor)</h3>
            <p className="mt-2 text-sm text-white/80">
              Scrivono bozze, aggiungono fonti e immagini, inviano gli articoli in
              revisione.
            </p>
          </div>
        </section>

        <p className="rounded-xl border border-border/80 bg-card/70 px-4 py-3 text-sm text-muted-foreground">
          Aggiorna scuola, docenti e testi da{" "}
          <strong className="text-foreground">Admin → Impostazioni</strong>. I testi
          dimostrativi degli articoli sono marcati come segnaposto e vanno
          verificati su fonti ufficiali.
        </p>
      </div>
    </div>
  );
}
