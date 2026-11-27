"use client";

import Link from "next/link";
import {
  useCallback,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { Magnetic } from "@/components/motion/magnetic";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cursorData } from "@/lib/motion/tokens";
import { siteConfig } from "@/lib/site-config";

import {
  createScalesSim,
  emitScalesFeedback,
  hitScales,
  renderScales,
  type ScalePart,
  type ScalesSim,
} from "./goal-16-scene";
import { resolveFonts } from "./scene3d";
import {
  syncStageGlow,
  useCanvasStage,
  type StageFrame,
} from "./use-canvas-stage";

import styles from "./goal-16-section.module.css";

const PILLARS = [
  {
    id: "pace",
    index: "01",
    title: "Pace",
    copy: "Società inclusive che prevengono il conflitto e proteggono i diritti.",
    part: "left",
    left: 3,
    right: 1,
    status: "La bilancia pende verso la pace",
  },
  {
    id: "giustizia",
    index: "02",
    title: "Giustizia",
    copy: "Accesso equo alla giustizia per tutte le persone, senza barriere.",
    part: "center",
    left: 2,
    right: 2,
    status: "Piatti in perfetto equilibrio",
  },
  {
    id: "istituzioni",
    index: "03",
    title: "Istituzioni",
    copy: "Organi efficaci, responsabili e trasparenti al servizio della comunità.",
    part: "right",
    left: 1,
    right: 3,
    status: "La bilancia pende verso le istituzioni",
  },
] as const;

type Pillar = (typeof PILLARS)[number];
type PillarId = Pillar["id"];

const PART_LABELS: Record<ScalePart, string> = {
  left: "Pace",
  center: "Giustizia",
  right: "Istituzioni",
};

const PILLAR_BY_PART: Record<ScalePart, PillarId> = {
  left: "pace",
  center: "giustizia",
  right: "istituzioni",
};

export function Goal16Section() {
  const reduceMotion = usePrefersReducedMotion();
  const titleId = useId();
  const simRef = useRef<ScalesSim | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const canvasHoverRef = useRef<ScalePart | null>(null);
  const railHoverRef = useRef<ScalePart | null>(null);
  const fontsRef = useRef<{ serif: string; sans: string } | null>(null);
  const timeRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<PillarId>("giustizia");

  const pillar: Pillar = PILLARS.find((p) => p.id === active) ?? PILLARS[1];

  const draw = useCallback(
    (frame: StageFrame) => {
      const sim = (simRef.current ??= createScalesSim());
      const fonts = (fontsRef.current ??= resolveFonts(frame.ctx.canvas));
      timeRef.current = frame.time;
      renderScales(frame, sim, {
        left: pillar.left,
        right: pillar.right,
        activePart: pillar.part,
        hoverPart: railHoverRef.current ?? canvasHoverRef.current,
        pointer: pointerRef.current,
        reduceMotion,
        fonts,
        labels: PART_LABELS,
      });
      syncStageGlow(stageRef.current, lightRef.current, sim.view, sim.light);
    },
    [pillar, reduceMotion],
  );

  const { canvasRef, entered } = useCanvasStage(draw);

  const select = useCallback(
    (id: PillarId) => {
      setActive(id);
      const next = PILLARS.find((p) => p.id === id);
      if (next && simRef.current && !reduceMotion) {
        emitScalesFeedback(simRef.current, next.part, timeRef.current);
      }
    },
    [reduceMotion],
  );

  const toCanvas = (event: ReactPointerEvent<HTMLElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const point = toCanvas(event);
    pointerRef.current = point;
    const canvas = canvasRef.current;
    if (!point || !canvas || !simRef.current) return;
    const part =
      event.target === canvas
        ? hitScales(simRef.current, point.x, point.y)
        : null;
    canvasHoverRef.current = part;
    canvas.style.cursor = part ? "pointer" : "";
  };

  const onPointerLeave = () => {
    pointerRef.current = null;
    canvasHoverRef.current = null;
  };

  const onCanvasClick = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const point = toCanvas(event);
    if (!point || !simRef.current) return;
    const part = hitScales(simRef.current, point.x, point.y);
    if (part) select(PILLAR_BY_PART[part]);
  };

  return (
    <section
      className={`${styles.experience} ${entered ? styles.entered : ""}`}
      aria-labelledby={titleId}
      data-goal="16"
      data-webgl-stage
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <span className={styles.watermark} aria-hidden>
        16
      </span>

      <div className={styles.stage} ref={stageRef}>
        <div className={styles.aura} aria-hidden />
        <div className={styles.light} ref={lightRef} aria-hidden />
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          role="img"
          aria-label={`Bilancia tridimensionale della giustizia. ${pillar.status}.`}
          data-cursor={cursorData.values.link}
          onPointerUp={onCanvasClick}
        />
      </div>

      <div className={styles.overlay}>
        <div className={styles.copy}>
          <p className={`${styles.eyebrow} ${styles.reveal}`}>
            Obiettivo 16 · Agenda 2030
          </p>
          <h3 id={titleId} className={styles.title}>
            <span className={styles.line}>
              <span>Pace, giustizia</span>
            </span>{" "}
            <span className={styles.line}>
              <span className={styles.titleAccent}>e istituzioni solide</span>
            </span>
          </h3>
          <p className={`${styles.lead} ${styles.reveal}`}>
            Promuovere società pacifiche e inclusive, garantire l&apos;accesso
            alla giustizia e costruire istituzioni efficaci, responsabili e
            trasparenti a tutti i livelli.
          </p>

          <div
            className={`${styles.rail} ${styles.reveal}`}
            role="group"
            aria-label="Pilastri dell'Obiettivo 16"
          >
            {PILLARS.map((item) => {
              const isActive = item.id === active;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.pillar} ${isActive ? styles.pillarActive : ""}`}
                  aria-pressed={isActive}
                  data-cursor={cursorData.values.link}
                  onClick={() => select(item.id)}
                  onPointerEnter={() => {
                    railHoverRef.current = item.part;
                  }}
                  onPointerLeave={() => {
                    railHoverRef.current = null;
                  }}
                  onFocus={() => {
                    railHoverRef.current = item.part;
                  }}
                  onBlur={() => {
                    railHoverRef.current = null;
                  }}
                >
                  <span className={styles.pillarMeta}>
                    <span className={styles.pillarIndex}>{item.index}</span>
                    <span className={styles.pillarTitle}>{item.title}</span>
                  </span>
                  <span className={styles.pillarCopy}>
                    <span>{item.copy}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={`${styles.footer} ${styles.reveal}`}>
          <Magnetic strength={12} radius={100}>
            <Link
              href={`/argomenti/${siteConfig.goals[16].slug}`}
              className={styles.cta}
              data-cursor={cursorData.values.cta}
            >
              Scopri l&apos;Obiettivo 16
              <span className={styles.ctaArrow} aria-hidden>
                →
              </span>
            </Link>
          </Magnetic>
          <p className={styles.status} aria-live="polite">
            <span className={styles.statusValue}>{pillar.status}</span>
            <span className={styles.statusHint}>
              Sfiora o tocca i piatti: la bilancia risponde
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
