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
 * Preferenza utente per riduzione del movimento; `true` quando il motion
 * va disattivato.
 *
 * Il server non conosce la preferenza: l'idratazione parte da `false`
 * (stesso markup del server) e passa al valore reale subito dopo, così
 * i componenti che cambiano albero con reduced-motion non vanno in mismatch.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
