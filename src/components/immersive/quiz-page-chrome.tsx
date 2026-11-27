"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";

type QuizPageChromeProps = {
  children: ReactNode;
};

export function QuizPageChrome({ children }: QuizPageChromeProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-12 sm:px-6">
      <Reveal variant="fade">
        <p>
          <Link
            href="/gioca"
            className="text-sm text-primary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            data-cursor="link"
          >
            ← Torna a Gioca e impara
          </Link>
        </p>
      </Reveal>
      <Reveal variant="fade-up" delay={0.05}>
        {children}
      </Reveal>
    </div>
  );
}