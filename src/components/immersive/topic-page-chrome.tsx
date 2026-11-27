"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import styles from "@/components/content-stage/content-stage.module.css";
import { CinematicPageBanner } from "@/components/immersive/cinematic-page-banner";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

type TopicPageChromeProps = {
  name: string;
  description: string;
  color: string;
  children: ReactNode;
};

export function TopicPageChrome({
  name,
  description,
  color,
  children,
}: TopicPageChromeProps) {
  return (
    <div className={styles.contentAtmosphere}>
      <div className="relative z-10">
        <CinematicPageBanner
          title={name}
          description={description}
          eyebrow="Argomento"
          tone="glass"
          className={styles.contentHero}
        >
          <span
            className="inline-block h-2 w-16 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden
          />
          <Magnetic className="mt-6 inline-flex">
            <Button
              nativeButton={false}
              render={<Link href="/articoli" data-cursor="cta" />}
              variant="outline"
            >
              Torna a tutti gli articoli
            </Button>
          </Magnetic>
        </CinematicPageBanner>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <Reveal variant="fade-up">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Articoli su questo argomento
            </h2>
          </Reveal>
          <div className="mt-6">{children}</div>
        </section>
      </div>
    </div>
  );
}