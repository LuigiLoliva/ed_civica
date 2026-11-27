"use client";

import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef, type PointerEvent } from "react";

import { GenerativeCover } from "@/components/home/generative-cover";
import { Magnetic } from "@/components/motion/magnetic";
import { buttonVariants } from "@/components/ui/button";
import { authorFullName, formatDateIt } from "@/lib/format";
import type { MockArticle, MockTopic } from "@/lib/mock-data";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import { motionDuration, motionEase, motionSpring } from "@/lib/motion/tokens";

type Item = {
  article: MockArticle;
  topic?: MockTopic;
};

type HomeFeaturedEditorialProps = {
  items: Item[];
};

/**
 * Capitolo «In evidenza»: un pezzo d'apertura a tutta altezza che si apre
 * con un taglio guidato dallo scroll e reagisce alla luce del cursore,
 * affiancato da un indice tipografico numerato.
 */
export function HomeFeaturedEditorial({ items }: HomeFeaturedEditorialProps) {
  const [lead, ...rest] = items;
  const sectionRef = useRef<HTMLElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const markX = useTransform(scrollYProgress, [0, 1], ["-4%", "-22%"]);

  const { scrollYProgress: leadProgress } = useScroll({
    target: leadRef,
    offset: ["start end", "start 0.25"],
  });
  const insetY = useTransform(leadProgress, [0, 1], [16, 0]);
  const insetRight = useTransform(leadProgress, [0, 1], [22, 0]);
  const leadClip = useMotionTemplate`inset(${insetY}% ${insetRight}% ${insetY}% 0%)`;
  const coverScale = useTransform(leadProgress, [0, 1], [1.3, 1]);
  const titleY = useTransform(leadProgress, [0, 1], [70, 0]);

  const px = useMotionValue(0.3);
  const py = useMotionValue(0.3);
  const lightX = useSpring(px, motionSpring.soft);
  const lightY = useSpring(py, motionSpring.soft);
  const lightLeft = useTransform(lightX, (v) => `${v * 100}%`);
  const lightTop = useTransform(lightY, (v) => `${v * 100}%`);
  const light = useMotionTemplate`radial-gradient(34rem circle at ${lightLeft} ${lightTop}, rgb(255 255 255 / 30%), transparent 62%)`;
  const coverX = useTransform(lightX, [0, 1], [18, -18]);
  const coverY = useTransform(lightY, [0, 1], [12, -12]);

  const onLeadMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  };

  if (!lead) return null;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-x-clip pt-20 sm:pt-28"
    >
      <motion.p
        className="font-heading pointer-events-none absolute top-8 left-0 text-[clamp(6rem,23vw,21rem)] leading-none font-semibold whitespace-nowrap text-goal-16/[0.05] select-none"
        style={reduceMotion ? undefined : { x: markX }}
        aria-hidden
      >
        IN EVIDENZA
      </motion.p>

      <div className="relative mx-auto mb-12 grid max-w-[100rem] gap-8 px-5 sm:mb-16 sm:px-8 lg:grid-cols-12 lg:items-end lg:px-12">
        <div className="lg:col-span-9">
          <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.28em] text-goal-16 uppercase">
            <span className="h-px w-10 bg-goal-16/50" aria-hidden />
            In evidenza
          </p>
          <h2 className="font-heading mt-4 text-[clamp(2.75rem,8vw,7rem)] leading-[0.9] font-semibold tracking-[-0.03em]">
            Letture scelte{" "}
            <span className="block pl-[0.6em] text-goal-16">
              dalla redazione
            </span>
          </h2>
        </div>
        <div className="lg:col-span-3 lg:justify-self-end lg:pb-3">
          <Magnetic strength={12} radius={100}>
            <Link
              href="/articoli"
              data-cursor="link"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-12 rounded-full px-6 text-sm",
              )}
            >
              Tutti gli articoli
            </Link>
          </Magnetic>
        </div>
      </div>

      <article className="relative grid lg:grid-cols-12 lg:items-stretch">
        <div
          ref={leadRef}
          className="lg:col-span-8"
          onPointerMove={reduceMotion ? undefined : onLeadMove}
        >
          <motion.div
            className="h-full will-change-[clip-path]"
            style={reduceMotion ? undefined : { clipPath: leadClip }}
          >
            <Link
              href={`/articoli/${lead.article.slug}`}
              data-cursor="media"
              className="group relative isolate flex min-h-[30rem] flex-col justify-end overflow-hidden text-white outline-none sm:min-h-[36rem] lg:min-h-[max(42rem,82svh)]"
            >
              <motion.div
                className="absolute -inset-6"
                style={
                  reduceMotion
                    ? undefined
                    : { scale: coverScale, x: coverX, y: coverY }
                }
              >
                <GenerativeCover
                  seed={lead.article.slug}
                  topicSlug={lead.article.topicSlug}
                  gradient={lead.article.coverGradient}
                />
              </motion.div>
              {!reduceMotion ? (
                <motion.div
                  className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-700 group-hover:opacity-100"
                  style={{ background: light }}
                  aria-hidden
                />
              ) : null}
              <div
                className="absolute inset-0 bg-gradient-to-t from-hero via-hero/35 to-transparent"
                aria-hidden
              />

              <span className="font-heading absolute top-6 right-6 text-[clamp(3rem,7vw,6.5rem)] leading-none font-semibold tracking-[-0.04em] text-white/25 sm:top-10 sm:right-10">
                01
              </span>

              <motion.div
                className="relative p-6 sm:p-10 lg:p-14"
                style={reduceMotion ? undefined : { y: titleY }}
              >
                {lead.topic ? (
                  <p className="text-xs font-semibold tracking-[0.24em] text-sky-200/90 uppercase">
                    {lead.topic.name}
                  </p>
                ) : null}
                <h3 className="font-heading mt-4 max-w-3xl text-[clamp(2.25rem,5.6vw,5rem)] leading-[0.98] font-semibold tracking-[-0.025em] text-balance">
                  {lead.article.title}
                </h3>
                <p className="mt-5 max-w-xl text-sm text-white/75 text-pretty sm:text-base lg:text-lg">
                  {lead.article.summary}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <p className="text-xs tracking-wide text-white/55 uppercase">
                    {lead.article.authors.map(authorFullName).join(", ")}
                    <span aria-hidden> · </span>
                    <time dateTime={lead.article.publishedAt}>
                      {formatDateIt(lead.article.publishedAt)}
                    </time>
                    <span aria-hidden> · </span>
                    {lead.article.readingMinutes} min
                  </p>
                  <span className="inline-flex items-center gap-3 text-sm font-semibold">
                    <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:100%_1px] bg-left-bottom bg-no-repeat pb-1">
                      Leggi l&apos;articolo
                    </span>
                    <span
                      aria-hidden
                      className="transition-transform duration-500 group-hover:translate-x-1.5"
                    >
                      →
                    </span>
                  </span>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        <div className="flex flex-col justify-between gap-10 px-5 py-12 sm:px-8 lg:col-span-4 lg:px-10 lg:py-14 xl:px-14">
          <p className="max-w-sm text-lg text-muted-foreground text-pretty">
            Approfondimenti su pace, giustizia e partnership — voci della scuola
            per l&apos;Agenda 2030.
          </p>

          <ul className="border-t border-foreground/20">
            {rest.map((item, index) => (
              <motion.li
                key={item.article.slug}
                className="border-b border-foreground/20"
                initial={
                  reduceMotion ? false : { clipPath: "inset(0% 100% 0% 0%)" }
                }
                whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{
                  duration: motionDuration.cinematic,
                  delay: index * 0.12,
                  ease: motionEase.clip,
                }}
              >
                <Link
                  href={`/articoli/${item.article.slug}`}
                  data-cursor="link"
                  className="group grid grid-cols-[auto_1fr] gap-5 py-7 outline-none"
                >
                  <span className="font-heading text-[clamp(2.5rem,4vw,3.75rem)] leading-none font-semibold tracking-[-0.04em] text-goal-16/25 transition-colors duration-500 group-hover:text-goal-16 group-focus-visible:text-goal-16">
                    {String(index + 2).padStart(2, "0")}
                  </span>
                  <span className="block transition-transform duration-700 ease-out group-hover:translate-x-2">
                    {item.topic ? (
                      <span className="block text-[0.66rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                        {item.topic.name}
                      </span>
                    ) : null}
                    <span className="font-heading mt-2 block text-xl leading-snug font-semibold text-pretty sm:text-2xl">
                      {item.article.title}
                    </span>
                    <span className="mt-3 block text-xs text-muted-foreground">
                      {item.article.authors.map(authorFullName).join(", ")}
                      <span aria-hidden> · </span>
                      <time dateTime={item.article.publishedAt}>
                        {formatDateIt(item.article.publishedAt)}
                      </time>
                    </span>
                  </span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
      </article>
    </section>
  );
}
