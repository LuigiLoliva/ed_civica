import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/articles/article-card";
import { TopicPageChrome } from "@/components/immersive/topic-page-chrome";
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
    <TopicPageChrome
      name={topic.name}
      description={topic.description}
      color={topic.color}
    >
      {topicArticles.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topicArticles.map((article, index) => (
            <ArticleCard
              key={article.slug}
              article={article}
              topic={topic}
              index={index}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border bg-card/80 p-8 text-muted-foreground">
          Nessun articolo pubblicato per questo argomento (mock).
        </p>
      )}
    </TopicPageChrome>
  );
}