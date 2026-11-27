"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionDuration, motionEase } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

type TextRevealProps = {
  children: string;
  className?: string;
  /** Ritardo iniziale in secondi */
  delay?: number;
  as?: "h1" | "h2" | "p" | "span";
};

/**
 * Reveal tipografico a parole (clip + rise). Brand hero / titoli sezione.
 */
export function TextReveal({
  children,
  className,
  delay = 0,
  as: Tag = "p",
}: TextRevealProps) {
  const reduceMotion = usePrefersReducedMotion();
  const words = children.split(/(\s+)/).filter((w) => w.length > 0);

  if (reduceMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag className={cn("overflow-hidden", className)} aria-label={children}>
      <span className="sr-only">{children}</span>
      <span aria-hidden className="inline">
        {words.map((word, i) => {
          if (/^\s+$/.test(word)) {
            return <span key={`s-${i}`}>{" "}</span>;
          }
          return (
            <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
              <motion.span
                className="inline-block"
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{
                  duration: motionDuration.slow,
                  delay: delay + i * 0.045,
                  ease: motionEase.out,
                }}
              >
                {word}
              </motion.span>
            </span>
          );
        })}
      </span>
    </Tag>
  );
}

type FadeLineProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/** Singola riga con fade + rise (sottotitoli / CTA group). */
export function FadeLine({ children, className, delay = 0 }: FadeLineProps) {
  const reduceMotion = usePrefersReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: motionDuration.base,
        delay,
        ease: motionEase.out,
      }}
    >
      {children}
    </motion.div>
  );
}
