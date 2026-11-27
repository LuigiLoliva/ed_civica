"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { authorFullName, formatDateIt } from "@/lib/format";
import type { MockArticle, MockTopic } from "@/lib/mock-data";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionDuration, motionEase } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

type Item = {
  article: MockArticle;
  topic?: MockTopic;
};

type HomeLatestRiverProps = {
  items: Item[];
};

/**
 * Fiume editoriale «Ultimi articoli»: indici oversized, regole orizzontali,
 * composizione asimmetrica — niente griglia di card.
 */
export function HomeLatestRiver({ items }: HomeLatestRiverProps) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const markX = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  return (
    <section ref={ref} className="relative overflow-hidden pb-8 sm:pb-12">
      {!reduceMotion ? (
        <motion.p
          className="pointer-events-none absolute top-24 -right-8 font-heading text-[clamp(5rem,18vw,14rem)] leading-none font-semibold text-goal-17/[0.035] select-none"
          style={{ x: markX }}
          aria-hidden
        >
          ARCHIVIO
        </motion.p>
      ) : null}

      <div className="relative mx-auto max-w-[90rem] px-4 sm:px-6">
        <header className="mb-10 max-w-2xl sm:mb-14">
          <p className="text-xs font-semibold tracking-[0.28em] text-muted-foreground uppercase">
            Cronaca della redazione
          </p>
          <h2 className="font-heading mt-3 text-[clamp(2.4rem,6vw,4.75rem)] leading-[0.95] font-semibold tracking-tight">
            Ultimi articoli
          </h2>
        </header>

        <ol className="border-t border-foreground/15">
          {items.map((item, index) => (
            <RiverRow
              key={item.article.slug}
              item={item}
              index={index}
              reduceMotion={!!reduceMotion}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

function RiverRow({
  item,
  index,
  reduceMotion,
}: {
  item: Item;
  index: number;
  reduceMotion: boolean;
}) {
  const odd = index % 2 === 1;

  return (
    <motion.li
      className="border-b border-foreground/15"
      initial={
        reduceMotion
          ? false
          : {
              clipPath: "inset(0 0 100% 0)",
              opacity: 0.4,
            }
      }
      whileInView={{
        clipPath: "inset(0 0 0% 0)",
        opacity: 1,
      }}
      viewport={{ once: true, margin: "-6% 0px" }}
      transition={{
        duration: motionDuration.cinematic,
        delay: index * 0.06,
        ease: motionEase.clip,
      }}
    >
      <Link
        href={`/articoli/${item.article.slug}`}
        data-cursor="link"
        className={cn(
          "group grid gap-4 py-8 sm:grid-cols-12 sm:items-center sm:gap-6 sm:py-10",
          odd && "sm:[&>*:first-child]:order-2",
        )}
      >
        <div
          className={cn(
            "relative h-28 overflow-hidden sm:col-span-3 sm:h-36",
            odd && "sm:col-start-10",
          )}
        >
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br transition-transform duration-700 group-hover:scale-105",
              item.article.coverGradient,
            )}
            data-cursor="media"
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgb(255_255_255_/_28%),transparent_45%)]"
            aria-hidden
          />
          <svg
            className="absolute inset-0 h-full w-full opacity-40"
            aria-hidden
          >
            <circle
              cx="70%"
              cy="35%"
              r="28%"
              fill="none"
              stroke="white"
              strokeWidth="1"
            />
            <circle
              cx="70%"
              cy="35%"
              r="12%"
              fill="none"
              stroke="white"
              strokeWidth="0.75"
              opacity="0.7"
            />
          </svg>
        </div>

        <div
          className={cn(
            "sm:col-span-7",
            odd ? "sm:col-start-1 sm:row-start-1" : "sm:col-start-5",
          )}
        >
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="font-heading text-5xl font-semibold text-goal-16/20 sm:text-6xl">
              {String(index + 1).padStart(2, "0")}
            </span>
            {item.topic ? (
              <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                {item.topic.name}
              </span>
            ) : null}
          </div>
          <h3 className="font-heading mt-2 text-[clamp(1.5rem,3.2vw,2.35rem)] leading-[1.1] font-semibold transition-colors group-hover:text-goal-16">
            {item.article.title}
          </h3>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground text-pretty sm:text-base">
            {item.article.summary}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            {item.article.authors.map(authorFullName).join(", ")}
            <span aria-hidden> · </span>
            <time dateTime={item.article.publishedAt}>
              {formatDateIt(item.article.publishedAt)}
            </time>
            <span aria-hidden> · </span>
            {item.article.readingMinutes} min
          </p>
        </div>
      </Link>
    </motion.li>
  );
}
