"use client";

import Link from "next/link";

import styles from "@/components/content-stage/content-stage.module.css";
import { Magnetic } from "@/components/motion/magnetic";
import { FadeLine, TextReveal } from "@/components/motion/text-reveal";
import { Badge } from "@/components/ui/badge";
import type { MockTopic } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type ArticlesListingBannerProps = {
  topics: MockTopic[];
  selected?: string;
};

/**
 * Banner cinematico elenco articoli — TextReveal / FadeLine / Magnetic foundation.
 */
export function ArticlesListingBanner({
  topics,
  selected,
}: ArticlesListingBannerProps) {
  return (
    <header
      className={`${styles.contentHero} relative isolate overflow-hidden`}
    >
      <div
        className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-28 left-[-8%] h-64 w-64 rounded-full bg-goal-17/15 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <FadeLine>
          <p className="text-sm font-semibold tracking-[0.18em] text-goal-16 uppercase">
            Redazione scolastica
          </p>
        </FadeLine>
        <TextReveal
          as="h1"
          delay={0.06}
          className="font-heading mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem]"
        >
          Articoli
        </TextReveal>
        <FadeLine delay={0.18}>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground text-pretty sm:text-lg">
            Approfondimenti della classe sull&apos;ONU e sull&apos;Agenda 2030.
            Filtra per argomento o apri la pagina dedicata di ciascun tema.
          </p>
        </FadeLine>

        <FadeLine delay={0.28}>
          <div
            className="mt-8 flex flex-wrap gap-2"
            role="list"
            aria-label="Filtri argomento"
          >
            <FilterChip href="/articoli" active={!selected} label="Tutti" />
            {topics.map((topic) => (
              <FilterChip
                key={topic.slug}
                href={`/articoli?argomento=${topic.slug}`}
                active={selected === topic.slug}
                label={topic.name}
                accent={topic.color}
              />
            ))}
          </div>
        </FadeLine>
      </div>
    </header>
  );
}

function FilterChip({
  href,
  active,
  label,
  accent,
}: {
  href: string;
  active: boolean;
  label: string;
  accent?: string;
}) {
  return (
    <Magnetic strength={10} radius={72} className="inline-flex" role="listitem">
      <Badge
        variant={active ? "default" : "outline"}
        render={<Link href={href} data-cursor="link" />}
        className={cn(
          "h-8 px-3 transition-transform duration-300",
          active && "shadow-[0_8px_20px_rgb(30_58_138_/_25%)]",
        )}
        style={
          active && accent ? { boxShadow: `0 8px 20px ${accent}33` } : undefined
        }
      >
        {label}
      </Badge>
    </Magnetic>
  );
}
