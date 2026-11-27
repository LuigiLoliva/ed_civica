"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { Magnetic } from "@/components/motion/magnetic";
import { Spotlight } from "@/components/motion/spotlight";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cursorData } from "@/lib/motion/tokens";
import { siteConfig } from "@/lib/site-config";

import styles from "./goal-17-network.module.css";

type ActorId =
  | "cittadini"
  | "scuole"
  | "governi"
  | "organizzazioni"
  | "imprese"
  | "associazioni";

type Actor = {
  id: ActorId;
  label: string;
  short: string;
  copy: string;
  color: string;
};

const ACTORS: Actor[] = [
  {
    id: "cittadini",
    label: "Cittadini",
    short: "CIT",
    copy: "Partecipazione, diritti e responsabilità quotidiane nella comunità.",
    color: "#7ec8e3",
  },
  {
    id: "scuole",
    label: "Scuole",
    short: "SCU",
    copy: "Educazione civica, ricerca e dialogo intergenerazionale.",
    color: "#009edb",
  },
  {
    id: "governi",
    label: "Governi",
    short: "GOV",
    copy: "Politiche pubbliche, cooperazione internazionale e accountability.",
    color: "#5fb3d6",
  },
  {
    id: "organizzazioni",
    label: "Organizzazioni",
    short: "ORG",
    copy: "ONU e organismi multilaterali che coordinano l'azione globale.",
    color: "#cfe8f4",
  },
  {
    id: "imprese",
    label: "Imprese",
    short: "IMP",
    copy: "Innovazione responsabile, lavoro dignitoso e risorse condivise.",
    color: "#8fad7f",
  },
  {
    id: "associazioni",
    label: "Associazioni",
    short: "ASS",
    copy: "Terzo settore e reti locali che collegano bisogni e soluzioni.",
    color: "#a8c4b0",
  },
];

type SimNode = {
  id: ActorId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  label: string;
  short: string;
};

type Packet = {
  from: number;
  to: number;
  t: number;
  speed: number;
  hue: string;
};

const EDGES: [ActorId, ActorId][] = [
  ["cittadini", "scuole"],
  ["cittadini", "associazioni"],
  ["cittadini", "governi"],
  ["scuole", "organizzazioni"],
  ["scuole", "associazioni"],
  ["governi", "organizzazioni"],
  ["governi", "imprese"],
  ["organizzazioni", "imprese"],
  ["organizzazioni", "associazioni"],
  ["imprese", "associazioni"],
  ["scuole", "imprese"],
  ["governi", "associazioni"],
];

function createNodes(width: number, height: number): SimNode[] {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.32;
  return ACTORS.map((actor, i) => {
    const angle = (Math.PI * 2 * i) / ACTORS.length - Math.PI / 2;
    return {
      id: actor.id,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
      r: Math.max(22, Math.min(width, height) * 0.048),
      color: actor.color,
      label: actor.label,
      short: actor.short,
    };
  });
}

