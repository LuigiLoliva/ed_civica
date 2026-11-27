"use client";

import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useCallback, useEffect, useRef, type MouseEvent } from "react";

import { HeroBackdrop } from "@/components/home/hero-backdrop";
import { HeroGlobe } from "@/components/home/hero-globe";
import { Magnetic } from "@/components/motion/magnetic";
import { buttonVariants } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionEase, motionSpring } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

type CinematicHeroProps = {
  siteName: string;
  tagline: string;
  /** Frase-manifesto rivelata parola per parola durante lo scroll. */
  statement: string;
};

/** Quota dello scroll bloccato dedicata alla scena (il resto è la copertura). */
const SCENE_SHARE = 90 / 190;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Hero immersivo a scena bloccata: il wordmark attraversa il globo 3D,
 * poi lo scroll lo apre in due, il globo avanza e il manifesto si accende
 * parola per parola. La sezione successiva sale come un sipario.
 */
export function CinematicHero({
  siteName,
  tagline,
  statement,
}: CinematicHeroProps) {
  const reduceMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const wideRef = useRef(true);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      wideRef.current = query.matches;
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const sceneRaw = useTransform(scrollYProgress, [0, SCENE_SHARE], [0, 1]);
  const scene = useSpring(sceneRaw, {
    stiffness: 170,
    damping: 34,
    mass: 0.35,
  });

  const lineOneX = useTransform(
    scene,
    (v) => `${-(wideRef.current ? 16 : 34) * clamp01(v / 0.5)}vw`,
  );
  const lineTwoX = useTransform(
    scene,
    (v) => `${(wideRef.current ? 22 : 38) * clamp01(v / 0.5)}vw`,
  );
  const brandOpacity = useTransform(scene, [0.14, 0.42], [1, 0]);
  const brandBlur = useTransform(scene, [0.14, 0.42], [0, 14]);
  const brandFilter = useTransform(brandBlur, (v) =>
    v < 0.05 ? "none" : `blur(${v.toFixed(2)}px)`,
  );
  const brandPointer = useTransform(scene, (v) => (v > 0.2 ? "none" : "auto"));
  const supportOpacity = useTransform(scene, [0, 0.16], [1, 0]);
  const supportY = useTransform(scene, [0, 0.16], [0, -28]);

  const zoom = useTransform(
    scene,
    (v) => 1 + (wideRef.current ? 0.42 : 0.2) * clamp01(v / 0.6),
  );
  const globeX = useTransform(
    scene,
    (v) => `${(wideRef.current ? 11 : 0) * clamp01(v / 0.6)}%`,
  );
  const globeY = useTransform(
    scene,
    (v) => `${(wideRef.current ? 0 : -9) * clamp01(v / 0.6)}%`,
  );

  const statementOpacity = useTransform(scene, [0.36, 0.5], [0, 1]);
  const statementY = useTransform(scene, [0.36, 0.54], [48, 0]);
  const statementPointer = useTransform(scene, (v) =>
    v > 0.5 ? "auto" : "none",
  );
  const hintOpacity = useTransform(scene, [0, 0.08], [1, 0]);

  const coverDim = useTransform(scrollYProgress, [SCENE_SHARE, 1], [0, 0.6]);
  const stageScale = useTransform(scrollYProgress, [SCENE_SHARE, 1], [1, 0.94]);

  const mx = useMotionValue(0.6);
  const my = useMotionValue(0.45);
  const springX = useSpring(mx, motionSpring.soft);
  const springY = useSpring(my, motionSpring.soft);
  const glowX = useTransform(springX, (v) => `${v * 100}%`);
  const glowY = useTransform(springY, (v) => `${v * 100}%`);
  const glowBackground = useMotionTemplate`radial-gradient(680px circle at ${glowX} ${glowY}, rgb(0 158 219 / 22%), transparent 60%)`;

  const onMove = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      mx.set((event.clientX - rect.left) / rect.width);
      my.set((event.clientY - rect.top) / rect.height);
    },
    [mx, my],
  );

  const nameWords = siteName.trim().split(/\s+/);
  const lineOne = nameWords[0] ?? siteName;
  const lineTwo = nameWords.slice(1).join(" ");
  const statementWords = statement.trim().split(/\s+/);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative -mt-16 bg-hero text-hero-foreground",
        !reduceMotion && "mb-[-100svh] h-[290svh]",
      )}
    >
      <div
        data-header-theme="dark"
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0",
          reduceMotion ? "h-[100svh]" : "h-[190svh]",
        )}
        aria-hidden
      />

      <motion.div
        className={cn(
          "bg-hero-ocean isolate h-[100svh] overflow-hidden",
          reduceMotion ? "relative" : "sticky top-0",
        )}
        style={reduceMotion ? undefined : { scale: stageScale }}
        onMouseMove={reduceMotion ? undefined : onMove}
      >
        <HeroBackdrop />

        {!reduceMotion ? (
          <motion.div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{ background: glowBackground }}
            aria-hidden
          />
        ) : null}

        {/* Globo 3D: centro ottico della scena */}
        <motion.div
          className="absolute top-[33%] left-1/2 z-[2] w-[min(118vw,62svh)] lg:top-1/2 lg:left-[63%] lg:w-[min(60vw,92svh)]"
          style={reduceMotion ? undefined : { x: globeX, y: globeY }}
        >
          <motion.div
            className="-translate-x-1/2 -translate-y-1/2"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease: motionEase.out }}
          >
            <HeroGlobe zoom={reduceMotion ? undefined : zoom} />
          </motion.div>
        </motion.div>

        {/* Velo di leggibilità: su mobile sotto il wordmark, su desktop dietro il manifesto */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[58%] bg-gradient-to-t from-hero via-hero/55 to-transparent lg:hidden"
          aria-hidden
        />
        {!reduceMotion ? (
          <motion.div
            className="pointer-events-none absolute inset-0 z-[2] hidden bg-gradient-to-r from-hero/85 via-hero/35 to-transparent lg:block"
            style={{ opacity: statementOpacity }}
            aria-hidden
          />
        ) : null}

        {/* Brand: tipografia protagonista che attraversa il globo */}
        <motion.div
          className="absolute inset-0 z-[3] flex flex-col justify-end px-5 pb-20 sm:px-8 sm:pb-24 lg:justify-center lg:px-12 lg:pt-16 lg:pb-0"
          style={
            reduceMotion
              ? undefined
              : {
                  opacity: brandOpacity,
                  filter: brandFilter,
                  pointerEvents: brandPointer,
                }
          }
        >
          <div className="mx-auto w-full max-w-[100rem]">
            <motion.p
              className="mb-5 flex items-center gap-3 text-[0.66rem] font-semibold tracking-[0.34em] text-sky-200/85 uppercase sm:text-xs"
              initial={reduceMotion ? false : { opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.9, ease: motionEase.out }}
            >
              <span className="h-px w-10 bg-sky-200/60" aria-hidden />
              Agenda 2030 · Obiettivi 16 &amp; 17
            </motion.p>

            <h1
              aria-label={siteName}
              className="font-heading text-[clamp(4.25rem,min(21vw,30svh),14.5rem)] leading-[0.8] font-semibold tracking-[-0.035em]"
            >
              <motion.span
                className="block"
                style={reduceMotion ? undefined : { x: lineOneX }}
              >
                <MaskedWord
                  text={lineOne}
                  delay={0.15}
                  animate={!reduceMotion}
                />
              </motion.span>
              {lineTwo ? (
                <>
                  {" "}
                  <motion.span
                    className="block pl-[0.5em] text-sky-100 lg:pl-[0.95em]"
                    style={reduceMotion ? undefined : { x: lineTwoX }}
                  >
                    <MaskedWord
                      text={lineTwo}
                      delay={0.36}
                      animate={!reduceMotion}
                    />
                  </motion.span>
                </>
              ) : null}
            </h1>

            <motion.div
              style={
                reduceMotion
                  ? undefined
                  : { opacity: supportOpacity, y: supportY }
              }
            >
              <motion.p
                className="mt-7 max-w-md text-base text-white/75 text-pretty sm:mt-9 sm:text-lg"
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.9,
                  delay: 1.05,
                  ease: motionEase.out,
                }}
              >
                {tagline}
              </motion.p>

              <motion.div
                className="mt-7 flex flex-wrap gap-3 sm:mt-9"
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2, ease: motionEase.out }}
              >
                <Magnetic strength={18} radius={120}>
                  <Link
                    href="/articoli"
                    data-cursor="cta"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "group h-12 gap-3 rounded-full bg-white px-6 text-sm text-hero hover:bg-white/90 sm:h-14 sm:px-8 sm:text-base",
                    )}
                  >
                    Leggi gli articoli
                    <span
                      aria-hidden
                      className="transition-transform duration-500 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                </Magnetic>
                <Magnetic strength={14} radius={110}>
                  <Link
                    href="/gioca"
                    data-cursor="link"
                    className={cn(
                      buttonVariants({ size: "lg", variant: "outline" }),
                      "h-12 rounded-full border-white/35 bg-transparent px-6 text-sm text-white hover:bg-white/10 hover:text-white sm:h-14 sm:px-8 sm:text-base",
                    )}
                  >
                    Metti alla prova le tue conoscenze
                  </Link>
                </Magnetic>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Manifesto: si accende parola per parola con lo scroll */}
        {!reduceMotion ? (
          <motion.div
            className="absolute inset-0 z-[4] flex flex-col justify-end px-5 pb-16 sm:px-8 sm:pb-20 lg:justify-center lg:px-12 lg:pt-16 lg:pb-0"
            style={{
              opacity: statementOpacity,
              y: statementY,
              pointerEvents: statementPointer,
            }}
          >
            <div className="mx-auto w-full max-w-[100rem]">
              <p className="mb-5 flex items-center gap-3 text-[0.66rem] font-semibold tracking-[0.34em] text-sky-200/85 uppercase sm:text-xs">
                <span className="h-px w-10 bg-sky-200/60" aria-hidden />
                Il progetto
              </p>
              <p className="font-heading max-w-[19ch] text-[clamp(1.9rem,min(4.9vw,8.4svh),4.6rem)] leading-[1.06] font-semibold tracking-[-0.02em] text-balance">
                {statementWords.map((word, index) => (
                  <ScrubWord
                    key={`${word}-${index}`}
                    progress={scene}
                    index={index}
                    total={statementWords.length}
                  >
                    {word}
                  </ScrubWord>
                ))}
              </p>
              <Link
                href="/progetto"
                data-cursor="link"
                className="group mt-8 inline-flex items-center gap-3 text-sm font-semibold tracking-wide text-white"
              >
                <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:100%_1px] bg-left-bottom bg-no-repeat pb-1">
                  Scopri il progetto
                </span>
                <span
                  aria-hidden
                  className="transition-transform duration-500 group-hover:translate-x-1.5"
                >
                  →
                </span>
              </Link>
            </div>
          </motion.div>
        ) : null}

        {!reduceMotion ? (
          <motion.div
            className="pointer-events-none absolute inset-x-5 bottom-6 z-[5] flex items-end justify-between sm:inset-x-8 lg:inset-x-12"
            style={{ opacity: hintOpacity }}
            aria-hidden
          >
            <motion.div
              className="flex items-center gap-3 text-white/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.7, duration: 0.7 }}
            >
              <span className="hero-scroll-pulse block h-9 w-px bg-gradient-to-b from-white/80 to-transparent" />
              <span className="text-[10px] font-medium tracking-[0.24em] uppercase">
                Scorri
              </span>
            </motion.div>
            <motion.p
              className="hidden text-[10px] font-medium tracking-[0.24em] text-white/45 uppercase pointer-fine:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.1, duration: 0.7 }}
            >
              Trascina il globo · Clicca per accendere la rete
            </motion.p>
          </motion.div>
        ) : null}

        {!reduceMotion ? (
          <motion.div
            className="pointer-events-none absolute inset-0 z-[6] bg-[#020a14]"
            style={{ opacity: coverDim }}
            aria-hidden
          />
        ) : null}
      </motion.div>

      {reduceMotion ? (
        <div className="relative bg-hero px-5 pt-16 pb-28 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-[100rem]">
            <p className="mb-5 text-xs font-semibold tracking-[0.34em] text-sky-200/85 uppercase">
              Il progetto
            </p>
            <p className="font-heading max-w-[22ch] text-[clamp(1.9rem,4.6vw,4.25rem)] leading-[1.08] font-semibold text-balance">
              {statement}
            </p>
            <Link
              href="/progetto"
              className="mt-8 inline-flex items-center gap-3 text-sm font-semibold text-white underline underline-offset-4"
            >
              Scopri il progetto <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}

/** Parola del wordmark: sale intera da una maschera (kerning intatto). */
function MaskedWord({
  text,
  delay,
  animate,
}: {
  text: string;
  delay: number;
  animate: boolean;
}) {
  if (!animate) return <>{text}</>;

  return (
    <span className="-my-[0.25em] inline-block overflow-hidden py-[0.25em] align-top">
      <motion.span
        className="inline-block origin-bottom-left will-change-transform"
        initial={{ y: "135%", rotate: 5 }}
        animate={{ y: "0%", rotate: 0 }}
        transition={{ duration: 1.35, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {text}
      </motion.span>
    </span>
  );
}

function ScrubWord({
  children,
  progress,
  index,
  total,
}: {
  children: string;
  progress: MotionValue<number>;
  index: number;
  total: number;
}) {
  const start = 0.44 + (index / total) * 0.4;
  const end = start + (0.4 / total) * 2.4;
  const opacity = useTransform(progress, [start, end], [0.16, 1]);

  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{" "}
    </>
  );
}
