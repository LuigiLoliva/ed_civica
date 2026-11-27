"use client";

import { useEffect, useRef, useState } from "react";

export type StageFrame = {
  ctx: CanvasRenderingContext2D;
  /** Dimensioni CSS del canvas. */
  w: number;
  h: number;
  /** Millisecondi di animazione attiva (si ferma fuori viewport). */
  time: number;
  /** Delta normalizzato in frame a 60fps. */
  dt: number;
  /** True dopo il primo ingresso in viewport (innesca l'intro). */
  entered: boolean;
};

/** Budget pixel: tiene il canvas full-bleed fluido anche su schermi grandi. */
const PIXEL_BUDGET = 3_400_000;

/**
 * Canvas responsive con loop rAF che gira solo quando la sezione è visibile.
 * `draw` può cambiare a ogni render: viene letto da ref.
 */
export function useCanvasStage(draw: (frame: StageFrame) => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    drawRef.current = draw;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let last = 0;
    let time = 0;
    let seen = false;

    const resize = () => {
      const nw = Math.max(1, Math.round(canvas.clientWidth));
      const nh = Math.max(1, Math.round(canvas.clientHeight));
      if (nw === w && nh === h) return;
      w = nw;
      h = nh;
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        2,
        Math.max(1, Math.sqrt(PIXEL_BUDGET / (w * h))),
      );
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = (now: number) => {
      const elapsed = Math.min(50, now - last);
      last = now;
      time += elapsed;
      drawRef.current({
        ctx,
        w,
        h,
        time,
        dt: elapsed / 16.667,
        entered: seen,
      });
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        if (entry.isIntersecting) {
          start();
          const visiblePx = entry.intersectionRect.height;
          if (
            !seen &&
            (entry.intersectionRatio >= 0.5 ||
              visiblePx > Math.min(260, window.innerHeight * 0.3))
          ) {
            seen = true;
            setEntered(true);
          }
        } else {
          stop();
        }
      },
      { threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 1] },
    );
    io.observe(canvas);

    resize();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return { canvasRef, entered };
}

/**
 * Allinea i bagliori CSS dello stage alla scena: l'alone resta centrato sul
 * soggetto, la luce segue il cursore. Sono livelli composti dalla GPU, così
 * il canvas non deve ridipingere sfumature a tutto schermo a ogni frame.
 */
export function syncStageGlow(
  stage: HTMLElement | null,
  light: HTMLElement | null,
  view: { cx: number; cy: number; unit: number },
  lightAt: { x: number; y: number },
) {
  if (stage) {
    const key = `${Math.round(view.cx)}:${Math.round(view.cy)}:${Math.round(view.unit)}`;
    if (stage.dataset.view !== key) {
      stage.dataset.view = key;
      stage.style.setProperty("--stage-cx", `${Math.round(view.cx)}px`);
      stage.style.setProperty("--stage-cy", `${Math.round(view.cy)}px`);
      stage.style.setProperty("--stage-unit", `${Math.round(view.unit)}px`);
    }
  }
  if (light) {
    light.style.transform = `translate3d(${lightAt.x.toFixed(1)}px, ${lightAt.y.toFixed(1)}px, 0)`;
  }
}
