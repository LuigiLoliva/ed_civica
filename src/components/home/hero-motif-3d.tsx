"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useCallback, type PointerEvent, type ReactNode } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionSpring } from "@/lib/motion/tokens";

/**
 * Motivo 3D centrale: sfera ONU + orbite pace / giustizia / cooperazione.
 * Interattivo al mouse (profondità e luce); statico con prefers-reduced-motion.
 */
export function HeroMotif3D() {
  const reduceMotion = usePrefersReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, motionSpring.soft);
  const springY = useSpring(my, motionSpring.soft);

  const rotateY = useTransform(springX, [-0.5, 0.5], [-28, 28]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [18, -18]);
  const lightX = useTransform(springX, [-0.5, 0.5], [28, 72]);
  const lightY = useTransform(springY, [-0.5, 0.5], [22, 68]);
  const sphereGlow = useMotionTemplate`radial-gradient(circle at ${lightX}% ${lightY}%, #3dadeb 0%, #0072ba 28%, #004e7a 58%, #051a2e 100%)`;
  const rimLight = useMotionTemplate`radial-gradient(circle at ${lightX}% ${lightY}%, rgb(255 255 255 / 55%), transparent 42%)`;

  const onMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (reduceMotion) return;
      const rect = event.currentTarget.getBoundingClientRect();
      mx.set((event.clientX - rect.left) / rect.width - 0.5);
      my.set((event.clientY - rect.top) / rect.height - 0.5);
    },
    [mx, my, reduceMotion],
  );

  const onLeave = useCallback(() => {
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  return (
    <div
      className="hero-motif relative aspect-square w-full touch-none select-none"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      data-cursor="media"
      role="img"
      aria-label="Motivo tridimensionale: pace, giustizia e cooperazione"
    >
      {/* Alone atmosferico */}
      <div
        className="pointer-events-none absolute inset-[-18%] rounded-full bg-[radial-gradient(circle,rgb(0_158_219_/_35%),transparent_68%)] blur-2xl"
        aria-hidden
      />

      <motion.div
        className="relative h-full w-full"
        style={
          reduceMotion
            ? { perspective: 900 }
            : {
                perspective: 900,
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }
        }
      >
        {/* Anello esterno giustizia */}
        <motion.div
          className="hero-motif-ring absolute inset-[6%] rounded-full border border-sky-200/25"
          style={{ transform: "translateZ(-40px) rotateX(68deg)" }}
          aria-hidden
        />
        <motion.div
          className="hero-motif-ring absolute inset-[14%] rounded-full border border-primary/30"
          style={{ transform: "translateZ(20px) rotateX(72deg) rotateZ(25deg)" }}
          aria-hidden
        />
        <motion.div
          className="hero-motif-ring absolute inset-[22%] rounded-full border border-olive/35"
          style={{ transform: "translateZ(55px) rotateX(78deg) rotateZ(-40deg)" }}
          aria-hidden
        />

        {/* Sfera centrale */}
        <div
          className="absolute inset-[28%] overflow-hidden rounded-full shadow-[0_30px_80px_-20px_rgb(0_104_157_/_70%)]"
          style={{ transform: "translateZ(80px)" }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: sphereGlow }}
          />
          <motion.div
            className="absolute inset-0 mix-blend-screen"
            style={{ background: rimLight }}
          />
          {/* Meridiani stilizzati */}
          <svg
            className="absolute inset-0 h-full w-full opacity-40"
            viewBox="0 0 100 100"
            aria-hidden
          >
            <ellipse
              cx="50"
              cy="50"
              rx="48"
              ry="48"
              fill="none"
              stroke="white"
              strokeWidth="0.4"
              opacity="0.5"
            />
            <ellipse
              cx="50"
              cy="50"
              rx="22"
              ry="48"
              fill="none"
              stroke="white"
              strokeWidth="0.35"
            />
            <ellipse
              cx="50"
              cy="50"
              rx="48"
              ry="18"
              fill="none"
              stroke="white"
              strokeWidth="0.35"
            />
            <path
              d="M2 50h96M50 2v96"
              stroke="white"
              strokeWidth="0.3"
              opacity="0.55"
            />
          </svg>
        </div>

        {/* Nodo pace (ulivo) — esterno basso, fuori dal blocco tipografico */}
        <OrbitNode
          className="-left-[2%] top-[58%] lg:left-[8%] lg:top-[72%]"
          depth={110}
          label="Pace"
          hue="olive"
          reduceMotion={reduceMotion}
        >
          <OliveMark />
        </OrbitNode>

        {/* Nodo giustizia (bilancia) */}
        <OrbitNode
          className="right-[2%] top-[16%]"
          depth={130}
          label="Giustizia"
          hue="goal16"
          reduceMotion={reduceMotion}
        >
          <ScalesMark />
        </OrbitNode>

        {/* Nodo cooperazione (rete) */}
        <OrbitNode
          className="right-[18%] bottom-[6%]"
          depth={95}
          label="Cooperazione"
          hue="onu"
          reduceMotion={reduceMotion}
        >
          <NetworkMark />
        </OrbitNode>

        {/* Specchio pavimento */}
        <div
          className="pointer-events-none absolute inset-x-[18%] bottom-[-2%] h-[18%] rounded-[100%] bg-[radial-gradient(ellipse,rgb(0_158_219_/_28%),transparent_70%)] blur-md"
          style={{ transform: "translateZ(-10px) rotateX(80deg)" }}
          aria-hidden
        />
      </motion.div>
    </div>
  );
}

