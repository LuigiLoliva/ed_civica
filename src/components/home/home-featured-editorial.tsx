"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { Magnetic } from "@/components/motion/magnetic";
import { Button } from "@/components/ui/button";
import { authorFullName, formatDateIt } from "@/lib/format";
import type { MockArticle, MockTopic } from "@/lib/mock-data";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionDuration, motionEase } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

type Item = {
  article: MockArticle;
  topic?: MockTopic;
};

type HomeFeaturedEditorialProps = {
  items: Item[];
};

/**
 * Capitolo «In evidenza» editoriale asimmetrico a schermo pieno.
 * Lead monumentale full-bleed + stack tipografico laterale.
 */
export function HomeFeaturedEditorial({ items }: HomeFeaturedEditorialProps) {
  const [lead, ...rest] = items;
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const mediaScale = useTransform(scrollYProgress, [0, 0.4, 1], [1.18, 1, 1.06]);
  const titleY = useTransform(scrollYProgress, [0, 1], [56, -32]);
  const scrubX = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);

  if (!lead) return null;

  return (
    <section ref={ref} className="relative overflow-hidden py-16 sm:py-24">
      {!reduceMotion ? (
        <motion.p
          className="pointer-events-none absolute top-10 left-0 font-heading text-[clamp(6rem,22vw,18rem)] leading-none font-semibold text-goal-16/[0.05] select-none"
          style={{ x: scrubX }}
          aria-hidden
        >
          EVIDENZA
        </motion.p>
      ) : null}

      <div className="relative">
        <div className="mx-auto mb-10 flex max-w-[96rem] flex-col gap-6 px-4 sm:mb-14 sm:px-6 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold tracking-[0.28em] text-goal-16 uppercase">
              In evidenza
            </p>
            <h2 className="font-heading mt-3 text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.9] font-semibold tracking-tight">
              Letture scelte
              <span className="mt-1 block text-goal-16/85">dalla redazione</span>
            </h2>
          </div>
          <Magnetic strength={12} radius={100}>
            <Button
              nativeButton={false}
              render={<Link href="/articoli" data-cursor="link" />}
              variant="outline"
              className="self-start lg:mb-3 lg:self-auto"
            >
              Tutti gli articoli
            </Button>
          </Magnetic>
        </div>

        <article className="relative grid gap-0 lg:grid-cols-12 lg:items-stretch">
          <Link
            href={`/articoli/${lead.article.slug}`}
            data-cursor="media"
            className="group relative isolate min-h-[24rem] overflow-hidden lg:col-span-8 lg:min-h-[40rem]"
          >
            <motion.div
              className={cn(
                "absolute inset-0 bg-gradient-to-br",
                lead.article.coverGradient,
              )}
              style={reduceMotion ? undefined : { scale: mediaScale }}
            />
            {/* Motivi grafici sul piano media */}
            <svg
              className="absolute inset-0 h-full w-full opacity-30 mix-blend-overlay"
              aria-hidden
            >
              <defs>
                <pattern
                  id="feat-dots"
                  width="22"
                  height="22"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="1" cy="1" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#feat-dots)" />
              <circle cx="78%" cy="28%" r="18%" fill="none" stroke="white" strokeWidth="1.5" opacity="0.45" />
              <circle cx="78%" cy="28%" r="9%" fill="none" stroke="white" strokeWidth="1" opacity="0.35" />
            </svg>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgb(255_255_255_/_28%),transparent_40%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-hero via-hero/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
              {lead.topic ? (
                <p className="text-xs font-semibold tracking-[0.22em] text-blue-100/85 uppercase">
                  {lead.topic.name}
                </p>
              ) : null}
              <motion.h3
                className="font-heading mt-3 max-w-2xl text-[clamp(2rem,5vw,4rem)] leading-[1.02] font-semibold text-white"
                style={reduceMotion ? undefined : { y: titleY }}
              >
                {lead.article.title}
              </motion.h3>
              <p className="mt-4 max-w-xl text-sm text-white/72 sm:text-base lg:text-lg">
                {lead.article.summary}
              </p>
              <p className="mt-5 text-xs tracking-wide text-white/45 uppercase">
                {lead.article.authors.map(authorFullName).join(", ")}
                <span aria-hidden> · </span>
                <time dateTime={lead.article.publishedAt}>
                  {formatDateIt(lead.article.publishedAt)}
                </time>
              </p>
            </div>
          </Link>

          <div className="flex flex-col justify-between gap-8 border-border/60 bg-card/50 px-4 py-8 backdrop-blur-sm sm:px-6 lg:col-span-4 lg:border-l lg:px-8 lg:py-10 xl:px-12">
            <p className="max-w-sm text-muted-foreground text-pretty sm:text-lg">
              Approfondimenti su pace, giustizia e partnership — voci della
              scuola per l&apos;Agenda 2030.
            </p>

            <ul className="divide-y divide-border/70 border-y border-border/70">
              {rest.map((item, index) => (
                <FeaturedSideRow
                  key={item.article.slug}
                  item={item}
                  index={index + 2}
                  reduceMotion={!!reduceMotion}
                />
              ))}
            </ul>
          </div>
        </article>
      </div>
    </section>
  );
}

function FeaturedSideRow({
  item,
  index,
  reduceMotion,
}: {
  item: Item;
  index: number;
  reduceMotion: boolean;
}) {
  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, x: 48 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{
        duration: motionDuration.slow,
        delay: index * 0.05,
        ease: motionEase.out,
      }}
      className="group"
    >
      <Link
        href={`/articoli/${item.article.slug}`}
        data-cursor="link"
        className="grid grid-cols-[auto_1fr] gap-4 py-6 sm:gap-5"
      >
        <span className="font-heading text-4xl font-semibold text-goal-16/25 transition-colors group-hover:text-goal-16/60 sm:text-5xl">
          {String(index).padStart(2, "0")}
        </span>
        <span>
          {item.topic ? (
            <span className="text-[0.65rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              {item.topic.name}
            </span>
          ) : null}
          <span className="font-heading mt-1 block text-lg leading-snug font-semibold text-pretty transition-colors group-hover:text-goal-16 sm:text-xl lg:text-[1.35rem]">
            {item.article.title}
          </span>
          <span className="mt-2 block text-xs text-muted-foreground">
            {item.article.authors.map(authorFullName).join(", ")}
            <span aria-hidden> · </span>
            <time dateTime={item.article.publishedAt}>
              {formatDateIt(item.article.publishedAt)}
            </time>
          </span>
        </span>
      </Link>
    </motion.li>
  );
}
