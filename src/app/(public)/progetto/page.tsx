import type { Metadata } from "next";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Il progetto",
  description:
    "Chi siamo: il progetto scolastico Voci Unite su ONU e Agenda 2030 (Obiettivi 16 e 17).",
};

export default function ProgettoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Il progetto
        </h1>
        <p className="mt-4 text-muted-foreground">{siteConfig.description}</p>
      </header>

      <div className="mt-10 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Perché esiste</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Vogliamo trasformare lo studio dell&apos;ONU in un laboratorio
              digitale: articoli con fonti, commenti moderati, quiz e giochi che
              aiutino a capire pace, giustizia e partnership.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Scuola e classe</CardTitle>
          </CardHeader>
          <dl className="space-y-4 px-4 pb-4 text-sm sm:px-6">
            <div>
              <dt className="font-semibold">Scuola</dt>
              <dd className="text-muted-foreground">{siteConfig.school.name}</dd>
            </div>
            <div>
              <dt className="font-semibold">Classe</dt>
              <dd className="text-muted-foreground">
                {siteConfig.school.className}
              </dd>
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
          Aggiorna i dati in <code>src/lib/site-config.ts</code> con i riferimenti
          reali della scuola. I testi dimostrativi degli articoli sono marcati
          come segnaposto e vanno verificati su fonti ufficiali.
        </p>
      </div>
    </div>
  );
}
