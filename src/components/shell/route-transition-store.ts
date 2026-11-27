import { useSyncExternalStore } from "react";

export type RoutePhase = "idle" | "leaving" | "loading" | "entering";

export type RouteTransitionState = {
  phase: RoutePhase;
  /** Pathname di destinazione mentre la transizione è in corso. */
  targetPath: string | null;
};

const idleState: RouteTransitionState = { phase: "idle", targetPath: null };

let state: RouteTransitionState = idleState;
const listeners = new Set<() => void>();

export function getRouteTransitionState() {
  return state;
}

export function setRouteTransitionState(next: RouteTransitionState) {
  if (next.phase === state.phase && next.targetPath === state.targetPath) return;
  state = next.phase === "idle" ? idleState : next;

  if (typeof document !== "undefined") {
    const root = document.documentElement;
    if (state.phase === "idle") {
      delete root.dataset.routePhase;
    } else {
      root.dataset.routePhase = state.phase;
    }
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Fase corrente della transizione di route. Stesso valore esposto in CSS
 * come `html[data-route-phase]` (assente quando idle).
 */
export function useRouteTransition(): RouteTransitionState {
  return useSyncExternalStore(subscribe, getRouteTransitionState, () => idleState);
}
