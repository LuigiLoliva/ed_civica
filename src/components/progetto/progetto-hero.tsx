"use client";

import { FadeLine, TextReveal } from "@/components/motion/text-reveal";

import styles from "@/components/content-stage/content-stage.module.css";

type ProgettoHeroProps = {
  title: string;
  description: string;
};

export function ProgettoHero({ title, description }: ProgettoHeroProps) {
  return (
    <header className={styles.contentHero}>
      <div className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
        <FadeLine>
          <p className="text-sm font-semibold tracking-[0.18em] text-goal-16 uppercase">
            Educazione civica
          </p>
        </FadeLine>
        <TextReveal
          as="h1"
          delay={0.06}
          className="font-heading mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
        >
          {title}
        </TextReveal>
        <FadeLine delay={0.16}>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground text-pretty sm:text-lg">
            {description}
          </p>
        </FadeLine>
      </div>
    </header>
  );
}