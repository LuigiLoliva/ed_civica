"use client";

import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";

type LegalScrollProps = {
  children: ReactNode;
};

/** Sezioni privacy/cookie con entrata progressiva allo scroll. */
export function LegalScroll({ children }: LegalScrollProps) {
  return <div className="legal-scroll space-y-8">{children}</div>;
}

type LegalSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
  index?: number;
};

export function LegalSection({ id, title, children, index = 0 }: LegalSectionProps) {
  return (
    <Reveal as="section" variant="fade-up" delay={index * 0.04} className="space-y-2">
      <h2 id={id} className="font-heading text-xl font-semibold text-foreground">
        {title}
      </h2>
      <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
    </Reveal>
  );
}