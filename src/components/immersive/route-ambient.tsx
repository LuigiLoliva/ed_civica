"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";

import { renderRouteAmbient } from "@/components/immersive/ambient-renderer";
import { sceneFromPathname } from "@/components/immersive/route-scene";
import type { SceneId } from "@/components/immersive/scene-shapes";
import {
  useCanvasStage,
  type StageFrame,
} from "@/components/home/goals/use-canvas-stage";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

type RouteAmbientProps = {
  /** Override scena (es. not-found senza pathname). */
  scene?: SceneId;
  className?: string;
  /** Sotto-layout auth a tutto schermo. */
  fullBleed?: boolean;
};

/**
 * Atmosfera 3D a particelle per le route del worker G/A.
 * Canvas fisso dietro al contenuto; quando esiste lo stage shell globale,
 * convive con esso (le pagine Goal 16/17 usano data-webgl-stage).
 */
function subscribeShellStage(onStoreChange: () => void) {
  const mo = new MutationObserver(onStoreChange);
  mo.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-shell-stage"],
  });
  return () => mo.disconnect();
}

function getShellStageSnapshot() {
  return Boolean(document.querySelector("[data-shell-stage]"));
}

/** Quando PR #28 (shell) è attiva, l'atmosfera globale sostituisce i canvas per-route. */
function useGlobalShellStage() {
  return useSyncExternalStore(subscribeShellStage, getShellStageSnapshot, () => false);
}

export function RouteAmbient({
  scene: sceneOverride,
  className,
  fullBleed,
}: RouteAmbientProps) {
  const pathname = usePathname();
  const reduceMotion = usePrefersReducedMotion();
  const shellStage = useGlobalShellStage();
  const pointer = useRef({ x: 0, y: 0 });

  const scene = useMemo(
    () => sceneOverride ?? sceneFromPathname(pathname),
    [pathname, sceneOverride],
  );

  const draw = useCallback(
    (frame: StageFrame) => {
      renderRouteAmbient(frame, scene, pointer.current, reduceMotion);
    },
    [reduceMotion, scene],
  );

  const { canvasRef } = useCanvasStage(draw);

  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (event: PointerEvent) => {
      pointer.current = {
        x: event.clientX / window.innerWidth - 0.5,
        y: event.clientY / window.innerHeight - 0.5,
      };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduceMotion]);

  if (shellStage) return null;

  return (
    <div
      className={cn(
        "ambient-route pointer-events-none fixed inset-0 z-0 overflow-hidden",
        fullBleed && "opacity-100",
        className,
      )}
      aria-hidden
    >
      <canvas
        ref={canvasRef}
        className="ambient-route-canvas block h-full w-full"
        role="presentation"
      />
      <div className="ambient-route-vignette absolute inset-0" />
    </div>
  );
}