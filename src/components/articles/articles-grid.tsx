"use client";

import Link from "next/link";

import { ArticleCard } from "@/components/articles/article-card";
import { Reveal } from "@/components/motion/reveal";
import type { MockArticle, MockTopic } from "@/lib/mock-data";

type ArticlesGridProps = {
  articles: MockArticle[];
  topicsBySlug: Record<string, MockTopic | undefined>;
  emptyFilterLabel?: string;
};

/**
 * Griglia articoli con Reveal foundation e empty state.
 */
export function ArticlesGrid({
  articles,
  topicsBySlug,
  emptyFilterLabel,
}: ArticlesGridProps) {
  if (articles.length === 0) {
    return (
      <Reveal className="mt-10 rounded-2xl border border-dashed border-border bg-card/80 p-8 text-center text-muted-foreground">
        <p>
          Nessun articolo per questo filtro.{" "}
          <Link href="/articoli" className="font-medium text-primary" data-cursor="link">
            Mostra tutti
          </Link>
          {emptyFilterLabel ? (
            <span className="sr-only"> Filtro: {emptyFilterLabel}</span>
          ) : null}
        </p>
      </Reveal>
    );
  }

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article, index) => (
        <ArticleCard
          key={article.slug}
          article={article}
          topic={topicsBySlug[article.topicSlug]}
          index={index}
        />
      ))}
    </div>
  );
}
