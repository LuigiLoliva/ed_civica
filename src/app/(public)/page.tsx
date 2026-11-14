import Link from "next/link";

import { ArticleCard } from "@/components/articles/article-card";
import { AnimatedStat } from "@/components/home/animated-stat";
import { HeroBackdrop } from "@/components/home/hero-backdrop";
import {
  NetworkIcon,
  ScalesIcon,
} from "@/components/icons/onu-motifs";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { games } from "@/data/games";
import { quizzes } from "@/data/quizzes";
import {
  getFeaturedArticles,
  getLatestArticles,
  getTopicBySlug,
  mockStats,
} from "@/lib/mock-data";
import { siteConfig } from "@/lib/site-config";
import { getSiteSettings } from "@/lib/site-settings/get-site-settings";

export default async function HomePage() {
  const settings = await getSiteSettings();
  const featured = getFeaturedArticles();
  const latest = getLatestArticles(3);
  const gameTeasers = games.slice(0, 4);

  return (
    <div>
      {/* Hero: un solo compositio — brand, supporto, CTA, piano visivo */}
      <section className="bg-hero-ocean relative isolate overflow-hidden text-hero-foreground">
        <HeroBackdrop />
        <div className="relative mx-auto flex min-h-[min(88svh,44rem)] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:justify-center lg:pb-24 lg:pt-32">
          <p className="animate-hero-rise font-heading text-[clamp(2.75rem,9vw,5.75rem)] font-semibold leading-[0.95] tracking-tight text-balance">
            {settings.siteName}
          </p>
          <p className="animate-hero-rise-delay-1 mt-5 max-w-xl text-lg text-white/80 text-pretty sm:text-xl">
            {settings.tagline ||
              "Voci della scuola su ONU, pace, giustizia e partnership."}
            {" — "}Obiettivi{" "}
            <span className="font-semibold text-sky-200">16</span> e{" "}
            <span className="font-semibold text-sky-100">17</span> dell&apos;Agenda
            2030.
          </p>
          <div className="animate-hero-rise-delay-2 mt-8 flex flex-wrap gap-3">
            <Button
              render={<Link href="/articoli" />}
              size="lg"
              className="bg-white text-hero hover:bg-white/90"
            >
              Leggi gli articoli
            </Button>
            <Button
              render={<Link href="/gioca" />}
              size="lg"
              variant="outline"
              className="border-white/35 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              Metti alla prova le tue conoscenze
            </Button>
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent"
          aria-hidden
        />
      </section>

      <div className="bg-partnership-pattern">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <Reveal>
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Due Obiettivi, un impegno comune
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
              Pace, giustizia, istituzioni solide e partnership globale: i Goal 16 e
              17 dell&apos;Agenda 2030 delle Nazioni Unite.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <Reveal delay={0.08}>
              <article className="group relative overflow-hidden rounded-2xl bg-goal-16 px-6 py-8 text-white sm:px-8 sm:py-10">
                <ScalesIcon className="absolute -right-4 -top-2 size-36 text-white/10 transition-transform duration-500 group-hover:scale-105" />
                <p className="text-sm font-semibold tracking-[0.18em] uppercase text-white/70">
                  Obiettivo 16
                </p>
                <h3 className="font-heading mt-3 text-2xl font-semibold sm:text-3xl">
                  {siteConfig.goals[16].title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
                  Promuovere società pacifiche e inclusive, accesso alla giustizia e
                  istituzioni efficaci, responsabili e trasparenti.
                </p>
                <Link
                  href="/argomenti/obiettivo-16"
                  className="mt-6 inline-flex text-sm font-semibold text-white underline-offset-4 hover:underline"
                >
                  Scopri di più
                </Link>
              </article>
            </Reveal>

            <Reveal delay={0.16}>
              <article className="group relative overflow-hidden rounded-2xl bg-goal-17 px-6 py-8 text-white sm:px-8 sm:py-10">
                <NetworkIcon className="absolute -right-4 -top-2 size-36 text-white/10 transition-transform duration-500 group-hover:scale-105" />
                <p className="text-sm font-semibold tracking-[0.18em] uppercase text-white/70">
                  Obiettivo 17
                </p>
                <h3 className="font-heading mt-3 text-2xl font-semibold sm:text-3xl">
                  {siteConfig.goals[17].title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
                  Rafforzare i mezzi di attuazione e rivitalizzare la partnership
                  globale per lo sviluppo sostenibile.
                </p>
                <Link
                  href="/argomenti/obiettivo-17"
                  className="mt-6 inline-flex text-sm font-semibold text-white underline-offset-4 hover:underline"
                >
                  Scopri di più
                </Link>
              </article>
            </Reveal>
          </div>
        </section>

        <section className="border-y border-border/70 bg-card/70 backdrop-blur-sm">
          <Reveal className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-3 sm:px-6">
            <AnimatedStat label="Articoli pubblicati" value={mockStats.articles} />
            <AnimatedStat label="Autori" value={mockStats.authors} />
            <AnimatedStat label="Quiz disponibili" value={quizzes.length} />
          </Reveal>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <Reveal className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
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
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((article, index) => (
              <Reveal key={article.slug} delay={0.06 * index}>
                <ArticleCard
                  article={article}
                  topic={getTopicBySlug(article.topicSlug)}
                />
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <Reveal>
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Ultimi articoli
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((article, index) => (
              <Reveal key={article.slug} delay={0.06 * index}>
                <ArticleCard
                  article={article}
                  topic={getTopicBySlug(article.topicSlug)}
                />
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-hero px-6 py-10 text-hero-foreground sm:px-10 sm:py-12">
              <div
                className="pointer-events-none absolute -right-10 top-0 size-56 rounded-full bg-primary/25 blur-2xl"
                aria-hidden
              />
              <h2 className="font-heading relative text-2xl font-semibold sm:text-3xl">
                Gioca e impara
              </h2>
              <p className="relative mt-3 max-w-2xl text-white/75 text-pretty">
                Mini-giochi e quiz sull&apos;ONU e sull&apos;Agenda 2030 — contenuti seed
                da revisionare con i docenti.
              </p>
              <ul className="relative mt-8 grid gap-4 sm:grid-cols-2">
                {gameTeasers.map((game) => (
                  <li key={game.slug}>
                    <Link
                      href={`/gioca/giochi/${game.slug}`}
                      className="block rounded-xl border border-white/15 bg-white/5 px-4 py-4 transition hover:bg-white/10"
                    >
                      <p className="text-xs font-medium tracking-wide text-primary uppercase">
                        {game.badge} · ~{game.estimatedMinutes} min
                      </p>
                      <p className="mt-1 font-heading text-lg">{game.title}</p>
                      <p className="mt-1 text-sm text-white/65">{game.description}</p>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="relative mt-8 flex flex-wrap gap-3">
                <Button
                  render={<Link href="/gioca" />}
                  className="bg-white text-hero hover:bg-white/90"
                >
                  Vai a Gioca e impara
                </Button>
                <Button
                  render={<Link href="/progetto" />}
                  variant="outline"
                  className="border-white/35 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  Il progetto
                </Button>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );
}
