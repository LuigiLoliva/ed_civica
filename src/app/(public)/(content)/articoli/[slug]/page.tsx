import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/articles/article-card";
import styles from "@/components/content-stage/content-stage.module.css";
import { Magnetic } from "@/components/motion/magnetic";
import { ArticleDetailHero } from "@/components/articles/article-detail-hero";
import { ArticleReadingBody } from "@/components/articles/article-reading-body";
import { CommentsSection } from "@/components/comments/comments-section";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { listApprovedComments } from "@/lib/comments/store";
import { formatDateIt } from "@/lib/format";
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
  // Chiave pubblica = slug (testo). Lo store risolve a UUID solo se l'articolo
  // esiste in Supabase; altrimenti resta sul file store (mai slug → colonna uuid).
  const comments = await listApprovedComments(article.slug);

  return (
    <article className={`${styles.contentAtmosphere} pb-16`}>
      <ArticleDetailHero article={article} topic={topic} />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <ArticleReadingBody paragraphs={article.body} />

        <Reveal className={`mt-12 rounded-xl border p-6 shadow-depth ${styles.contentPanel}`}>
          <h2 className="font-heading text-2xl font-semibold">Fonti</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
            {article.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary transition-colors hover:text-goal-16"
                  data-cursor="link"
                >
                  {source.title}
                </a>
                <span> · consultata il {formatDateIt(source.consultedAt)}</span>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal className="mt-10" delay={0.05}>
          <section aria-label="Condivisione">
            <p className="text-sm font-semibold text-foreground">Condividi</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Magnetic strength={11} radius={72} className="inline-flex">
                <Button
                  size="sm"
                  variant="outline"
                  nativeButton={false}
                  className="bg-card/50 backdrop-blur-sm"
                  render={
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="cta"
                    />
                  }
                >
                  X / Twitter
                </Button>
              </Magnetic>
              <Magnetic strength={11} radius={72} className="inline-flex">
                <Button
                  size="sm"
                  variant="outline"
                  nativeButton={false}
                  className="bg-card/50 backdrop-blur-sm"
                  render={
                    <a
                      href={`mailto:?subject=${encodeURIComponent(article.title)}`}
                      data-cursor="cta"
                    />
                  }
                >
                  Email
                </Button>
              </Magnetic>
            </div>
          </section>
        </Reveal>

        <Reveal className="mt-4" delay={0.08}>
          <CommentsSection articleId={article.slug} comments={comments} />
        </Reveal>
      </div>

      {related.length > 0 ? (
        <Reveal className="mx-auto max-w-6xl px-4 sm:px-6" delay={0.1}>
          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Articoli correlati
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <ArticleCard
                  key={item.slug}
                  article={item}
                  topic={getTopicBySlug(item.topicSlug)}
                  index={index}
                />
              ))}
            </div>
          </section>
        </Reveal>
      ) : null}
    </article>
  );
}
