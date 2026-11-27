"use client";

import { usePathname } from "next/navigation";

import { RouteAmbient } from "@/components/immersive/route-ambient";
import { sceneFromPathname } from "@/components/immersive/route-scene";

export function AuthAmbient() {
  const pathname = usePathname();
  const scene = sceneFromPathname(pathname);
  return <RouteAmbient scene={scene} fullBleed className="-z-[1]" />;
}