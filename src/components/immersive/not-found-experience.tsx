"use client";

import Link from "next/link";

import { RouteAmbient } from "@/components/immersive/route-ambient";
import { Magnetic } from "@/components/motion/magnetic";
import { TextReveal } from "@/components/motion/text-reveal";
import { Button } from "@/components/ui/button";

export function NotFoundExperience() {
  return (
    <>
      <RouteAmbient scene="lost" fullBleed className="-z-[1]" />
      <div className="relative z-10 mx-auto flex min-h-[50vh] max-w-6xl flex-col items-start justify-center px-4 py-20 sm:px-6">
        <p className="text-sm font-semibold tracking-[0.14em] text-primary uppercase">
          404
        </p>
        <TextReveal as="h1" className="mt-3 font-heading text-3xl font-semibold tracking-tight">
          Pagina non trovata
        </TextReveal>
        <p className="mt-4 max-w-md text-muted-foreground">
          Il contenuto che cerchi non esiste o è stato spostato.
        </p>
        <Magnetic className="mt-8">
          <Button nativeButton={false} render={<Link href="/" data-cursor="cta" />}>
            Torna alla home
          </Button>
        </Magnetic>
      </div>
    </>
  );
}