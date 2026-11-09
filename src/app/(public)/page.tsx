import Link from "next/link";

import { ArticleCard } from "@/components/articles/article-card";
import { AnimatedStat } from "@/components/home/animated-stat";
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
import {
  gamePreviews,
  getFeaturedArticles,
  getLatestArticles,
  getTopicBySlug,
  mockStats,
} from "@/lib/mock-data";
import { siteConfig } from "@/lib/site-config";

export default function HomePage() {
  const featured = getFeaturedArticles();
  const latest = getLatestArticles(3);

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
          <AnimatedStat label="Articoli pubblicati" value={mockStats.articles} />
          <AnimatedStat label="Autori" value={mockStats.authors} />
          <AnimatedStat label="Quiz disponibili" value={mockStats.quizzes} />
        </div>
        <p className="pb-8 text-center text-xs text-muted-foreground">
          Contatori da dati dimostrativi (mock). Verranno collegati a Supabase
          quando il progetto sarà configurato.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight">
              In evidenza
            </h2>
            <p className="mt-2 text-muted-foreground">
              Letture scelte dalla redazione scolastica.
            </p>
          </div>
          <Button
            render={<Link href="/articoli" />}
            variant="outline"
            className="hidden sm:inline-flex"
          >
            Tutti gli articoli
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((article) => (
            <ArticleCard
              key={article.slug}
              article={article}
              topic={getTopicBySlug(article.topicSlug)}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="font-heading text-3xl font-semibold tracking-tight">
          Ultimi articoli
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((article) => (
            <ArticleCard
              key={article.slug}
              article={article}
              topic={getTopicBySlug(article.topicSlug)}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="rounded-2xl border border-border bg-secondary/40 p-8 md:p-10">
          <h2 className="font-heading text-2xl font-semibold">Gioca e impara</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Mini-giochi e quiz sull&apos;ONU e sull&apos;Agenda 2030. La shell è
            pronta; i contenuti interattivi arriveranno con la Fase 5.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {gamePreviews.map((game) => (
              <Card key={game.slug} size="sm">
                <CardHeader>
                  <Badge variant="outline" className="w-fit">
                    {game.status === "coming-soon" ? "In arrivo" : "Disponibile"}
                  </Badge>
                  <CardTitle>{game.title}</CardTitle>
                  <CardDescription>{game.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button render={<Link href="/gioca" />}>Vai a Gioca e impara</Button>
            <Button render={<Link href="/progetto" />} variant="outline">
              Il progetto
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
