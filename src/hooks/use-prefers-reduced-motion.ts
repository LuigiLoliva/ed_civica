"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * Preferenza utente per riduzione del movimento.
 * Restituisce `true` quando il motion va disattivato.
 *
 * L'idratazione parte sempre da `false` (come il server) e si allinea subito
 * dopo alla preferenza reale: così i rami `reduceMotion` non generano mismatch.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
