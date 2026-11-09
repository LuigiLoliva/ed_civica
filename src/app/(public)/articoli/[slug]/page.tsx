import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/articles/article-card";
import { CommentsSection } from "@/components/comments/comments-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listApprovedComments } from "@/lib/comments/store";
import { authorFullName, formatDateIt } from "@/lib/format";
import {
  articles,
  getArticleBySlug,
  getRelatedArticles,
  getTopicBySlug,
} from "@/lib/mock-data";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Articolo non trovato" };

  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      publishedTime: article.publishedAt,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const topic = getTopicBySlug(article.topicSlug);
  const related = getRelatedArticles(article);
  // Chiave commenti: slug mock finché non arrivano UUID da Supabase.
  const comments = await listApprovedComments(article.slug);

  return (
    <article className="pb-16">
      <header className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          {topic ? (
            <Badge
              variant="secondary"
              render={<Link href={`/argomenti/${topic.slug}`} />}
            >
              {topic.name}
            </Badge>
          ) : null}
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{article.summary}</p>
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span>{article.authors.map(authorFullName).join(", ")}</span>
            <time dateTime={article.publishedAt}>
              {formatDateIt(article.publishedAt)}
            </time>
            <span>{article.readingMinutes} min di lettura</span>
          </div>
        </div>
      </header>

      <div
        className={`h-36 bg-gradient-to-br ${article.coverGradient}`}
        aria-hidden
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="space-y-5 text-base leading-relaxed sm:text-lg">
          {article.body.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>

        <section className="mt-12 rounded-xl border border-border bg-card p-6">
          <h2 className="font-heading text-2xl font-semibold">Fonti</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
            {article.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary"
                >
                  {source.title}
                </a>
                <span> · consultata il {formatDateIt(source.consultedAt)}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10" aria-label="Condivisione">
          <p className="text-sm font-semibold text-foreground">Condividi</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              render={
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              X / Twitter
            </Button>
            <Button
              size="sm"
              variant="outline"
              render={
                <a
                  href={`mailto:?subject=${encodeURIComponent(article.title)}`}
                />
              }
            >
              Email
            </Button>
          </div>
        </section>

        <CommentsSection articleId={article.slug} comments={comments} />
      </div>

      {related.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Articoli correlati
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ArticleCard
                key={item.slug}
                article={item}
                topic={getTopicBySlug(item.topicSlug)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
