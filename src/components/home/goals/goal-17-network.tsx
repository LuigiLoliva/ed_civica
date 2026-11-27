"use client";

import Link from "next/link";
import {
  useCallback,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { Magnetic } from "@/components/motion/magnetic";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cursorData } from "@/lib/motion/tokens";
import { siteConfig } from "@/lib/site-config";

import {
  createNetworkSim,
  networkPointerDown,
  networkPointerMove,
  networkPointerUp,
  renderNetwork,
  type NetworkSim,
} from "./goal-17-scene";
import { resolveFonts, type Rgb } from "./scene3d";
import {
  syncStageGlow,
  useCanvasStage,
  type StageFrame,
} from "./use-canvas-stage";

import styles from "./goal-17-network.module.css";

type Actor = {
  id: string;
  label: string;
  copy: string;
  color: Rgb;
  az: number;
  el: number;
};

const STEP = Math.PI / 3;
const LIFT = 0.66;
const TWIST = 0.3;

/* Antiprisma: elevazioni alternate, così i nodi non si coprono a vicenda. */
const ACTORS: readonly Actor[] = [
  {
    id: "cittadini",
    label: "Cittadini",
    copy: "Partecipazione, diritti e responsabilità quotidiane nella comunità.",
    color: [147, 197, 253],
    az: 0,
    el: LIFT,
  },
  {
    id: "scuole",
    label: "Scuole",
    copy: "Educazione civica, ricerca e dialogo intergenerazionale.",
    color: [30, 58, 138],
    az: STEP + TWIST,
    el: -LIFT,
  },
  {
    id: "governi",
    label: "Governi",
    copy: "Politiche pubbliche, cooperazione internazionale e accountability.",
    color: [23, 37, 84],
    az: STEP * 2,
    el: LIFT,
  },
  {
    id: "organizzazioni",
    label: "Organizzazioni",
    copy: "ONU e organismi multilaterali che coordinano l'azione globale.",
    color: [217, 119, 6],
    az: STEP * 3 + TWIST,
    el: -LIFT,
  },
  {
    id: "imprese",
    label: "Imprese",
    copy: "Innovazione responsabile, lavoro dignitoso e risorse condivise.",
    color: [245, 158, 11],
    az: STEP * 4,
    el: LIFT,
  },
  {
    id: "associazioni",
    label: "Associazioni",
    copy: "Terzo settore e reti locali che collegano bisogni e soluzioni.",
    color: [100, 116, 139],
    az: STEP * 5 + TWIST,
    el: -LIFT,
  },
];

const EDGES: readonly (readonly [number, number])[] = [
  [0, 1],
  [0, 5],
  [0, 2],
  [1, 3],
  [1, 5],
  [2, 3],
  [2, 4],
  [3, 4],
  [3, 5],
  [4, 5],
  [1, 4],
  [2, 5],
];

const linksOf = (index: number) =>
  EDGES.filter(([a, b]) => a === index || b === index).length;

