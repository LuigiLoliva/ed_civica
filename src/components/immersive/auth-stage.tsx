"use client";

import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type AuthStageProps = {
  children: ReactNode;
  className?: string;
};

/** Centra la card auth con entrata soft (atmosfera dal layout auth). */
export function AuthStage({ children, className }: AuthStageProps) {
  return (
    <div className={cn("relative flex min-h-dvh items-center justify-center px-4", className)}>
      <MotionRevealCenter>{children}</MotionRevealCenter>
    </div>
  );
}

function MotionRevealCenter({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 flex min-h-dvh items-center justify-center px-4">
      <Reveal variant="scale" className="w-full max-w-md">
        {children}
      </Reveal>
    </div>
  );
}