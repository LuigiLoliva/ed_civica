import type { Metadata } from "next";

import { ArticlesGrid } from "@/components/articles/articles-grid";
import { ArticlesListingBanner } from "@/components/articles/articles-listing-banner";
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

  const topicsBySlug = Object.fromEntries(
    topics.map((topic) => [topic.slug, topic]),
  );

  const filterName = selected
    ? (getTopicBySlug(selected)?.name ?? selected)
    : undefined;

  return (
    <div className="bg-partnership-pattern">
      <ArticlesListingBanner topics={topics} selected={selected} />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {sorted.length} articol{sorted.length === 1 ? "o" : "i"}
          {filterName ? ` in “${filterName}”` : ""}
        </p>

        <ArticlesGrid
          articles={sorted}
          topicsBySlug={topicsBySlug}
          emptyFilterLabel={filterName}
        />
      </div>
    </div>
  );
}
