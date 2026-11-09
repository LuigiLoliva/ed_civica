import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/articles/article-card";
import { Button } from "@/components/ui/button";
import {
  getArticlesByTopic,
  getTopicBySlug,
  topics,
} from "@/lib/mock-data";

type TopicPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return topics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) return { title: "Argomento non trovato" };

  return {
    title: topic.name,
    description: topic.description,
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  const topicArticles = getArticlesByTopic(topic.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Argomento
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {topic.name}
        </h1>
        <span
          className="mt-5 inline-block h-2 w-16 rounded-full"
          style={{ backgroundColor: topic.color }}
          aria-hidden
        />
        <p className="mt-5 text-muted-foreground">{topic.description}</p>
        <Button
          render={<Link href="/articoli" />}
          variant="outline"
          className="mt-6"
        >
          Torna a tutti gli articoli
        </Button>
      </header>

      <section className="mt-12">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Articoli su questo argomento
        </h2>
        {topicArticles.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topicArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} topic={topic} />
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-dashed border-border bg-card p-8 text-muted-foreground">
            Nessun articolo pubblicato per questo argomento (mock).
          </p>
        )}
      </section>
    </div>
  );
}