export function Goal17Network() {
  const reduceMotion = usePrefersReducedMotion();
  const titleId = useId();
  const simRef = useRef<NetworkSim | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const fontsRef = useRef<{ serif: string; sans: string } | null>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef({ w: 0, h: 0, free: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState<number | null>(3);
  const [dragging, setDragging] = useState(false);

  const focusedActor = focused === null ? null : ACTORS[focused];
  const linkCount = focused === null ? EDGES.length : linksOf(focused);

  const draw = useCallback(
    (frame: StageFrame) => {
      const sim = (simRef.current ??= createNetworkSim(ACTORS, EDGES));
      const fonts = (fontsRef.current ??= resolveFonts(frame.ctx.canvas));
      const layout = layoutRef.current;
      if (layout.w !== frame.w || layout.h !== frame.h) {
        const canvasRect = frame.ctx.canvas.getBoundingClientRect();
        const copyRect = copyRef.current?.getBoundingClientRect();
        const sideBySide =
          copyRect !== undefined &&
          copyRect.bottom > canvasRect.top + 40 &&
          copyRect.top < canvasRect.bottom - 40;
        layoutRef.current = {
          w: frame.w,
          h: frame.h,
          free: sideBySide ? copyRect.left - canvasRect.left : frame.w,
        };
      }
      renderNetwork(frame, sim, {
        actors: ACTORS,
        edges: EDGES,
        focused,
        pointer: pointerRef.current,
        reduceMotion,
        fonts,
        freeWidth: layoutRef.current.free,
      });
      if (sim.cam) {
        syncStageGlow(stageRef.current, lightRef.current, sim.cam, sim.light);
      }
    },
    [focused, reduceMotion],
  );

  const { canvasRef, entered } = useCanvasStage(draw);

  const focus = useCallback((index: number | null) => {
    if (simRef.current) simRef.current.freeUntil = 0;
    setFocused(index);
  }, []);

  const toCanvas = (event: ReactPointerEvent<HTMLElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const onSectionPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    pointerRef.current = toCanvas(event);
  };

  const onSectionPointerLeave = () => {
    pointerRef.current = null;
    if (simRef.current) simRef.current.hover = null;
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const point = toCanvas(event);
    const sim = simRef.current;
    if (!point || !sim) return;
    networkPointerDown(sim, point.x, point.y);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* pointer già rilasciato */
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const point = toCanvas(event);
    const sim = simRef.current;
    if (!point || !sim) return;
    if (reduceMotion && sim.drag) return;
    networkPointerMove(sim, point.x, point.y);
    if (sim.drag?.moved) {
      if (!dragging) setDragging(true);
    } else {
      event.currentTarget.style.cursor = sim.hover !== null ? "pointer" : "";
    }
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const sim = simRef.current;
    if (!sim) return;
    const result = networkPointerUp(sim);
    setDragging(false);
    if (event.type === "pointercancel" || !result) return;
    focus(result.click === "hub" ? result.index : null);
  };

  return (
    <section
      className={`${styles.experience} ${entered ? styles.entered : ""}`}
      aria-labelledby={titleId}
      data-goal="17"
      data-webgl-stage
      onPointerMove={onSectionPointerMove}
      onPointerLeave={onSectionPointerLeave}
    >
      <span className={styles.watermark} aria-hidden>
        17
      </span>

      <div className={styles.intro} ref={copyRef}>
        <p className={`${styles.eyebrow} ${styles.reveal}`}>
          Obiettivo 17 · Agenda 2030
        </p>
        <h3 id={titleId} className={styles.title}>
          <span className={styles.line}>
            <span>Partnership</span>
          </span>{" "}
          <span className={styles.line}>
            <span className={styles.titleAccent}>per gli obiettivi</span>
          </span>
        </h3>
        <p className={`${styles.lead} ${styles.reveal}`}>
          Rafforzare i mezzi di attuazione e rivitalizzare la partnership
          globale: nessuna sfida si affronta da soli.
        </p>
      </div>

      <div className={styles.stage} ref={stageRef}>
        <div className={styles.aura} aria-hidden />
        <div className={styles.light} ref={lightRef} aria-hidden />
        <canvas
          ref={canvasRef}
          className={`${styles.canvas} ${dragging ? styles.canvasDragging : ""}`}
          role="img"
          aria-label="Rete tridimensionale interattiva di collaborazione tra cittadini, scuole, governi, organizzazioni, imprese e associazioni"
          data-cursor={cursorData.values.link}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
        <div className={`${styles.hud} ${styles.reveal}`}>
          <p className={styles.hudBadge}>
            <span key={linkCount} className={styles.hudValue}>
              {linkCount}
            </span>
            <span className={styles.hudLabel}>legami attivi</span>
          </p>
          <p className={styles.hudHint}>
            Trascina per ruotare la rete · tocca un nodo
          </p>
        </div>
      </div>

      <div className={`${styles.panel} ${styles.reveal}`}>
        <div
          className={styles.actors}
          role="group"
          aria-label="Attori della partnership"
        >
          {ACTORS.map((actor, index) => {
            const isActive = focused === index;
            return (
              <button
                key={actor.id}
                type="button"
                className={`${styles.actor} ${isActive ? styles.actorActive : ""}`}
                style={{ "--actor": actor.color.join(" ") } as CSSProperties}
                aria-pressed={isActive}
                data-cursor={cursorData.values.link}
                onClick={() => focus(isActive ? null : index)}
                onPointerEnter={() => {
                  if (simRef.current) simRef.current.hover = index;
                }}
                onPointerLeave={() => {
                  if (simRef.current) simRef.current.hover = null;
                }}
              >
                <span className={styles.actorDot} aria-hidden />
                {actor.label}
              </button>
            );
          })}
        </div>

        <div className={styles.detail} aria-live="polite">
          <div key={focusedActor?.id ?? "rete"} className={styles.detailInner}>
            {focusedActor ? (
              <>
                <p className={styles.detailLabel}>Nodo attivo</p>
                <p className={styles.detailTitle}>{focusedActor.label}</p>
                <p className={styles.detailCopy}>{focusedActor.copy}</p>
              </>
            ) : (
              <>
                <p className={styles.detailLabel}>Rete completa</p>
                <p className={styles.detailTitle}>Partnership vivente</p>
                <p className={styles.detailCopy}>
                  Seleziona o trascina un nodo per esplorare come cittadini,
                  scuole, governi, organizzazioni, imprese e associazioni si
                  collegano nello spazio.
                </p>
              </>
            )}
          </div>
        </div>

        <Magnetic strength={12} radius={100}>
          <Link
            href={`/argomenti/${siteConfig.goals[17].slug}`}
            className={styles.cta}
            data-cursor={cursorData.values.cta}
          >
            Scopri l&apos;Obiettivo 17
            <span className={styles.ctaArrow} aria-hidden>
              →
            </span>
          </Link>
        </Magnetic>
      </div>

      <p className={styles.srOnly}>
        Usa i pulsanti degli attori per evidenziare i collegamenti, oppure
        trascina i nodi sulla rete tridimensionale.
      </p>
    </section>
  );
}
