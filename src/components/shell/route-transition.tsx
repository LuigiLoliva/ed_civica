"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

import {
  getRouteTransitionState,
  setRouteTransitionState,
  useRouteTransition,
} from "@/components/shell/route-transition-store";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionEase } from "@/lib/motion/tokens";
import {
  getRouteMeta,
  isShellRoute,
  isTransitionTarget,
  normalizePath,
} from "@/lib/shell/route-meta";

const LEAVE_MS = 260;
const MIN_COVER_MS = 520;
const ENTER_MS = 700;
const STUCK_MS = 4000;

/**
 * Transizioni di route cinematografiche senza remount dei layout:
 * intercetta i click sui link interni, fa uscire la pagina, mostra la
 * title card mentre lo stage si trasforma e poi fa entrare la nuova pagina.
 * Inattiva su /admin, con modificatori, link esterni e reduced-motion.
 */
export function RouteTransition() {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = usePrefersReducedMotion();
  const { phase, targetPath } = useRouteTransition();

  const timers = useRef<number[]>([]);
  const startedAt = useRef(0);
  const previousPath = useRef(pathname);

  const clearTimers = () => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  };
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  useEffect(() => {
    if (reduceMotion) return;

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = (event.target as Element | null)?.closest?.("a[href]") as
        | HTMLAnchorElement
        | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.closest("[data-no-transition]")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const current = normalizePath(window.location.pathname);
      const next = normalizePath(url.pathname);
      if (next === current) return;
      if (!isShellRoute(current) || !isTransitionTarget(next)) return;

      const href = `${url.pathname}${url.search}${url.hash}`;
      event.preventDefault();

      if (getRouteTransitionState().phase !== "idle") {
        clearTimers();
        startedAt.current = performance.now() - LEAVE_MS;
        setRouteTransitionState({ phase: "loading", targetPath: next });
        router.push(href);
        later(() => setRouteTransitionState({ phase: "idle", targetPath: null }), STUCK_MS);
        return;
      }

      clearTimers();
      startedAt.current = performance.now();
      setRouteTransitionState({ phase: "leaving", targetPath: next });
      router.prefetch(href);
      later(() => {
        setRouteTransitionState({ phase: "loading", targetPath: next });
        router.push(href);
        later(
          () => setRouteTransitionState({ phase: "idle", targetPath: null }),
          STUCK_MS,
        );
      }, LEAVE_MS);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [reduceMotion, router]);

  useLayoutEffect(() => {
    if (previousPath.current === pathname) return;
    const from = previousPath.current;
    previousPath.current = pathname;

    clearTimers();
    if (reduceMotion || !isShellRoute(pathname) || !isShellRoute(from)) {
      setRouteTransitionState({ phase: "idle", targetPath: null });
      return;
    }

    const current = getRouteTransitionState();
    const enter = () => {
      setRouteTransitionState({ phase: "entering", targetPath: null });
      later(() => setRouteTransitionState({ phase: "idle", targetPath: null }), ENTER_MS);
    };

    if (current.phase === "leaving" || current.phase === "loading") {
      const elapsed = performance.now() - startedAt.current;
      const wait = Math.max(0, MIN_COVER_MS - elapsed);
      setRouteTransitionState({
        phase: "loading",
        targetPath: normalizePath(pathname),
      });
      later(enter, wait);
    } else {
      enter();
    }
  }, [pathname, reduceMotion]);

  useEffect(
    () => () => {
      clearTimers();
      setRouteTransitionState({ phase: "idle", targetPath: null });
    },
    [],
  );

  const covering = phase === "leaving" || phase === "loading";
  const meta = targetPath ? getRouteMeta(targetPath) : null;

  if (reduceMotion) return null;

  return (
    <>
      <AnimatePresence>
        {covering && meta ? (
          <motion.div
            key={meta.key}
            className="shell-title-card"
            data-accent={meta.accent}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4, ease: motionEase.out } }}
            transition={{ duration: 0.22, ease: motionEase.out }}
          >
            <motion.span
              className="shell-title-card-eyebrow"
              initial={{ opacity: 0, letterSpacing: "0.6em" }}
              animate={{ opacity: 1, letterSpacing: "0.34em" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: motionEase.out }}
            >
              {meta.eyebrow}
            </motion.span>
            <span className="shell-title-card-label font-heading">
              {Array.from(meta.label).map((char, index) => (
                <span key={`${char}-${index}`} className="shell-title-card-clip">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "115%", rotateX: -70 }}
                    animate={{ y: "0%", rotateX: 0 }}
                    exit={{ y: "-115%", rotateX: 60 }}
                    transition={{
                      duration: 0.52,
                      delay: index * 0.022,
                      ease: motionEase.out,
                    }}
                  >
                    {char === " " ? "\u00a0" : char}
                  </motion.span>
                </span>
              ))}
            </span>
            <motion.span
              className="shell-title-card-rule"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0, originX: 1 }}
              transition={{ duration: 0.6, ease: motionEase.clip }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className="shell-route-sweep" aria-hidden />
    </>
  );
}
