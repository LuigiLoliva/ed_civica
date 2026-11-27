import Link from "next/link";

import { Magnetic } from "@/components/motion/magnetic";
import { TextReveal } from "@/components/motion/text-reveal";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="route-surface mx-auto flex min-h-dvh max-w-6xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <p className="shell-lost-digits font-heading" aria-hidden>
        404
      </p>
      <TextReveal
        as="h1"
        className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
      >
        Pagina non trovata
      </TextReveal>
      <p className="mt-4 max-w-md text-muted-foreground text-pretty">
        Il contenuto che cerchi non esiste o è stato spostato.
      </p>
      <Magnetic strength={14} radius={100} className="mt-10">
        <Button
          nativeButton={false}
          render={<Link href="/" data-cursor="cta" />}
          size="lg"
        >
          Torna alla home
        </Button>
      </Magnetic>
    </div>
  );
}