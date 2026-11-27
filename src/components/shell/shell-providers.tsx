"use client";

import type { ReactNode } from "react";

import { RouteTransition } from "@/components/shell/route-transition";
import { ShellStage } from "@/components/shell/stage/shell-stage";

/** Monta stage WebGL persistente e transizioni di route (non su /admin). */
export function ShellProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <ShellStage />
      <RouteTransition />
      {children}
    </>
  );
}