"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { Magnetic } from "@/components/motion/magnetic";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cursorData } from "@/lib/motion/tokens";
import { siteConfig } from "@/lib/site-config";

import styles from "./goal-16-section.module.css";

const PILLARS = [
  {
    id: "pace",
    index: "01",
    title: "Pace",
    copy: "Società inclusive che prevengono il conflitto e proteggono i diritti.",
    tilt: -18,
    weightL: 0.78,
    weightR: 0.34,
    hue: "#8fad7f",
  },
  {
    id: "giustizia",
    index: "02",
    title: "Giustizia",
    copy: "Accesso equo alla giustizia per tutte le persone, senza barriere.",
    tilt: 0,
    weightL: 0.55,
    weightR: 0.55,
    hue: "#7ec8e3",
  },
  {
    id: "istituzioni",
    index: "03",
    title: "Istituzioni",
    copy: "Organi efficaci, responsabili e trasparenti al servizio della comunità.",
    tilt: 18,
    weightL: 0.32,
    weightR: 0.8,
    hue: "#009edb",
  },
] as const;

type PillarId = (typeof PILLARS)[number]["id"];

function drawGeometry(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: {
    tilt: number;
    weightL: number;
    weightR: number;
    hue: string;
    pointer: { x: number; y: number } | null;
    time: number;
    reduceMotion: boolean;
  },
) {
  const { tilt, weightL, weightR, hue, pointer, time, reduceMotion } = opts;
  // Geometry anchored to the right-center on desktop, center on narrow
  const cx = w > 820 ? w * 0.62 : w * 0.5;
  const cy = h * 0.48;
  const scale = Math.min(w * (w > 820 ? 0.72 : 0.92), h * 0.88);
  const t = reduceMotion ? 0 : time;

  ctx.clearRect(0, 0, w, h);

  // Soft vignette fill already from CSS; paint atmospheric blooms
  const lx = pointer ? pointer.x : cx + Math.cos(t / 2400) * scale * 0.2;
  const ly = pointer ? pointer.y : cy - scale * 0.15;
  const light = ctx.createRadialGradient(lx, ly, 12, lx, ly, scale * 0.7);
  light.addColorStop(0, "rgb(180 230 255 / 28%)");
  light.addColorStop(0.35, "rgb(0 158 219 / 12%)");
  light.addColorStop(1, "rgb(0 0 0 / 0%)");
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, w, h);

  // Giant watermark drawn in canvas for reliable visibility
  ctx.save();
  ctx.font = `600 ${Math.min(w, h) * 0.58}px Georgia, "Times New Roman", serif`;
  ctx.fillStyle = "rgb(255 255 255 / 7%)";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText("16", w - w * 0.02, -h * 0.04);
  ctx.restore();

  // Grid field
  ctx.save();
  ctx.strokeStyle = "rgb(255 255 255 / 4%)";
  ctx.lineWidth = 1;
  const grid = 64;
  for (let x = cx % grid; x < w; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = cy % grid; y < h; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();

  // Nested rings with fill depth
  const rings = [
    { r: 0.48, stroke: "rgb(255 255 255 / 10%)", fill: "rgb(0 158 219 / 4%)" },
    { r: 0.36, stroke: "rgb(126 200 227 / 18%)", fill: null },
    { r: 0.24, stroke: "rgb(126 200 227 / 22%)", fill: "rgb(0 104 157 / 8%)" },
    { r: 0.12, stroke: "rgb(255 255 255 / 20%)", fill: null },
  ];
  for (const ring of rings) {
    ctx.beginPath();
    ctx.arc(cx, cy, scale * ring.r, 0, Math.PI * 2);
    if (ring.fill) {
      ctx.fillStyle = ring.fill;
      ctx.fill();
    }
    ctx.strokeStyle = ring.stroke;
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  // Rotating hexagon (harmony)
  const hexR = scale * 0.3;
  const hexRot = reduceMotion ? Math.PI / 12 : t / 10000;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = hexRot + (Math.PI / 3) * i;
    const x = cx + Math.cos(a) * hexR;
    const y = cy + Math.sin(a) * hexR;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "rgb(143 173 127 / 6%)";
  ctx.fill();
  ctx.strokeStyle = "rgb(143 173 127 / 40%)";
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Crossing justice axes
  ctx.strokeStyle = "rgb(255 255 255 / 10%)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - scale * 0.42, cy - scale * 0.42);
  ctx.lineTo(cx + scale * 0.42, cy + scale * 0.42);
  ctx.moveTo(cx + scale * 0.42, cy - scale * 0.42);
  ctx.lineTo(cx - scale * 0.42, cy + scale * 0.42);
  ctx.stroke();

  // Orbiting ticks
  if (!reduceMotion) {
    for (let i = 0; i < 18; i++) {
      const a = (Math.PI * 2 * i) / 18 + t / 14000;
      const r = scale * (0.44 + (i % 3) * 0.015);
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      ctx.beginPath();
      ctx.arc(x, y, i % 3 === 0 ? 3 : 1.4, 0, Math.PI * 2);
      ctx.fillStyle =
        i % 3 === 0 ? "rgb(126 200 227 / 80%)" : "rgb(255 255 255 / 30%)";
      ctx.fill();
    }
  }

  // Fulcrum base
  const baseY = cy + scale * 0.36;
  ctx.beginPath();
  ctx.moveTo(cx - scale * 0.14, baseY + scale * 0.05);
  ctx.lineTo(cx + scale * 0.14, baseY + scale * 0.05);
  ctx.lineTo(cx + scale * 0.055, baseY - scale * 0.025);
  ctx.lineTo(cx - scale * 0.055, baseY - scale * 0.025);
  ctx.closePath();
  const baseGrad = ctx.createLinearGradient(
    cx,
    baseY - scale * 0.05,
    cx,
    baseY + scale * 0.06,
  );
  baseGrad.addColorStop(0, "rgb(232 246 252 / 70%)");
  baseGrad.addColorStop(1, "rgb(0 104 157 / 65%)");
  ctx.fillStyle = baseGrad;
  ctx.fill();

  // Column
  const colGrad = ctx.createLinearGradient(cx - 8, cy, cx + 8, baseY);
  colGrad.addColorStop(0, "rgb(255 255 255 / 75%)");
  colGrad.addColorStop(1, "rgb(126 200 227 / 45%)");
  ctx.fillStyle = colGrad;
  ctx.fillRect(
    cx - scale * 0.014,
    cy + scale * 0.02,
    scale * 0.028,
    scale * 0.32,
  );

  // Beam
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((tilt * Math.PI) / 180);

  const beamHalf = scale * 0.38;
  const beamGrad = ctx.createLinearGradient(-beamHalf, 0, beamHalf, 0);
  beamGrad.addColorStop(0, hue);
  beamGrad.addColorStop(0.5, "#ffffff");
  beamGrad.addColorStop(1, "#7ec8e3");
  ctx.strokeStyle = beamGrad;
  ctx.lineWidth = Math.max(4, scale * 0.014);
  ctx.lineCap = "round";
  ctx.shadowColor = `${hue}88`;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.moveTo(-beamHalf, 0);
  ctx.lineTo(beamHalf, 0);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Jewel
  ctx.beginPath();
  ctx.arc(0, 0, scale * 0.032, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, scale * 0.016, 0, Math.PI * 2);
  ctx.fillStyle = hue;
  ctx.fill();

  const drawPan = (side: -1 | 1, weight: number, fillHue: string) => {
    const px = side * beamHalf * 0.92;
    const hang = scale * 0.18 + weight * scale * 0.1;
    ctx.save();
    ctx.translate(px, 0);
    ctx.rotate((-tilt * Math.PI) / 180);

    ctx.strokeStyle = "rgb(207 232 244 / 80%)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, hang);
    ctx.stroke();

    const panW = scale * 0.12 * (0.85 + weight * 0.4);
    ctx.beginPath();
    ctx.moveTo(-panW, hang);
    ctx.quadraticCurveTo(0, hang + panW * 0.95, panW, hang);
    ctx.closePath();
    const panFill = ctx.createLinearGradient(0, hang, 0, hang + panW);
    panFill.addColorStop(0, `${fillHue}55`);
    panFill.addColorStop(1, `${fillHue}18`);
    ctx.fillStyle = panFill;
    ctx.fill();
    ctx.strokeStyle = fillHue;
    ctx.lineWidth = 2.4;
    ctx.shadowColor = `${fillHue}66`;
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const stack = 1 + Math.round(weight * 2);
    for (let i = 0; i < stack; i++) {
      const s = scale * (0.034 - i * 0.005);
      const oy = hang - scale * 0.025 - i * scale * 0.04;
      ctx.save();
      ctx.translate(0, oy);
      ctx.rotate(reduceMotion ? 0 : t / 2800 + i * 0.4);
      ctx.beginPath();
      if (side < 0) {
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.75, 0);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.75, 0);
      } else {
        ctx.rect(-s * 0.75, -s * 0.6, s * 1.5, s * 1.2);
      }
      ctx.closePath();
      ctx.fillStyle =
        side < 0 ? "rgb(143 173 127 / 90%)" : "rgb(232 246 252 / 92%)";
      ctx.shadowColor = side < 0 ? "rgb(143 173 127 / 50%)" : "rgb(255 255 255 / 35%)";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  };

  drawPan(-1, weightL, "#8fad7f");
  drawPan(1, weightR, "#009edb");
  ctx.restore();
}

