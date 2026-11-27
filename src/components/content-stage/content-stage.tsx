"use client";

import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CONTENT_LINE_SEGMENTS,
  CONTENT_POINT_COUNT,
} from "@/components/content-stage/constants";
import { createStageEngine } from "@/components/content-stage/engine";
import { resolveContentScene } from "@/components/content-stage/scenes";
import { getShapeForScene } from "@/components/content-stage/shapes";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

import styles from "./content-stage.module.css";

/**
 * Palco WebGL2 persistente per le route del gruppo (content).
 * `data-webgl-stage` segnala al layer shell ambient di attenuarsi.
 */
export function ContentStage() {
  const pathname = usePathname();
  const reduceMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ReturnType<typeof createStageEngine> | null>(null);
  const sceneRef = useRef(resolveContentScene(pathname));
  const [ready, setReady] = useState(false);

  const scene = useMemo(() => resolveContentScene(pathname), [pathname]);

  useEffect(() => {
    sceneRef.current = scene;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine =
      engineRef.current ??
      createStageEngine(canvas, {
        pointCount: CONTENT_POINT_COUNT,
        lineCount: CONTENT_LINE_SEGMENTS,
        reducedMotion: reduceMotion,
        maxDpr: 1.75,
      });

    if (!engine) return;
    engineRef.current = engine;

    const shape = getShapeForScene(scene.id, scene.accentHex);
    engine.setShape(shape, scene.view, {
      duration: reduceMotion ? 0.01 : 1.85,
      swirl: reduceMotion ? 0 : 0.38,
    });
    engine.setView(scene.view);
    setReady(true);

    const ro = new ResizeObserver(() => engine.resize());
    ro.observe(canvas);

    return () => ro.disconnect();
  }, [scene, reduceMotion]);

  const onScroll = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const max =
      document.documentElement.scrollHeight - window.innerHeight || 1;
    engine.setScroll(Math.min(1, Math.max(0, window.scrollY / max)));
  }, []);

  const onPointer = useCallback((event: PointerEvent) => {
    const engine = engineRef.current;
    const canvas = canvasRef.current;
    if (!engine || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = 1 - ((event.clientY - rect.top) / rect.height) * 2;
    engine.setPointer(x, y, inside);
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const shape = getShapeForScene(scene.id, scene.accentHex);
    engine.setShape(shape, scene.view, {
      duration: reduceMotion ? 0.01 : 1.65,
      swirl: reduceMotion ? 0 : 0.36,
    });
  }, [scene, reduceMotion]);

  useEffect(() => {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [onScroll, onPointer]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const obs = new IntersectionObserver(
      ([entry]) => engine.setVisible(entry?.isIntersecting ?? true),
      { threshold: 0.02 },
    );
    if (canvasRef.current) obs.observe(canvasRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(
    () => () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    },
    [],
  );

  if (reduceMotion) {
    return (
      <div
        className={styles.stage}
        data-webgl-stage
        data-content-stage={scene.id}
        aria-hidden
      >
        <MotionHalo />
      </div>
    );
  }

  return (
    <div
      className={styles.stage}
      data-webgl-stage
      data-content-stage={scene.id}
      aria-hidden
    >
      <canvas
        ref={canvasRef}
        className={`${styles.canvas} ${ready ? styles.canvasVisible : ""}`}
      />
    </div>
  );
}

/** Alone statico per reduced-motion (nessun WebGL). */
function MotionHalo() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse 55% 45% at 75% 35%, rgb(0 158 219 / 18%), transparent 70%)",
      }}
    />
  );
}