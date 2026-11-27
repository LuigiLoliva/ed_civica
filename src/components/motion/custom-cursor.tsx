"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionSpring } from "@/lib/motion/tokens";

type CursorMode = "default" | "link" | "cta" | "media" | "text" | "hidden";

/**
 * Cursore contestuale desktop (pointer fine).
 * Risponde a `data-cursor="link|cta|media|text"` sugli elementi.
 * Disattivato su touch, reduced-motion, o senza hover.
 */
export function CustomCursor() {
  const reduceMotion = usePrefersReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const x = useSpring(rawX, motionSpring.cursor);
  const y = useSpring(rawY, motionSpring.cursor);

  useEffect(() => {
    if (reduceMotion) return;

    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [reduceMotion]);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (event: MouseEvent) => {
      rawX.set(event.clientX);
      rawY.set(event.clientY);
      setVisible(true);

      const target = event.target as HTMLElement | null;
      const tagged = target?.closest?.("[data-cursor]") as HTMLElement | null;
      if (tagged) {
        const value = tagged.getAttribute("data-cursor") as CursorMode | null;
        setMode(value && value !== "hidden" ? value : "link");
        return;
      }

      const interactive = target?.closest?.(
        "a, button, [role='button'], input, textarea, select, label",
      );
      setMode(interactive ? "link" : "default");
    };

    const onLeave = () => setVisible(false);
    const onDown = () => setMode((m) => (m === "default" ? m : m));

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", onDown);

    document.documentElement.classList.add("has-custom-cursor");

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [enabled, rawX, rawY]);

  if (!enabled || reduceMotion) return null;

  const size =
    mode === "cta" ? 56 : mode === "link" || mode === "media" ? 44 : 18;
  const label =
    mode === "cta" ? "Vai" : mode === "media" ? "Apri" : mode === "link" ? "" : "";

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="pointer-events-none fixed top-0 left-0 z-[100] -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          aria-hidden
        >
          <motion.div
            className="flex items-center justify-center rounded-full border border-white/80 bg-white/10 text-[10px] font-semibold tracking-wide text-white uppercase backdrop-blur-[2px]"
            animate={{
              width: size,
              height: size,
              opacity: mode === "text" ? 0.35 : 1,
            }}
            transition={{ type: "spring", ...motionSpring.soft }}
          >
            {label}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
