"use client";

import Link from "next/link";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useRef, useState, type PointerEvent } from "react";

import { GenerativeCover } from "@/components/home/generative-cover";
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
 * «Ultimi articoli» come indice tipografico: nessuna card. Su desktop la
 * copertina dell'articolo segue il cursore e si scambia con un taglio a
 * tendina; su touch la copertina resta in linea.
 */
export function HomeLatestRiver({ items }: HomeLatestRiverProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const [active, setActive] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const markX = useTransform(scrollYProgress, [0, 1], ["6%", "-18%"]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const followX = useSpring(x, { stiffness: 190, damping: 24, mass: 0.6 });
  const followY = useSpring(y, { stiffness: 190, damping: 24, mass: 0.6 });
  const velocity = useVelocity(followX);
  const rotate = useTransform(velocity, [-1400, 0, 1400], [-9, 0, 9], {
    clamp: true,
  });

  const onPointerMove = (event: PointerEvent<HTMLOListElement>) => {
    if (event.pointerType === "touch" || !listRef.current) return;
    const rect = listRef.current.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    // La copertina insegue il cursore ma resta nella fascia destra: i titoli restano leggibili.
    x.set(rect.width * (0.62 + 0.2 * ratio));
    y.set(event.clientY - rect.top);
  };

  return (
    <section ref={sectionRef} className="relative overflow-x-clip py-20 sm:py-28">
      <motion.p
        className="font-heading pointer-events-none absolute top-6 left-0 text-[clamp(6rem,21vw,19rem)] leading-none font-semibold whitespace-nowrap text-goal-17/[0.045] select-none"
        style={reduceMotion ? undefined : { x: markX }}
        aria-hidden
      >
        ARCHIVIO
      </motion.p>

      <div className="relative mx-auto max-w-[100rem] px-5 sm:px-8 lg:px-12">
        <header className="mb-12 grid gap-6 sm:mb-16 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.28em] text-goal-16 uppercase">
              <span className="h-px w-10 bg-goal-16/50" aria-hidden />
              Cronaca della redazione
            </p>
            <h2 className="font-heading mt-4 text-[clamp(2.75rem,8vw,7rem)] leading-[0.9] font-semibold tracking-[-0.03em]">
              Ultimi{" "}
              <span className="block pl-[0.6em] text-goal-16">articoli</span>
            </h2>
          </div>
          <p className="max-w-xs text-muted-foreground text-pretty lg:col-span-4 lg:justify-self-end lg:pb-3">
            Le pubblicazioni più recenti, in ordine di uscita.
          </p>
        </header>

        <ol
          ref={listRef}
          className="group/list relative border-t border-foreground/20"
          onPointerMove={reduceMotion ? undefined : onPointerMove}
          onPointerLeave={() => setActive(null)}
        >
          {items.map((item, index) => (
            <RiverRow
              key={item.article.slug}
              item={item}
              index={index}
              reduceMotion={reduceMotion}
              onActivate={() => setActive(index)}
            />
          ))}

          {!reduceMotion ? (
            <motion.div
              className="pointer-events-none absolute top-0 left-0 z-20 hidden lg:pointer-fine:block"
              style={{ x: followX, y: followY, rotate }}
              aria-hidden
            >
              <motion.div
                className="relative h-[19rem] w-[25rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden shadow-[0_40px_90px_-30px_rgb(4_14_26_/_65%)]"
                initial={false}
                animate={{
                  opacity: active === null ? 0 : 1,
                  scale: active === null ? 0.72 : 1,
                }}
                transition={{ duration: 0.45, ease: motionEase.out }}
              >
                {items.map((item, index) => (
                  <motion.div
                    key={item.article.slug}
                    className="group absolute inset-0"
                    initial={false}
                    animate={{
                      clipPath:
                        active === index
                          ? "inset(0% 0% 0% 0%)"
                          : active !== null && index < active
                            ? "inset(0% 0% 100% 0%)"
                            : "inset(100% 0% 0% 0%)",
                    }}
                    transition={{ duration: 0.6, ease: motionEase.clip }}
                  >
                    <GenerativeCover
                      seed={item.article.slug}
                      topicSlug={item.article.topicSlug}
                      gradient={item.article.coverGradient}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ) : null}
        </ol>
      </div>
    </section>
  );
}

function RiverRow({
  item,
  index,
  reduceMotion,
  onActivate,
}: {
  item: Item;
  index: number;
  reduceMotion: boolean;
  onActivate: () => void;
}) {
  return (
    <motion.li
      className="border-b border-foreground/20 transition-opacity duration-500 group-hover/list:opacity-35 hover:!opacity-100 focus-within:!opacity-100"
      initial={reduceMotion ? false : { clipPath: "inset(0% 0% 100% 0%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "-6% 0px" }}
      transition={{
        duration: motionDuration.cinematic,
        delay: index * 0.07,
        ease: motionEase.clip,
      }}
      onPointerEnter={onActivate}
    >
      <Link
        href={`/articoli/${item.article.slug}`}
        data-cursor="link"
        className="group grid gap-x-8 gap-y-5 py-8 outline-none sm:py-11 lg:grid-cols-12 lg:items-center"
      >
        <span className="font-heading text-[clamp(3.25rem,6.5vw,6rem)] leading-none font-semibold tracking-[-0.04em] text-goal-16/25 transition-colors duration-500 group-hover:text-goal-16 group-focus-visible:text-goal-16 lg:col-span-2">
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className="relative block h-44 overflow-hidden sm:h-56 lg:pointer-fine:hidden lg:col-span-3">
          <GenerativeCover
            seed={item.article.slug}
            topicSlug={item.article.topicSlug}
            gradient={item.article.coverGradient}
          />
        </span>

        <span className="block transition-transform duration-700 ease-out group-hover:translate-x-3 lg:col-span-4 lg:pointer-fine:col-span-7">
          {item.topic ? (
            <span className="block text-[0.66rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              {item.topic.name}
            </span>
          ) : null}
          <span className="font-heading mt-2 block text-[clamp(1.6rem,3.4vw,2.9rem)] leading-[1.06] font-semibold tracking-[-0.015em] text-balance">
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-700 ease-out group-hover:bg-[length:100%_2px] group-focus-visible:bg-[length:100%_2px]">
              {item.article.title}
            </span>
          </span>
          <span className="mt-4 block max-w-2xl text-sm text-muted-foreground text-pretty sm:text-base">
            {item.article.summary}
          </span>
        </span>

        <span className="flex items-center justify-between gap-6 text-xs text-muted-foreground lg:col-span-3 lg:flex-col lg:items-end lg:gap-4 lg:text-right">
          <span className="block leading-relaxed">
            {item.article.authors.map(authorFullName).join(", ")}
            <br />
            <time dateTime={item.article.publishedAt}>
              {formatDateIt(item.article.publishedAt)}
            </time>
            <span aria-hidden> · </span>
            {item.article.readingMinutes} min
          </span>
          <span
            aria-hidden
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-full border border-foreground/25 text-lg",
              "transition-[background-color,color,transform,border-color] duration-500",
              "group-hover:-rotate-45 group-hover:border-goal-16 group-hover:bg-goal-16 group-hover:text-white",
            )}
          >
            →
          </span>
        </span>
      </Link>
    </motion.li>
  );
}
