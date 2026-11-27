"use client";

import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";
import { Spotlight } from "@/components/motion/spotlight";
import { TextReveal } from "@/components/motion/text-reveal";
import { cn } from "@/lib/utils";

type CinematicPageBannerProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  children?: ReactNode;
  className?: string;
  tone?: "light" | "ocean";
};

/** Intestazione cinematica per pagine secondarie (gioca, legali, argomenti). */
export function CinematicPageBanner({
  title,
  description,
  eyebrow,
  children,
  className,
  tone = "light",
}: CinematicPageBannerProps) {
  return (
    <header
      className={cn(
        "relative border-b border-border/60",
        tone === "ocean" ? "bg-hero-ocean text-hero-foreground" : "bg-page-banner",
        className,
      )}
    >
      <Spotlight
        className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14"
        color={
          tone === "ocean"
            ? "rgb(0 158 219 / 22%)"
            : "rgb(0 158 219 / 18%)"
        }
        hoverOnly={tone === "light"}
      >
        {eyebrow ? (
          <Reveal variant="fade" className="text-sm font-semibold tracking-[0.16em] text-primary uppercase">
            {eyebrow}
          </Reveal>
        ) : null}
        <TextReveal
          as="h1"
          className={cn(
            "mt-3 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]",
            tone === "ocean" && "text-hero-foreground",
          )}
        >
          {title}
        </TextReveal>
        {description ? (
          <Reveal variant="clip-up" delay={0.12} className="mt-3 max-w-2xl text-base text-muted-foreground text-pretty sm:text-lg">
            <p>{description}</p>
          </Reveal>
        ) : null}
        {children ? (
          <Reveal variant="fade-up" delay={0.2} className="mt-6">
            {children}
          </Reveal>
        ) : null}
      </Spotlight>
    </header>
  );
}