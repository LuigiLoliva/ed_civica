import type { StageEngine, StageLayer } from "@/components/shell/stage/stage-engine";
import type { RouteMeta } from "@/lib/shell/route-meta";

/**
 * Punto di aggancio per le pagine: override della scena e layer extra
 * sul contesto WebGL condiviso. Nessuna dipendenza da React.
 */

export type StageOverride = Partial<
  Pick<RouteMeta, "formation" | "accent" | "intensity" | "offset" | "scale">
>;

type Listener = () => void;

let override: StageOverride | null = null;
let engine: StageEngine | null = null;
const listeners = new Set<Listener>();
const pendingLayers = new Map<StageLayer, (() => void) | null>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeStage(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getStageOverride() {
  return override;
}

/** Imposta un override finché non viene chiamata la funzione restituita. */
export function pushStageOverride(next: StageOverride) {
  override = next;
  emit();
  return () => {
    if (override === next) {
      override = null;
      emit();
    }
  };
}

export function attachStageEngine(next: StageEngine | null) {
  engine = next;
  for (const [layer] of pendingLayers) {
    pendingLayers.set(layer, next ? next.addLayer(layer) : null);
  }
}

/**
 * Disegna un layer custom sullo stage persistente (stesso canvas, stesso
 * contesto). Il layer sopravvive ai cambi route finché non viene rimosso.
 */
export function registerStageLayer(layer: StageLayer) {
  pendingLayers.set(layer, engine ? engine.addLayer(layer) : null);
  return () => {
    pendingLayers.get(layer)?.();
    pendingLayers.delete(layer);
  };
}
