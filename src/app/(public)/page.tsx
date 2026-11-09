import Link from "next/link";

import {
  GlobeIcon,
  NetworkIcon,
  OliveBranchIcon,
  ScalesIcon,
} from "@/components/icons/onu-motifs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/lib/site-config";

export default function HomePage() {
  return (
    <div className="bg-partnership-pattern">
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-24">
        <div className="space-y-6">
          <Badge variant="secondary" className="gap-2">
            <OliveBranchIcon className="size-4 text-primary" />
            Educazione Civica · Agenda 2030
          </Badge>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {siteConfig.name}
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground text-pretty">
            Esploriamo l&apos;ONU e gli Obiettivi di Sviluppo Sostenibile{" "}
            <span className="font-medium text-goal-16">16</span> e{" "}
            <span className="font-medium text-goal-17">17</span>: pace,
            giustizia, istituzioni solide e partnership per gli obiettivi.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button render={<Link href="/articoli" />} size="lg">
              Leggi gli articoli
            </Button>
            <Button render={<Link href="/gioca" />} size="lg" variant="outline">
              Metti alla prova le tue conoscenze
            </Button>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-md">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-goal-16/15 to-goal-17/25" />
          <div className="absolute inset-8 flex items-center justify-center rounded-full border border-primary/20 bg-card/80 shadow-sm backdrop-blur-sm">
            <GlobeIcon className="size-40 text-primary" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <h2 className="font-heading text-3xl font-semibold tracking-tight">
            Due Obiettivi, un impegno comune
          </h2>
          <p className="mt-2 text-muted-foreground">
            Approfondiamo i Goal 16 e 17 dell&apos;Agenda 2030 delle Nazioni
            Unite.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-goal-16/30 transition-transform hover:-translate-y-1">
            <CardHeader>
              <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-goal-16/10 text-goal-16">
                <ScalesIcon className="size-7" />
              </div>
              <CardTitle className="font-heading">
                Obiettivo 16 · {siteConfig.goals[16].title}
              </CardTitle>
              <CardDescription>
                Promuovere società pacifiche e inclusive, accesso alla giustizia
                e istituzioni efficaci, responsabili e trasparenti.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                render={<Link href="/argomenti/obiettivo-16" />}
                variant="secondary"
              >
                Scopri di più
              </Button>
            </CardContent>
          </Card>

          <Card className="border-goal-17/30 transition-transform hover:-translate-y-1">
            <CardHeader>
              <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-goal-17/10 text-goal-17">
                <NetworkIcon className="size-7" />
              </div>
              <CardTitle className="font-heading">
                Obiettivo 17 · {siteConfig.goals[17].title}
              </CardTitle>
              <CardDescription>
                Rafforzare i mezzi di attuazione e rivitalizzare la partnership
                globale per lo sviluppo sostenibile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                render={<Link href="/argomenti/obiettivo-17" />}
                variant="secondary"
              >
                Scopri di più
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-y border-border bg-card/60">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-3 sm:px-6">
          {[
            { label: "Articoli pubblicati", value: "—" },
            { label: "Autori", value: "—" },
            { label: "Quiz disponibili", value: "—" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-heading text-4xl font-semibold text-primary">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="pb-8 text-center text-xs text-muted-foreground">
          I contatori si attiveranno dopo la connessione a Supabase e il
          popolamento dei contenuti.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-border bg-secondary/40 p-8 md:p-10">
          <h2 className="font-heading text-2xl font-semibold">Prossimi passi</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Questa è la fondazione del sito: design system, struttura delle
            pagine e schema database. Gli articoli, i commenti, i quiz e i
            giochi arriveranno nelle fasi successive.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button render={<Link href="/progetto" />}>Il progetto</Button>
            <Button render={<Link href="/auth/login" />} variant="outline">
              Accedi all&apos;area riservata
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
