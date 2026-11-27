"use client";

import type { ReactNode } from "react";

import { CustomCursor } from "@/components/motion/custom-cursor";
import { SectionProgress } from "@/components/motion/section-progress";

/**
 * Monta primitive motion globali del sito pubblico (cursore + progress).
 * Non va montato nell'admin.
 */
export function PublicMotionRoot({ children }: { children?: ReactNode }) {
  return (
    <>
      <SectionProgress />
      <CustomCursor />
      {children}
    </>
  );
}
