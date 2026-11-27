"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpIcon } from "lucide-react";
import { useRef } from "react";

import { Magnetic } from "@/components/motion/magnetic";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Wordmark sovradimensionato in fondo al footer: sale e si mette a fuoco
 * man mano che il footer entra in viewport. Decorativo (aria-hidden).
 */
export function FooterWordmark({ name }: { name: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.6,
  });
  const y = useTransform(progress, [0, 1], ["42%", "0%"]);
  const rotateX = useTransform(progress, [0, 1], [38, 0]);
  const opacity = useTransform(progress, [0, 0.6, 1], [0, 0.55, 1]);

  return (
    <div ref={ref} className="shell-footer-wordmark-wrap" aria-hidden>
      <motion.p
        className="shell-footer-wordmark font-heading"
        style={reduceMotion ? undefined : { y, rotateX, opacity }}
      >
        {name}
      </motion.p>
    </div>
  );
}

export function BackToTop() {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <Magnetic strength={16} radius={90}>
      <button
        type="button"
        data-cursor="cta"
        className="shell-footer-top group"
        onClick={() =>
          window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })
        }
      >
        <span className="shell-footer-top-icon">
          <ArrowUpIcon className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5" />
        </span>
        Torna su
      </button>
    </Magnetic>
  );
}
