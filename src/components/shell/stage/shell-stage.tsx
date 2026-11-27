"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { useRouteTransition } from "@/components/shell/route-transition-store";
import { StageEngine, type StageScene } from "@/components/shell/stage/stage-engine";
import {
  attachStageEngine,
  getStageOverride,
  subscribeStage,
} from "@/components/shell/stage/stage-store";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import {
  accentRgb,
  getRouteMeta,
  isShellRoute,
  type RouteAccent,
} from "@/lib/shell/route-meta";

const secondaryAccent: Record<RouteAccent, RouteAccent> = {
  onu: "goal17",
  goal16: "onu",
  goal17: "onu",
  olive: "goal16",
};

function toUnit(rgb: readonly [number, number, number]) {
  return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255] as const;
}

/** Selettore con cui gli stage di area segnalano la propria presenza. */
const EXTERNAL_STAGE_SELECTOR = "[data-webgl-stage]";
const DIMMED = 0.38;

/**
 * Canvas WebGL2 persistente dietro a tutto il sito (tranne /admin).
 * Montato nel root layout: non viene mai ricreato tra una route e l'altra;
 * cambia solo la formazione verso cui i punti si trasformano.
 */
export function ShellStage() {
  const pathname = usePathname();
  const { targetPath } = useRouteTransition();
  const reduceMotion = usePrefersReducedMotion();
  const override = useSyncExternalStore(subscribeStage, getStageOverride, () => null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<StageEngine | null>(null);
  const [ready, setReady] = useState(false);

  const enabled = isShellRoute(pathname);
  const scenePath = targetPath ?? pathname;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const small = window.innerWidth < 768;
    const cores = navigator.hardwareConcurrency ?? 4;
    const lowEnd = small || coarse || cores <= 4;
    const pixelCap = lowEnd ? 1.5 : 2;

    const boot = () => {
      try {
        return new StageEngine(canvas, gl, {
          count: lowEnd ? 1100 : 2600,
          hubs: lowEnd ? 110 : 260,
          staticMode: reduceMotion,
        });
      } catch (error) {
        console.warn("[shell-stage] WebGL non disponibile:", error);
        return null;
      }
    };

    let engine = boot();
    if (!engine) return;
    engineRef.current = engine;
    attachStageEngine(engine);

    const resize = () => {
      engine?.resize(
        window.innerWidth,
        window.innerHeight,
        Math.min(window.devicePixelRatio || 1, pixelCap),
      );
    };
    const onScroll = () => {
      engine?.setScroll(window.scrollY / Math.max(1, window.innerHeight));
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      engine?.setPointer(
        (event.clientX / window.innerWidth) * 2 - 1,
        1 - (event.clientY / window.innerHeight) * 2,
        true,
      );
    };
    const onPointerOut = () => engine?.setPointer(0, 0, false);
    const onVisibility = () => {
      if (document.hidden) engine?.stop();
      else engine?.start();
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      engine?.stop();
    };
    const onRestored = () => {
      engine?.dispose();
      engine = boot();
      engineRef.current = engine;
      attachStageEngine(engine);
      resize();
      setReady(false);
      requestAnimationFrame(() => setReady(Boolean(engine)));
      engine?.start();
    };

    resize();
    onScroll();
    engine.start();
    setReady(true);

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    if (!reduceMotion && !coarse) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerOut);
    }
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onPointerOut);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      attachStageEngine(null);
      engineRef.current = null;
      engine?.dispose();
      engine = null;
      setReady(false);
    };
  }, [enabled, reduceMotion]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !ready) return;
    const meta = { ...getRouteMeta(scenePath), ...(override ?? {}) };
    const scene: StageScene = {
      formation: meta.formation,
      colorA: toUnit(accentRgb[meta.accent]),
      colorB: toUnit(accentRgb[secondaryAccent[meta.accent]]),
      offset: meta.offset,
      scale: meta.scale,
      intensity: meta.intensity,
    };
    engine.setScene(scene);
  }, [scenePath, override, ready]);

  /**
   * Coesistenza con gli stage di area: quando un elemento marcato
   * `data-webgl-stage` (canvas o sezione che lo contiene) è in viewport,
   * l'atmosfera si attenua e dimezza i punti.
   */
  useEffect(() => {
    if (!enabled || !ready) return;
    const visible = new Set<Element>();
    const observed = new Set<Element>();
    const apply = () => {
      engineRef.current?.setDim(visible.size > 0 ? DIMMED : 1);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        apply();
      },
      { threshold: 0.05 },
    );
    const scan = () => {
      const found = new Set(document.querySelectorAll(EXTERNAL_STAGE_SELECTOR));
      for (const el of observed) {
        if (!found.has(el)) {
          io.unobserve(el);
          observed.delete(el);
          visible.delete(el);
        }
      }
      for (const el of found) {
        if (!observed.has(el)) {
          observed.add(el);
          io.observe(el);
        }
      }
      apply();
    };

    scan();
    const timers = [250, 900, 2200].map((ms) => window.setTimeout(scan, ms));
    return () => {
      for (const id of timers) window.clearTimeout(id);
      io.disconnect();
    };
  }, [enabled, ready, pathname]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="shell-stage"
      data-ready={ready ? "true" : "false"}
      data-shell-stage
      aria-hidden
    />
  );
}
