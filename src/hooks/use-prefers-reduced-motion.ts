"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Preferenza utente per riduzione del movimento.
 * Wrapper su Framer Motion; restituisce `true` quando il motion va disattivato.
 */
export function usePrefersReducedMotion(): boolean {
  return Boolean(useReducedMotion());
}
