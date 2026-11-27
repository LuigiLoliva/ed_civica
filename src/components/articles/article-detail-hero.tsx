"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import styles from "@/components/content-stage/content-stage.module.css";
import { FadeLine, TextReveal } from "@/components/motion/text-reveal";
import { Badge } from "@/components/ui/badge";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { authorFullName, formatDateIt } from "@/lib/format";
import type { MockArticle, MockTopic } from "@/lib/mock-data";
import { motionDuration, motionEase } from "@/lib/motion/tokens";

type ArticleDetailHeroProps = {
  article: MockArticle;
  topic?: MockTopic;
};

/**
 * Hero dettaglio: TextReveal / FadeLine + cover clip cinematografica.
 */
export function ArticleDetailHero({ article, topic }: ArticleDetailHeroProps) {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <>
      <header className={`${styles.contentHero} relative isolate overflow-hidden`}>
        <div
          className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-primary/12 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-14">
          {topic ? (
            <FadeLine>
              <Badge
                variant="secondary"
                render={
                  <Link href={`/argomenti/${topic.slug}`} data-cursor="link" />
                }
              >
                {topic.name}
              </Badge>
            </FadeLine>
          ) : null}

          <TextReveal
            as="h1"
            delay={0.06}
            className="font-heading mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
          >
            {article.title}
          </TextReveal>

          <FadeLine delay={0.16}>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              {article.summary}
            </p>
          </FadeLine>

          <FadeLine delay={0.24}>
            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span>{article.authors.map(authorFullName).join(", ")}</span>
              <time dateTime={article.publishedAt}>
                {formatDateIt(article.publishedAt)}
              </time>
              <span>{article.readingMinutes} min di lettura</span>
            </div>
          </FadeLine>
        </div>
      </header>

      <motion.div
        className={`relative h-44 overflow-hidden bg-gradient-to-br sm:h-56 ${article.coverGradient}`}
        aria-hidden
        data-cursor="media"
        initial={
          reduceMotion
            ? false
            : { clipPath: "inset(12% 8% 12% 8% round 1.5rem)", opacity: 0.7 }
        }
        animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
        transition={{
          duration: motionDuration.cinematic,
          delay: 0.12,
          ease: motionEase.clip,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgb(255_255_255_/_28%),transparent_50%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/40 to-transparent" />
      </motion.div>
    </>
  );
}
