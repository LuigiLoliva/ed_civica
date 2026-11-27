"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

import { motionDuration, motionEase } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

export type RevealVariant = "fade-up" | "fade" | "scale" | "clip-up" | "slide-left";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
  /** Ripeti ogni volta che entra in viewport (default: una sola volta). */
  once?: boolean;
  as?: "div" | "section" | "article" | "li" | "header";
};

const variants: Record<RevealVariant, Variants> = {
  "fade-up": {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1 },
  },
  "clip-up": {
    hidden: { opacity: 0, y: 36, clipPath: "inset(12% 0 0 0)" },
    visible: { opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" },
  },
  "slide-left": {
    hidden: { opacity: 0, x: 28 },
    visible: { opacity: 1, x: 0 },
  },
};

/**
 * Entrata soft allo scroll (rispetta prefers-reduced-motion).
 * Varianti: fade-up (default), fade, scale, clip-up, slide-left.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  variant = "fade-up",
  once = true,
  as = "div",
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as];

  if (reduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={cn("will-change-transform", className)}
      variants={variants[variant]}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10% 0px" }}
      transition={{
        duration:
          variant === "clip-up" ? motionDuration.slow : motionDuration.base,
        delay,
        ease: variant === "clip-up" ? motionEase.clip : motionEase.out,
      }}
    >
      {children}
    </MotionTag>
  );
}
