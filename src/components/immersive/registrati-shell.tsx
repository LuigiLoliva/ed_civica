"use client";

import type { ReactNode } from "react";

import { RouteAmbient } from "@/components/immersive/route-ambient";
import { Reveal } from "@/components/motion/reveal";

type RegistratiShellProps = {
  children: ReactNode;
};

export function RegistratiShell({ children }: RegistratiShellProps) {
  return (
    <>
      <RouteAmbient scene="registrati" className="-z-[1]" />
      <RegistratiCenter>{children}</RegistratiCenter>
    </>
  );
}

function RegistratiCenter({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-4 py-16">
      <Reveal variant="scale">{children}</Reveal>
    </div>
  );
}