function OrbitNode({
  children,
  className,
  depth,
  label,
  hue,
  reduceMotion,
}: {
  children: ReactNode;
  className: string;
  depth: number;
  label: string;
  hue: "olive" | "goal16" | "onu";
  reduceMotion: boolean;
}) {
  const glow =
    hue === "olive"
      ? "bg-olive/25 ring-olive/40"
      : hue === "goal16"
        ? "bg-goal-16/30 ring-sky-300/35"
        : "bg-primary/25 ring-primary/40";

  return (
    <motion.div
      className={`absolute ${className} z-10`}
      style={{
        transform: `translateZ(${depth}px)`,
        transformStyle: "preserve-3d",
      }}
      animate={
        reduceMotion
          ? undefined
          : {
              y: [0, -6, 0],
            }
      }
      transition={
        reduceMotion
          ? undefined
          : {
              duration: 4.2 + depth / 80,
              repeat: Infinity,
              ease: "easeInOut",
            }
      }
    >
      <div
        className={`flex size-14 items-center justify-center rounded-full ring-1 backdrop-blur-md sm:size-16 ${glow}`}
        title={label}
      >
        <span className="sr-only">{label}</span>
        {children}
      </div>
    </motion.div>
  );
}

function OliveMark() {
  return (
    <svg viewBox="0 0 32 32" className="size-7 text-olive" aria-hidden>
      <path
        d="M8 24c5-1 11-6 13-13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <ellipse cx="14" cy="12" rx="2.2" ry="3.6" transform="rotate(-30 14 12)" fill="currentColor" opacity="0.7" />
      <ellipse cx="19" cy="10" rx="2.2" ry="3.6" transform="rotate(-12 19 10)" fill="currentColor" opacity="0.85" />
      <ellipse cx="23.5" cy="11" rx="2" ry="3.2" fill="currentColor" />
    </svg>
  );
}

function ScalesMark() {
  return (
    <svg viewBox="0 0 32 32" className="size-7 text-sky-100" aria-hidden>
      <path d="M16 6v18M10 24h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 12h16M8 12l-3 7h6l-3-7zm16 0l-3 7h6l-3-7z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="16" cy="6" r="1.6" fill="currentColor" />
    </svg>
  );
}

function NetworkMark() {
  return (
    <svg viewBox="0 0 32 32" className="size-7 text-primary" aria-hidden>
      <circle cx="8" cy="10" r="2.2" fill="currentColor" />
      <circle cx="24" cy="8" r="2.2" fill="currentColor" />
      <circle cx="16" cy="22" r="2.4" fill="currentColor" />
      <circle cx="24" cy="20" r="1.8" fill="currentColor" opacity="0.8" />
      <path
        d="M8 10l8 12M24 8l-8 14M24 8L8 10M24 20l-8 2"
        stroke="currentColor"
        strokeWidth="1.3"
        opacity="0.75"
      />
    </svg>
  );
}