export function Goal17Network() {
  const reduceMotion = usePrefersReducedMotion();
  const titleId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const packetsRef = useRef<Packet[]>([]);
  const focusedRef = useRef<ActorId | null>(null);
  const dragRef = useRef<{ index: number; ox: number; oy: number } | null>(
    null,
  );
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef(0);
  const [focused, setFocused] = useState<ActorId | null>("organizzazioni");
  const [dragging, setDragging] = useState(false);
  const [linkCount, setLinkCount] = useState(EDGES.length);

  const actorMap = useMemo(
    () => Object.fromEntries(ACTORS.map((a) => [a.id, a])) as Record<
      ActorId,
      Actor
    >,
    [],
  );

  const focusedActor = focused ? actorMap[focused] : null;

  useEffect(() => {
    focusedRef.current = focused;
  }, [focused]);

  const sizeRef = useRef({ w: 0, h: 0 });

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    // clientWidth/Height = content box — avoids border-box feedback with ResizeObserver
    const w = Math.max(280, Math.floor(wrap.clientWidth));
    const h = Math.max(320, Math.floor(wrap.clientHeight));
    if (w === sizeRef.current.w && h === sizeRef.current.h) return;
    sizeRef.current = { w, h };

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    // Layout size comes from CSS (100% of fixed-height stage) — do not set style height
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (nodesRef.current.length === 0) {
      nodesRef.current = createNodes(w, h);
      packetsRef.current = EDGES.slice(0, 6).map(([a, b], i) => {
        const from = ACTORS.findIndex((x) => x.id === a);
        const to = ACTORS.findIndex((x) => x.id === b);
        return {
          from,
          to,
          t: i / 6,
          speed: 0.0022 + (i % 3) * 0.0006,
          hue: ACTORS[from]?.color ?? "#7ec8e3",
        };
      });
    } else {
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.32;
      nodesRef.current.forEach((node, i) => {
        const angle = (Math.PI * 2 * i) / ACTORS.length - Math.PI / 2;
        const tx = cx + Math.cos(angle) * radius;
        const ty = cy + Math.sin(angle) * radius;
        node.x = node.x * 0.7 + tx * 0.3;
        node.y = node.y * 0.7 + ty * 0.3;
        node.r = Math.max(22, Math.min(w, h) * 0.048);
      });
    }
  }, []);

  useEffect(() => {
    resize();
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [resize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const nodes = nodesRef.current;
      const focusedId = focusedRef.current;
      const drag = dragRef.current;

      // Physics
      if (!reduceMotion) {
        const cx = w / 2;
        const cy = h / 2;
        for (let i = 0; i < nodes.length; i++) {
          const a = nodes[i]!;
          if (drag?.index === i) continue;

          // Soft orbit spring toward ring
          const angle = (Math.PI * 2 * i) / nodes.length - Math.PI / 2;
          const radius = Math.min(w, h) * 0.32;
          const tx = cx + Math.cos(angle + now / 18000) * radius;
          const ty = cy + Math.sin(angle + now / 18000) * radius;
          a.vx += (tx - a.x) * 0.0009 * dt;
          a.vy += (ty - a.y) * 0.0009 * dt;

          // Mouse repulsion / attraction
          const ptr = pointerRef.current;
          if (ptr) {
            const dx = a.x - ptr.x;
            const dy = a.y - ptr.y;
            const dist = Math.hypot(dx, dy) || 1;
            if (dist < 140) {
              const f = ((140 - dist) / 140) * 0.08;
              a.vx += (dx / dist) * f * dt * 0.05;
              a.vy += (dy / dist) * f * dt * 0.05;
            }
          }

          // Pairwise soft repulsion
          for (let j = i + 1; j < nodes.length; j++) {
            const b = nodes[j]!;
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.hypot(dx, dy) || 1;
            const min = a.r + b.r + 28;
            if (dist < min) {
              const push = ((min - dist) / min) * 0.04;
              const nx = dx / dist;
              const ny = dy / dist;
              a.vx += nx * push * dt;
              a.vy += ny * push * dt;
              if (drag?.index !== j) {
                b.vx -= nx * push * dt;
                b.vy -= ny * push * dt;
              }
            }
          }

          a.vx *= 0.9;
          a.vy *= 0.9;
          a.x += a.vx;
          a.y += a.vy;
          a.x = Math.max(a.r + 8, Math.min(w - a.r - 8, a.x));
          a.y = Math.max(a.r + 8, Math.min(h - a.r - 8, a.y));
        }

        for (const packet of packetsRef.current) {
          packet.t += packet.speed * (dt / 16);
          if (packet.t > 1) packet.t -= 1;
        }
      }

      // Draw
      ctx.clearRect(0, 0, w, h);

      // Ambient grid dots
      ctx.fillStyle = "rgb(255 255 255 / 6%)";
      for (let y = 24; y < h; y += 28) {
        for (let x = 24; x < w; x += 28) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Center hub
      const hubGrad = ctx.createRadialGradient(
        w / 2,
        h / 2,
        4,
        w / 2,
        h / 2,
        Math.min(w, h) * 0.18,
      );
      hubGrad.addColorStop(0, "rgb(0 158 219 / 35%)");
      hubGrad.addColorStop(1, "rgb(0 158 219 / 0%)");
      ctx.fillStyle = hubGrad;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.18, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 10, 0, Math.PI * 2);
      ctx.fillStyle = "rgb(255 255 255 / 85%)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#009edb";
      ctx.fill();

      const indexById = Object.fromEntries(
        nodes.map((n, i) => [n.id, i]),
      ) as Record<ActorId, number>;

      // Edges
      for (const [aId, bId] of EDGES) {
        const ai = indexById[aId];
        const bi = indexById[bId];
        const a = nodes[ai];
        const b = nodes[bi];
        if (!a || !b) continue;
        const hot =
          focusedId === null || focusedId === aId || focusedId === bId;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        const mx = (a.x + b.x) / 2 + (a.y - b.y) * 0.08;
        const my = (a.y + b.y) / 2 + (b.x - a.x) * 0.08;
        ctx.quadraticCurveTo(mx, my, b.x, b.y);
        ctx.strokeStyle = hot
          ? "rgb(126 200 227 / 42%)"
          : "rgb(126 200 227 / 12%)";
        ctx.lineWidth = hot ? 1.8 : 1;
        ctx.stroke();
      }

      // Packets
      if (!reduceMotion) {
        for (const packet of packetsRef.current) {
          const a = nodes[packet.from];
          const b = nodes[packet.to];
          if (!a || !b) continue;
          const hot =
            focusedId === null ||
            focusedId === a.id ||
            focusedId === b.id;
          if (!hot) continue;
          const t = packet.t;
          const mx = (a.x + b.x) / 2 + (a.y - b.y) * 0.08;
          const my = (a.y + b.y) / 2 + (b.x - a.x) * 0.08;
          const ox = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * mx + t * t * b.x;
          const oy = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * my + t * t * b.y;
          ctx.beginPath();
          ctx.arc(ox, oy, 3.2, 0, Math.PI * 2);
          ctx.fillStyle = packet.hue;
          ctx.shadowColor = packet.hue;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Nodes
      for (const node of nodes) {
        const isFocus = focusedId === node.id;
        const dimmed = focusedId !== null && !isFocus;
        const pulse = reduceMotion
          ? 1
          : 1 + Math.sin(now / 420 + node.x) * 0.04;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r * pulse + (isFocus ? 4 : 0), 0, Math.PI * 2);
        ctx.fillStyle = dimmed ? "rgb(20 45 65 / 75%)" : "rgb(8 28 44 / 88%)";
        ctx.fill();
        ctx.lineWidth = isFocus ? 3 : 1.5;
        ctx.strokeStyle = dimmed
          ? "rgb(126 200 227 / 25%)"
          : node.color;
        ctx.stroke();

        if (isFocus) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.r + 12, 0, Math.PI * 2);
          ctx.strokeStyle = "rgb(0 158 219 / 35%)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.fillStyle = dimmed ? "rgb(255 255 255 / 45%)" : "#fff";
        ctx.font = `650 ${Math.max(10, node.r * 0.42)}px var(--font-sans), system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.short, node.x, node.y - 1);

        ctx.fillStyle = dimmed
          ? "rgb(255 255 255 / 40%)"
          : "rgb(238 245 249 / 88%)";
        ctx.font = `500 ${Math.max(10, node.r * 0.36)}px var(--font-sans), system-ui, sans-serif`;
        ctx.fillText(node.label, node.x, node.y + node.r + 14);
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reduceMotion]);

  const hitTest = useCallback((x: number, y: number) => {
    const nodes = nodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i]!;
      if (Math.hypot(n.x - x, n.y - y) <= n.r + 8) return i;
    }
    return -1;
  }, []);

  const toLocal = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }, []);

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const { x, y } = toLocal(event);
    const index = hitTest(x, y);
    if (index < 0) {
      setFocused(null);
      return;
    }
    const node = nodesRef.current[index]!;
    setFocused(node.id);
    dragRef.current = { index, ox: x - node.x, oy: y - node.y };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const { x, y } = toLocal(event);
    pointerRef.current = { x, y };
    const drag = dragRef.current;
    if (!drag) return;
    const node = nodesRef.current[drag.index];
    if (!node) return;
    node.x = x - drag.ox;
    node.y = y - drag.oy;
    node.vx = 0;
    node.vy = 0;
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    dragRef.current = null;
    setDragging(false);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onPointerLeave = () => {
    pointerRef.current = null;
  };

  const selectActor = (id: ActorId) => {
    setFocused((prev) => (prev === id ? null : id));
    setLinkCount(
      EDGES.filter(([a, b]) => a === id || b === id).length || EDGES.length,
    );
  };

  useEffect(() => {
    if (!focused) {
      setLinkCount(EDGES.length);
      return;
    }
    setLinkCount(
      EDGES.filter(([a, b]) => a === focused || b === focused).length,
    );
  }, [focused]);

  return (
    <Spotlight
      className={styles.section}
      color="rgb(0 158 219 / 18%)"
      size={560}
    >
      <section aria-labelledby={titleId} data-goal="17">
        <div className={styles.layout}>
          <div>
            <p className={styles.eyebrow}>Obiettivo 17 · Agenda 2030</p>
            <h3 id={titleId} className={styles.title}>
              {siteConfig.goals[17].title}
            </h3>
            <p className={styles.lead}>
              Rafforzare i mezzi di attuazione e rivitalizzare la partnership
              globale: nessuna sfida si affronta da soli.
            </p>

            <div
              className={styles.actors}
              role="group"
              aria-label="Attori della partnership"
            >
              {ACTORS.map((actor) => {
                const isActive = focused === actor.id;
                return (
                  <button
                    key={actor.id}
                    type="button"
                    className={`${styles.actor} ${isActive ? styles.actorActive : ""}`}
                    aria-pressed={isActive}
                    data-cursor={cursorData.values.link}
                    onClick={() => selectActor(actor.id)}
                    style={
                      isActive
                        ? { boxShadow: `0 0 0 1px ${actor.color}` }
                        : undefined
                    }
                  >
                    {actor.label}
                  </button>
                );
              })}
            </div>

            <div className={styles.detail} aria-live="polite">
              {focusedActor ? (
                <>
                  <p className={styles.detailLabel}>Nodo attivo</p>
                  <p className={styles.detailTitle}>{focusedActor.label}</p>
                  <p className={styles.detailCopy}>{focusedActor.copy}</p>
                </>
              ) : (
                <>
                  <p className={styles.detailLabel}>Rete completa</p>
                  <p className={styles.detailTitle}>Partnership vivente</p>
                  <p className={styles.detailCopy}>
                    Seleziona o trascina un nodo per esplorare come cittadini,
                    scuole, governi, organizzazioni, imprese e associazioni si
                    collegano.
                  </p>
                </>
              )}
            </div>

            <Magnetic strength={10} radius={90} className={styles.ctaWrap}>
              <Link
                href="/argomenti/obiettivo-17"
                className={styles.cta}
                data-cursor={cursorData.values.cta}
              >
                Scopri l&apos;Obiettivo 17
                <span aria-hidden="true">→</span>
              </Link>
            </Magnetic>
          </div>

          <div className={styles.stage} ref={wrapRef}>
            <canvas
              ref={canvasRef}
              className={`${styles.canvas} ${dragging ? styles.canvasDragging : ""}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onPointerLeave={onPointerLeave}
              role="img"
              aria-label="Rete interattiva di collaborazione tra cittadini, scuole, governi, organizzazioni, imprese e associazioni"
              data-cursor={cursorData.values.media}
            />
            <p className={styles.srOnly}>
              Usa i pulsanti degli attori per evidenziare i collegamenti, oppure
              trascina i nodi sulla rete.
            </p>
            <div className={styles.hud}>
              <p className={styles.hudHint}>
                Trascina i nodi · clicca per focalizzare
              </p>
              <p className={styles.hudBadge}>{linkCount} legami</p>
            </div>
          </div>
        </div>
      </section>
    </Spotlight>
  );
}
