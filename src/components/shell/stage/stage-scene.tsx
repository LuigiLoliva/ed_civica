"use client";

import { useEffect } from "react";

import {
  pushStageOverride,
  type StageOverride,
} from "@/components/shell/stage/stage-store";

/**
 * Aggancio per le pagine: finché è montato, sostituisce la scena
 * dell'atmosfera decisa dalla route (formazione, accento, intensità…).
 * Non renderizza nulla.
 */
export function StageScene({
  formation,
  accent,
  intensity,
  offset,
  scale,
}: StageOverride) {
  const offsetX = offset?.[0];
  const offsetY = offset?.[1];

  useEffect(() => {
    const next: StageOverride = {};
    if (formation) next.formation = formation;
    if (accent) next.accent = accent;
    if (intensity !== undefined) next.intensity = intensity;
    if (scale !== undefined) next.scale = scale;
    if (offsetX !== undefined && offsetY !== undefined) {
      next.offset = [offsetX, offsetY];
    }
    return pushStageOverride(next);
  }, [formation, accent, intensity, scale, offsetX, offsetY]);

  return null;
}
