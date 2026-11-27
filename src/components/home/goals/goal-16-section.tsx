"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { Magnetic } from "@/components/motion/magnetic";
import { Spotlight } from "@/components/motion/spotlight";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cursorData } from "@/lib/motion/tokens";
import { siteConfig } from "@/lib/site-config";

import styles from "./goal-16-section.module.css";

const PILLARS = [
  {
    id: "pace",
    title: "Pace",
    copy: "Società inclusive che prevengono il conflitto e proteggono i diritti.",
    tilt: -14,
  },
  {
    id: "giustizia",
    title: "Giustizia",
    copy: "Accesso equo alla giustizia per tutte le persone, senza barriere.",
    tilt: 0,
  },
  {
    id: "istituzioni",
    title: "Istituzioni",
    copy: "Organi efficaci, responsabili e trasparenti al servizio della comunità.",
    tilt: 14,
  },
] as const;

type PillarId = (typeof PILLARS)[number]["id"];

export function Goal16Section() {
  const reduceMotion = usePrefersReducedMotion();
  const titleId = useId();
  const [active, setActive] = useState<PillarId>("giustizia");
  const [idleTilt, setIdleTilt] = useState(0);

  const activePillar = PILLARS.find((p) => p.id === active) ?? PILLARS[1];
  const tilt = reduceMotion ? 0 : activePillar.tilt + idleTilt * 0.35;

  useEffect(() => {
    if (reduceMotion) return;
    let raf = 0;
    const tick = (t: number) => {
      setIdleTilt(Math.sin(t / 1800) * 2.2);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (reduceMotion) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      setIdleTilt((x - 0.5) * 10);
    },
    [reduceMotion],
  );

  const onPointerLeave = useCallback(() => {
    if (reduceMotion) return;
    setIdleTilt(0);
  }, [reduceMotion]);

  return (
    <Spotlight
      className={styles.section}
      color="rgb(0 158 219 / 22%)"
      size={520}
    >
      <section aria-labelledby={titleId} data-goal="16">
        <div className={styles.grid}>
          <div>
            <p className={styles.eyebrow}>Obiettivo 16 · Agenda 2030</p>
            <h3 id={titleId} className={styles.title}>
              {siteConfig.goals[16].title}
            </h3>
            <p className={styles.lead}>
              Promuovere società pacifiche e inclusive, garantire l&apos;accesso
              alla giustizia e costruire istituzioni efficaci, responsabili e
              trasparenti a tutti i livelli.
            </p>

            <div
              className={styles.pillars}
              role="group"
              aria-label="Pilastri dell'Obiettivo 16"
            >
              {PILLARS.map((pillar) => {
                const isActive = pillar.id === active;
                return (
                  <button
                    key={pillar.id}
                    type="button"
                    className={`${styles.pillar} ${isActive ? styles.pillarActive : ""}`}
                    aria-pressed={isActive}
                    data-cursor={cursorData.values.link}
                    onClick={() => setActive(pillar.id)}
                    onFocus={() => setActive(pillar.id)}
                  >
                    <span className={styles.pillarIndex}>Pilastro</span>
                    <span className={styles.pillarTitle}>{pillar.title}</span>
                    <p className={styles.pillarCopy}>{pillar.copy}</p>
                  </button>
                );
              })}
            </div>

            <Magnetic strength={10} radius={90} className={styles.ctaWrap}>
              <Link
                href="/argomenti/obiettivo-16"
                className={styles.cta}
                data-cursor={cursorData.values.cta}
              >
                Scopri l&apos;Obiettivo 16
                <span aria-hidden="true">→</span>
              </Link>
            </Magnetic>
          </div>

          <div className={styles.stage}>
            <div className={styles.glow} aria-hidden />
            <div className={styles.orbitRing} aria-hidden />
            <div
              className={styles.balance}
              onPointerMove={onPointerMove}
              onPointerLeave={onPointerLeave}
              role="img"
              aria-label={`Bilancia della giustizia inclinata verso ${activePillar.title}`}
              data-cursor={cursorData.values.media}
            >
              <svg
                className={styles.svg}
                viewBox="0 0 320 340"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="g16-metal"
                    x1="148"
                    y1="168"
                    x2="172"
                    y2="308"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#e8f6fc" />
                    <stop offset="100%" stopColor="#7ec8e3" />
                  </linearGradient>
                  <linearGradient
                    id="g16-beam"
                    x1="48"
                    y1="78"
                    x2="272"
                    y2="78"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#9fd7ea" />
                    <stop offset="50%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#7ec8e3" />
                  </linearGradient>
                  <linearGradient id="g16-pan" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#9fd7ea" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#5f7d52" stopOpacity="0.75" />
                  </linearGradient>
                </defs>

                <path
                  d="M110 308h100l-10 18H120l-10-18z"
                  fill="url(#g16-metal)"
                  opacity="0.85"
                />
                <rect
                  x="148"
                  y="168"
                  width="24"
                  height="140"
                  rx="4"
                  fill="url(#g16-metal)"
                  opacity="0.9"
                />

                <circle cx="160" cy="78" r="10" fill="#fff" opacity="0.95" />
                <circle cx="160" cy="78" r="5" fill="#009edb" />

                <g
                  className={styles.beam}
                  style={{ transform: `rotate(${tilt}deg)` }}
                >
                  <path
                    d="M48 78h224"
                    stroke="url(#g16-beam)"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M160 78V98"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.7"
                  />

                  {/* Pans hang level via counter-rotation (no canceling translate) */}
                  <g className={styles.pan} transform={`rotate(${-tilt} 70 78)`}>
                    <path
                      d="M70 78v52"
                      stroke="#cfe8f4"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M42 130c8 22 48 22 56 0"
                      stroke="url(#g16-pan)"
                      strokeWidth="3"
                      fill="rgb(0 158 219 / 18%)"
                    />
                    <ellipse
                      cx="70"
                      cy="128"
                      rx="28"
                      ry="7"
                      fill="rgb(255 255 255 / 18%)"
                    />
                    <ellipse
                      cx="62"
                      cy="118"
                      rx="5"
                      ry="9"
                      transform="rotate(-28 62 118)"
                      fill="#8fad7f"
                      opacity="0.85"
                    />
                    <ellipse
                      cx="78"
                      cy="116"
                      rx="5"
                      ry="9"
                      transform="rotate(18 78 116)"
                      fill="#5f7d52"
                      opacity="0.8"
                    />
                  </g>

                  <g
                    className={styles.pan}
                    transform={`rotate(${-tilt} 250 78)`}
                  >
                    <path
                      d="M250 78v52"
                      stroke="#cfe8f4"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M222 130c8 22 48 22 56 0"
                      stroke="url(#g16-pan)"
                      strokeWidth="3"
                      fill="rgb(0 104 157 / 22%)"
                    />
                    <ellipse
                      cx="250"
                      cy="128"
                      rx="28"
                      ry="7"
                      fill="rgb(255 255 255 / 18%)"
                    />
                    <rect
                      x="238"
                      y="108"
                      width="24"
                      height="18"
                      rx="2"
                      fill="#e8f6fc"
                      opacity="0.9"
                    />
                    <path
                      d="M242 113h16M242 118h12M242 123h14"
                      stroke="#00689d"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </g>
                </g>

                <text
                  x="160"
                  y="292"
                  textAnchor="middle"
                  fill="rgb(255 255 255 / 78%)"
                  fontSize="13"
                  fontFamily="var(--font-sans), system-ui, sans-serif"
                  letterSpacing="0.14em"
                >
                  {activePillar.title.toUpperCase()}
                </text>
              </svg>
            </div>
            <p className={styles.hint}>
              Scegli un pilastro o muovi il cursore sulla bilancia
            </p>
          </div>
        </div>
      </section>
    </Spotlight>
  );
}