export function Goal16Section() {
  const reduceMotion = usePrefersReducedMotion();
  const titleId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const tiltRef = useRef({ current: 0, velocity: 0, target: 0 });
  const weightRef = useRef({ l: 0.55, r: 0.55, hue: "#7ec8e3" });
  const rafRef = useRef(0);
  const [active, setActive] = useState<PillarId>("giustizia");

  const pillar = PILLARS.find((p) => p.id === active) ?? PILLARS[1];

  useEffect(() => {
    tiltRef.current.target = reduceMotion ? 0 : pillar.tilt;
    weightRef.current = {
      l: pillar.weightL,
      r: pillar.weightR,
      hue: pillar.hue,
    };
  }, [pillar, reduceMotion]);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const w = Math.max(320, Math.floor(stage.clientWidth));
    const h = Math.max(320, Math.floor(stage.clientHeight));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  useEffect(() => {
    resize();
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(() => resize());
    ro.observe(stage);
    return () => ro.disconnect();
  }, [resize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let last = performance.now();

    const tick = (time: number) => {
      const dt = Math.min(32, time - last) / 16;
      last = time;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      const state = tiltRef.current;
      const nudge = pointerRef.current
        ? ((pointerRef.current.x / w) - 0.62) * 10
        : 0;
      const target = reduceMotion ? 0 : state.target + nudge;
      // Spring toward target (overshoot)
      const stiffness = 0.08;
      const damping = 0.82;
      state.velocity += (target - state.current) * stiffness * dt;
      state.velocity *= damping;
      state.current += state.velocity * dt;

      const idle = reduceMotion ? 0 : Math.sin(time / 1900) * 1.2;
      const weights = weightRef.current;

      drawGeometry(ctx, w, h, {
        tilt: state.current + idle,
        weightL: weights.l,
        weightR: weights.r,
        hue: weights.hue,
        pointer: pointerRef.current,
        time,
        reduceMotion,
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reduceMotion]);

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cr = canvas.getBoundingClientRect();
    pointerRef.current = {
      x: event.clientX - cr.left,
      y: event.clientY - cr.top,
    };
  };

  const onPointerLeave = () => {
    pointerRef.current = null;
  };

  return (
    <section
      className={styles.experience}
      aria-labelledby={titleId}
      data-goal="16"
    >
      <div
        ref={stageRef}
        className={styles.stage}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          role="img"
          aria-label={`Geometria dell'equilibrio inclinata verso ${pillar.title}`}
          data-cursor={cursorData.values.media}
        />
      </div>

      <p className={styles.hint}>Luce e geometria cercano l&apos;equilibrio</p>

      <div className={styles.overlay}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Obiettivo 16 · Agenda 2030</p>
          <h3 id={titleId} className={styles.title}>
            Pace, giustizia
            <span className={styles.titleAccent}>e istituzioni solide</span>
          </h3>
          <p className={styles.lead}>
            Promuovere società pacifiche e inclusive, garantire l&apos;accesso
            alla giustizia e costruire istituzioni efficaci, responsabili e
            trasparenti a tutti i livelli.
          </p>

          <div
            className={styles.rail}
            role="group"
            aria-label="Pilastri dell'Obiettivo 16"
          >
            {PILLARS.map((item) => {
              const isActive = item.id === active;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.pillar} ${isActive ? styles.pillarActive : ""}`}
                  aria-pressed={isActive}
                  data-cursor={cursorData.values.link}
                  onClick={() => setActive(item.id)}
                  onFocus={() => setActive(item.id)}
                >
                  <span className={styles.pillarMeta}>
                    <span className={styles.pillarIndex}>{item.index}</span>
                    <span className={styles.pillarTitle}>{item.title}</span>
                  </span>
                  <span className={styles.pillarCopy}>{item.copy}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.footer}>
          <Magnetic strength={12} radius={100}>
            <Link
              href={`/argomenti/${siteConfig.goals[16].slug}`}
              className={styles.cta}
              data-cursor={cursorData.values.cta}
            >
              Scopri l&apos;Obiettivo 16
              <span className={styles.ctaArrow} aria-hidden>
                →
              </span>
            </Link>
          </Magnetic>
          <p className={styles.equilibrium} aria-live="polite">
            {pillar.title}
            <span>Equilibrio in movimento</span>
          </p>
        </div>
      </div>
    </section>
  );
}
