import type { Metadata } from "next";
import Link from "next/link";

import { ArticleCard } from "@/components/articles/article-card";
import { PageBanner } from "@/components/layout/page-banner";
import { Badge } from "@/components/ui/badge";
import { articles, getTopicBySlug, topics } from "@/lib/mock-data";
import { getSiteSettings } from "@/lib/site-settings/get-site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "Articoli",
    description: `Elenco degli articoli di ${settings.siteName} su ONU, Agenda 2030, Obiettivo 16 e Obiettivo 17.`,
  };
}

type ArticoliPageProps = {
  searchParams: Promise<{ argomento?: string }>;
};

export default async function ArticoliPage({ searchParams }: ArticoliPageProps) {
  const params = await searchParams;
  const selected = params.argomento;
  const filtered = selected
    ? articles.filter((article) => article.topicSlug === selected)
    : articles;
  const sorted = [...filtered].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );

  return (
    <div className="bg-partnership-pattern">
      <PageBanner
        title="Articoli"
        description="Approfondimenti della classe sull'ONU e sull'Agenda 2030. Filtra per argomento o apri la pagina dedicata di ciascun tema."
      >
        <div
          className="flex flex-wrap gap-2"
          role="list"
          aria-label="Filtri argomento"
        >
          <Badge
            variant={!selected ? "default" : "outline"}
            render={<Link href="/articoli" />}
            className="h-8 px-3"
          >
            Tutti
          </Badge>
          {topics.map((topic) => {
            const active = selected === topic.slug;
            return (
              <Badge
                key={topic.slug}
                variant={active ? "default" : "outline"}
                render={<Link href={`/articoli?argomento=${topic.slug}`} />}
                className="h-8 px-3"
              >
                {topic.name}
              </Badge>
            );
          })}
        </div>
      </PageBanner>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-sm text-muted-foreground">
          {sorted.length} articol{sorted.length === 1 ? "o" : "i"}
          {selected ? ` in “${getTopicBySlug(selected)?.name ?? selected}”` : ""}
        </p>

        {sorted.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((article) => (
              <ArticleCard
                key={article.slug}
                article={article}
                topic={getTopicBySlug(article.topicSlug)}
              />
            ))}
          </div>
        ) : (
          <p className="mt-10 rounded-2xl border border-dashed border-border bg-card/80 p-8 text-center text-muted-foreground">
            Nessun articolo per questo filtro.{" "}
            <Link href="/articoli" className="font-medium text-primary">
              Mostra tutti
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
