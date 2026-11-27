"use client";

import Link from "next/link";
import { useRef, type PointerEvent } from "react";
import { motion, useSpring } from "framer-motion";

import { Reveal } from "@/components/motion/reveal";
import { Spotlight } from "@/components/motion/spotlight";
import { Badge } from "@/components/ui/badge";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { authorFullName, formatDateIt } from "@/lib/format";
import type { MockArticle, MockTopic } from "@/lib/mock-data";
import { motionDuration, motionEase, motionSpring } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

type ArticleCardProps = {
  article: MockArticle;
  topic?: MockTopic;
  className?: string;
  /** Indice per stagger opzionale in griglia esterna */
  index?: number;
  /** Disattiva se il parent gestisce già il reveal (es. home) */
  withReveal?: boolean;
};

/**
 * Card articolo premium: tilt 3D + Spotlight foundation + Reveal.
 */
export function ArticleCard({
  article,
  topic,
  className,
  index = 0,
  withReveal = true,
}: ArticleCardProps) {
  const reduceMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const rotateX = useSpring(0, motionSpring.soft);
  const rotateY = useSpring(0, motionSpring.soft);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateX.set((0.5 - py) * 10);
    rotateY.set((px - 0.5) * 12);
  }

  function handlePointerLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  const card = (
    <motion.div
      ref={ref}
      className={cn("h-full will-change-transform", className)}
      style={
        reduceMotion
          ? undefined
          : { rotateX, rotateY, transformPerspective: 900 }
      }
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -6,
              transition: {
                duration: motionDuration.fast,
                ease: motionEase.snappy,
              },
            }
      }
    >
      <Spotlight
        hoverOnly
        color="rgb(27 122 78 / 26%)"
        size={380}
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-depth",
          "transition-[border-color] duration-300 group-hover/spotlight:border-primary/40",
        )}
      >
        <article className="flex h-full flex-col" data-cursor="link">
          <div
            className={cn(
              "relative h-36 overflow-hidden sm:h-40",
              "bg-gradient-to-br",
              article.coverGradient,
            )}
            aria-hidden
            data-cursor="media"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(255_255_255_/_28%),transparent_45%)]" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card/35 to-transparent" />
            <motion.div
              className="absolute inset-0 origin-center"
              whileHover={reduceMotion ? undefined : { scale: 1.06 }}
              transition={{
                duration: motionDuration.base,
                ease: motionEase.out,
              }}
            >
              <div
                className={cn(
                  "h-full w-full bg-gradient-to-br opacity-90",
                  article.coverGradient,
                )}
              />
            </motion.div>
          </div>

          <div className="relative flex flex-1 flex-col px-5 pt-4 pb-5">
            {topic ? (
              <Badge variant="secondary" className="w-fit">
                {topic.name}
              </Badge>
            ) : null}
            <h3 className="font-heading mt-3 text-xl leading-snug font-semibold">
              <Link
                href={`/articoli/${article.slug}`}
                className="outline-none transition-colors hover:text-primary focus-visible:text-primary"
                data-cursor="link"
              >
                <span className="absolute inset-0 z-[2]" aria-hidden />
                {article.title}
              </Link>
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {article.summary}
            </p>
            <div className="mt-auto pt-4 text-xs text-muted-foreground">
              <p>{article.authors.map(authorFullName).join(", ")}</p>
              <p className="mt-1">
                <time dateTime={article.publishedAt}>
                  {formatDateIt(article.publishedAt)}
                </time>
                <span aria-hidden> · </span>
                <span>{article.readingMinutes} min</span>
              </p>
            </div>
          </div>
        </article>
      </Spotlight>
    </motion.div>
  );

  if (!withReveal) return card;

  return (
    <Reveal
      delay={Math.min(index * 0.06, 0.36)}
      variant="fade-up"
      className="h-full"
    >
      {card}
    </Reveal>
  );
}
