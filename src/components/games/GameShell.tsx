"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionDuration, motionEase } from "@/lib/motion/tokens";

export function GameShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <div className="relative mx-auto max-w-3xl space-y-6 overflow-hidden px-4 py-12 sm:px-6">
      <div
        className="pointer-events-none absolute -left-24 top-8 h-56 w-56 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(0,158,219,0.28), transparent 70%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-40 h-48 w-48 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(25,72,106,0.25), transparent 70%)",
        }}
        aria-hidden
      />

      <p className="relative">
        <Link
          href="/gioca"
          className="text-sm text-primary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          data-cursor="link"
        >
          ← Torna a Gioca e impara
        </Link>
      </p>
      <motion.header
        className="relative space-y-2"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: motionDuration.base,
          ease: motionEase.out,
        }}
      >
        <h1 className="font-heading text-3xl text-foreground">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </motion.header>
      <motion.div
        className="relative"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: reduceMotion ? 0 : motionDuration.instant,
          duration: motionDuration.base,
          ease: motionEase.out,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
