"use client";

import type { ReactNode } from "react";

import { RouteAmbient } from "@/components/immersive/route-ambient";
import type { SceneId } from "@/components/immersive/scene-shapes";
import { TextReveal } from "@/components/motion/text-reveal";
import { Reveal } from "@/components/motion/reveal";

type LegalPageShellProps = {
  scene: SceneId;
  title: string;
  lead: ReactNode;
  children: ReactNode;
};

export function LegalPageShell({
  scene,
  title,
  lead,
  children,
}: LegalPageShellProps) {
  return (
    <>
      <RouteAmbient scene={scene} className="-z-[1]" />
      <article className="relative z-10 mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <header className="space-y-3">
          <p className="text-sm font-medium text-primary">Informativa · bozza scolastica</p>
          <TextReveal as="h1" className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </TextReveal>
          <Reveal variant="clip-up" delay={0.08} className="text-muted-foreground text-pretty">
            <p>{lead}</p>
          </Reveal>
        </header>
        <div className="mt-10">{children}</div>
      </article>
    </>
  );
}