"use client";

import { motion, useScroll, useTransform } from "framer-motion";

import {
  GlobeIcon,
  NetworkIcon,
  OliveBranchIcon,
} from "@/components/icons/onu-motifs";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/** Motivi SVG a tutta larghezza dietro al brand (parallax leggero). */
export function HeroBackdrop() {
  const reduceMotion = usePrefersReducedMotion();
  const { scrollY } = useScroll();
  const ySlow = useTransform(scrollY, [0, 400], [0, 60]);
  const yMid = useTransform(scrollY, [0, 400], [0, 110]);
  const opacity = useTransform(scrollY, [0, 320], [1, 0.35]);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={reduceMotion ? undefined : { opacity }}
      aria-hidden
    >
      <div className="animate-hero-drift absolute -right-[12%] top-[-8%] h-[70vmin] w-[70vmin] rounded-full bg-[radial-gradient(circle,rgb(30_58_138_/_28%),transparent_68%)]" />
      <div className="animate-hero-drift absolute -left-[18%] bottom-[-20%] h-[55vmin] w-[55vmin] rounded-full bg-[radial-gradient(circle,rgb(71_85_105_/_16%),transparent_70%)] [animation-delay:-6s]" />
      <div className="animate-hero-drift absolute top-[40%] right-[35%] h-[30vmin] w-[30vmin] rounded-full bg-[radial-gradient(circle,rgb(30_58_138_/_22%),transparent_70%)] [animation-delay:-11s]" />

      <motion.div style={reduceMotion ? undefined : { y: ySlow }}>
        <GlobeIcon className="absolute right-[6%] top-[18%] size-[min(42vw,18rem)] text-white/10 sm:right-[10%]" />
      </motion.div>
      <motion.div style={reduceMotion ? undefined : { y: yMid }}>
        <NetworkIcon className="absolute bottom-[18%] left-[8%] size-28 text-white/12 sm:size-36" />
        <OliveBranchIcon className="absolute right-[22%] bottom-[12%] size-20 text-olive/30 sm:size-24" />
      </motion.div>

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.14]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="hero-dots"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-dots)" />
      </svg>
    </motion.div>
  );
}
