import type { Metadata } from "next";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatSchoolLocation,
  formatTeachers,
  getSiteSettings,
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
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Il progetto
        </h1>
        <p className="mt-4 text-muted-foreground">{settings.description}</p>
      </header>

      <div className="mt-10 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Perché esiste</CardTitle>
          </CardHeader>
          <div
            className="prose prose-slate max-w-none px-4 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-6"
            dangerouslySetInnerHTML={{ __html: settings.projectHtml }}
          />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Scuola e classe</CardTitle>
          </CardHeader>
          <dl className="space-y-4 px-4 pb-4 text-sm sm:px-6">
            <div>
              <dt className="font-semibold">Scuola</dt>
              <dd className="text-muted-foreground">{settings.schoolName}</dd>
            </div>
            {location ? (
              <div>
                <dt className="font-semibold">Indirizzo</dt>
                <dd className="text-muted-foreground">{location}</dd>
              </div>
            ) : null}
            <div>
              <dt className="font-semibold">Classe</dt>
              <dd className="text-muted-foreground">{settings.className}</dd>
            </div>
            <div>
              <dt className="font-semibold">Anno scolastico</dt>
              <dd className="text-muted-foreground">{settings.schoolYear}</dd>
            </div>
            <div>
              <dt className="font-semibold">Docenti</dt>
              <dd className="text-muted-foreground">
                {formatTeachers(settings)}
              </dd>
            </div>
            {settings.contactEmail ? (
              <div>
                <dt className="font-semibold">Email</dt>
                <dd className="text-muted-foreground">
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
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-goal-16/30">
            <CardHeader>
              <CardTitle className="text-goal-16">Docenti (admin)</CardTitle>
              <CardDescription>
                Revisione contenuti, pubblicazione articoli, moderazione
                commenti, gestione utenti e quiz.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-goal-17/30">
            <CardHeader>
              <CardTitle className="text-goal-17">Studenti (editor)</CardTitle>
              <CardDescription>
                Scrivono bozze, aggiungono fonti e immagini, inviano gli articoli
                in revisione.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <p className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
          Aggiorna scuola, docenti e testi da{" "}
          <strong>Admin → Impostazioni</strong>. I testi dimostrativi degli
          articoli sono marcati come segnaposto e vanno verificati su fonti
          ufficiali.
        </p>
      </div>
    </div>
  );
}
