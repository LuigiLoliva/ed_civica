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

type Vec3 = { x: number; y: number; z: number };

type SimNode = {
  id: ActorId;
  base: Vec3;
  pos: Vec3;
  vel: Vec3;
  color: string;
  label: string;
  short: string;
  phase: number;
};

type Packet = {
  from: number;
  to: number;
  t: number;
  speed: number;
  color: string;
};

type Projected = {
  x: number;
  y: number;
  scale: number;
  depth: number;
};

function createNodes(): SimNode[] {
  return ACTORS.map((actor, i) => {
    const angle = (Math.PI * 2 * i) / ACTORS.length - Math.PI / 2;
    const elev = ((i % 3) - 1) * 0.42;
    const radius = 1.05 + (i % 2) * 0.18;
    const base = {
      x: Math.cos(angle) * radius * Math.cos(elev),
      y: Math.sin(elev) * 0.85,
      z: Math.sin(angle) * radius * Math.cos(elev),
    };
    return {
      id: actor.id,
      base,
      pos: { ...base },
      vel: { x: 0, y: 0, z: 0 },
      color: actor.color,
      label: actor.label,
      short: actor.short,
      phase: i * 1.1,
    };
  });
}

function project(
  p: Vec3,
  w: number,
  h: number,
  rotY: number,
  rotX: number,
): Projected {
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);

  const x1 = p.x * cosY - p.z * sinY;
  const z1 = p.x * sinY + p.z * cosY;
  const y2 = p.y * cosX - z1 * sinX;
  const z2 = p.y * sinX + z1 * cosX;

  const fov = 3.2;
  const depth = z2 + 3.15;
  const scale = (fov / Math.max(0.45, depth)) * Math.min(w, h) * 0.32;
  return {
    x: w * 0.52 + x1 * scale * 1.05,
    y: h * 0.58 + y2 * scale * 0.88,
    scale,
    depth,
  };
}

function noise3(t: number, phase: number): Vec3 {
  return {
    x: Math.sin(t * 0.00055 + phase) * 0.14 + Math.sin(t * 0.001 + phase * 2) * 0.07,
    y: Math.cos(t * 0.0007 + phase * 1.3) * 0.12 + Math.sin(t * 0.0012 + phase) * 0.05,
    z: Math.sin(t * 0.00065 + phase * 0.7) * 0.14 + Math.cos(t * 0.0009 + phase * 1.7) * 0.06,
  };
}

export function Goal17Network() {
  const reduceMotion = usePrefersReducedMotion();
  const titleId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<SimNode[]>(createNodes());
  const packetsRef = useRef<Packet[]>([]);
  const focusedRef = useRef<ActorId | null>("organizzazioni");
  const dragRef = useRef<{
    index: number;
    grabOffset: Vec3;
  } | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const rotRef = useRef({ y: 0.35, x: 0.18, targetY: 0.35, targetX: 0.18 });
  const sizeRef = useRef({ w: 0, h: 0 });
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

  useEffect(() => {
    packetsRef.current = EDGES.slice(0, 8).map(([a, b], i) => {
      const from = ACTORS.findIndex((x) => x.id === a);
      const to = ACTORS.findIndex((x) => x.id === b);
      return {
        from,
        to,
        t: i / 8,
        speed: 0.0018 + (i % 4) * 0.0005,
        color: ACTORS[from]?.color ?? "#7ec8e3",
      };
    });
  }, []);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const w = Math.max(320, Math.floor(stage.clientWidth));
    const h = Math.max(420, Math.floor(stage.clientHeight));
    if (w === sizeRef.current.w && h === sizeRef.current.h) return;
    sizeRef.current = { w, h };
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

    const step = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const nodes = nodesRef.current;
      const focusedId = focusedRef.current;
      const drag = dragRef.current;
      const rot = rotRef.current;

      if (!reduceMotion) {
        rot.y += (rot.targetY - rot.y) * 0.04;
        rot.x += (rot.targetX - rot.x) * 0.04;
        // Slow auto orbit when idle
        if (!pointerRef.current && !drag) {
          rot.targetY += 0.00035 * dt;
        }
      }

      // Organic 3D motion
      if (!reduceMotion) {
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i]!;
          if (drag?.index === i) continue;
          const n = noise3(now, node.phase);
          const target = {
            x: node.base.x + n.x,
            y: node.base.y + n.y,
            z: node.base.z + n.z,
          };
          node.vel.x += (target.x - node.pos.x) * 0.0022 * dt;
          node.vel.y += (target.y - node.pos.y) * 0.0022 * dt;
          node.vel.z += (target.z - node.pos.z) * 0.0022 * dt;
          node.vel.x *= 0.86;
          node.vel.y *= 0.86;
          node.vel.z *= 0.86;
          node.pos.x += node.vel.x;
          node.pos.y += node.vel.y;
          node.pos.z += node.vel.z;
        }

        for (const packet of packetsRef.current) {
          packet.t += packet.speed * (dt / 16);
          if (packet.t > 1) packet.t -= 1;
        }
      }

      const projected = nodes.map((node) =>
        project(node.pos, w, h, rot.y, rot.x),
      );

      // Light direction from pointer (or soft default)
      const lightScreen = pointerRef.current ?? {
        x: w * 0.62,
        y: h * 0.28,
      };

      ctx.clearRect(0, 0, w, h);

      // Giant watermark (canvas cannot resolve CSS font vars)
      ctx.save();
      ctx.font = `600 ${Math.min(w, h) * 0.56}px Georgia, "Times New Roman", serif`;
      ctx.fillStyle = "rgb(255 255 255 / 6.5%)";
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText("17", w * 0.01, h * 1.02);
      ctx.restore();

      // Atmospheric depth fog
      const atm = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        30,
        w * 0.5,
        h * 0.5,
        Math.min(w, h) * 0.72,
      );
      atm.addColorStop(0, "rgb(0 158 219 / 22%)");
      atm.addColorStop(0.45, "rgb(25 72 106 / 12%)");
      atm.addColorStop(1, "rgb(0 0 0 / 0%)");
      ctx.fillStyle = atm;
      ctx.fillRect(0, 0, w, h);

      // Dynamic spotlight (stronger bloom)
      const spot = ctx.createRadialGradient(
        lightScreen.x,
        lightScreen.y,
        8,
        lightScreen.x,
        lightScreen.y,
        Math.min(w, h) * 0.55,
      );
      spot.addColorStop(0, "rgb(210 240 255 / 28%)");
      spot.addColorStop(0.3, "rgb(0 158 219 / 12%)");
      spot.addColorStop(1, "rgb(0 0 0 / 0%)");
      ctx.fillStyle = spot;
      ctx.fillRect(0, 0, w, h);

      // Core hub
      const hub = project({ x: 0, y: 0, z: 0 }, w, h, rot.y, rot.x);
      const hubGlow = ctx.createRadialGradient(
        hub.x,
        hub.y,
        2,
        hub.x,
        hub.y,
        hub.scale * 0.9,
      );
      hubGlow.addColorStop(0, "rgb(255 255 255 / 80%)");
      hubGlow.addColorStop(0.25, "rgb(0 158 219 / 45%)");
      hubGlow.addColorStop(1, "rgb(0 158 219 / 0%)");
      ctx.fillStyle = hubGlow;
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, hub.scale * 0.9, 0, Math.PI * 2);
      ctx.fill();

      const indexById = Object.fromEntries(
        nodes.map((n, i) => [n.id, i]),
      ) as Record<ActorId, number>;

      // Depth-sorted edges
      type EdgeDraw = {
        ax: number;
        ay: number;
        bx: number;
        by: number;
        hot: boolean;
        midZ: number;
      };
      const edges: EdgeDraw[] = [];
      for (const [aId, bId] of EDGES) {
        const ai = indexById[aId];
        const bi = indexById[bId];
        const a = projected[ai];
        const b = projected[bi];
        if (!a || !b) continue;
        const hot =
          focusedId === null || focusedId === aId || focusedId === bId;
        edges.push({
          ax: a.x,
          ay: a.y,
          bx: b.x,
          by: b.y,
          hot,
          midZ: (a.depth + b.depth) / 2,
        });
      }
      edges.sort((a, b) => b.midZ - a.midZ);

      for (const e of edges) {
        const mx = (e.ax + e.bx) / 2;
        const my = (e.ay + e.by) / 2 - 18;
        ctx.beginPath();
        ctx.moveTo(e.ax, e.ay);
        ctx.quadraticCurveTo(mx, my, e.bx, e.by);
        if (e.hot) {
          const grad = ctx.createLinearGradient(e.ax, e.ay, e.bx, e.by);
          grad.addColorStop(0, "rgb(126 200 227 / 70%)");
          grad.addColorStop(0.5, "rgb(255 255 255 / 55%)");
          grad.addColorStop(1, "rgb(0 158 219 / 65%)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2.4;
          ctx.shadowColor = "rgb(0 158 219 / 55%)";
          ctx.shadowBlur = 14;
        } else {
          ctx.strokeStyle = "rgb(126 200 227 / 14%)";
          ctx.lineWidth = 1.1;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Packets along curves
      if (!reduceMotion) {
        for (const packet of packetsRef.current) {
          const a = projected[packet.from];
          const b = projected[packet.to];
          const na = nodes[packet.from];
          const nb = nodes[packet.to];
          if (!a || !b || !na || !nb) continue;
          const hot =
            focusedId === null ||
            focusedId === na.id ||
            focusedId === nb.id;
          if (!hot) continue;
          const t = packet.t;
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2 - 18;
          const ox =
            (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * mx + t * t * b.x;
          const oy =
            (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * my + t * t * b.y;
          ctx.beginPath();
          ctx.arc(ox, oy, 4.6, 0, Math.PI * 2);
          ctx.fillStyle = packet.color;
          ctx.shadowColor = packet.color;
          ctx.shadowBlur = 22;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Depth-sorted nodes
      const order = projected
        .map((p, i) => ({ p, i }))
        .sort((a, b) => b.p.depth - a.p.depth);

      for (const { p, i } of order) {
        const node = nodes[i]!;
        const isFocus = focusedId === node.id;
        const dimmed = focusedId !== null && !isFocus;
        const radius =
          p.scale *
          0.2 *
          (isFocus ? 1.22 : 1) *
          (reduceMotion ? 1 : 1 + Math.sin(now / 480 + node.phase) * 0.06);

        // Lighting: brighter when facing light screen
        const dx = lightScreen.x - p.x;
        const dy = lightScreen.y - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        const lit = Math.max(0.35, 1 - dist / (Math.min(w, h) * 0.7));

        // Soft contact shadow
        ctx.beginPath();
        ctx.ellipse(
          p.x,
          p.y + radius * 1.15,
          radius * 0.85,
          radius * 0.28,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = `rgb(0 0 0 / ${12 + lit * 10}%)`;
        ctx.fill();

        // Outer bloom
        const glow = ctx.createRadialGradient(
          p.x,
          p.y,
          radius * 0.15,
          p.x,
          p.y,
          radius * 3.2,
        );
        glow.addColorStop(
          0,
          dimmed ? "rgb(0 158 219 / 0%)" : `${node.color}66`,
        );
        glow.addColorStop(0.45, dimmed ? "rgb(0 0 0 / 0%)" : `${node.color}22`);
        glow.addColorStop(1, "rgb(0 0 0 / 0%)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 3.2, 0, Math.PI * 2);
        ctx.fill();

        // Sphere body — emissive actor color + specular
        const body = ctx.createRadialGradient(
          p.x - radius * 0.38,
          p.y - radius * 0.42,
          radius * 0.08,
          p.x,
          p.y,
          radius,
        );
        const hi = dimmed ? 35 : Math.round(55 + lit * 40);
        body.addColorStop(0, `rgb(255 255 255 / ${hi}%)`);
        body.addColorStop(0.28, node.color);
        body.addColorStop(0.7, node.color);
        body.addColorStop(1, dimmed ? "rgb(8 28 44 / 88%)" : "#021018");
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = body;
        ctx.shadowColor = dimmed ? "transparent" : `${node.color}88`;
        ctx.shadowBlur = isFocus ? 28 : 16;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = isFocus ? 2.8 : 1.4;
        ctx.strokeStyle = dimmed
          ? "rgb(126 200 227 / 22%)"
          : `rgb(255 255 255 / ${45 + lit * 45}%)`;
        ctx.stroke();

        if (isFocus) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius + 10, 0, Math.PI * 2);
          ctx.strokeStyle = "rgb(0 158 219 / 45%)";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 6]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.fillStyle = dimmed ? "rgb(255 255 255 / 45%)" : "#fff";
        ctx.font = `700 ${Math.max(13, radius * 0.42)}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.short, p.x, p.y - 1);

        ctx.fillStyle = dimmed
          ? "rgb(255 255 255 / 40%)"
          : "rgb(238 245 249 / 92%)";
        ctx.font = `600 ${Math.max(13, radius * 0.32)}px system-ui, sans-serif`;
        ctx.fillText(node.label, p.x, p.y + radius + Math.max(18, radius * 0.35));
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reduceMotion]);

  const hitTest = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return -1;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const rot = rotRef.current;
    const projected = nodesRef.current.map((node) =>
      project(node.pos, w, h, rot.y, rot.x),
    );
    let best = -1;
    let bestDist = Infinity;
    for (let i = 0; i < projected.length; i++) {
      const p = projected[i]!;
      const r = p.scale * 0.28;
      const d = Math.hypot(p.x - x, p.y - y);
      if (d <= r + 12 && d < bestDist) {
        best = i;
        bestDist = d;
      }
    }
    return best;
  }, []);

  const toLocal = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      nx: (event.clientX - rect.left) / rect.width,
      ny: (event.clientY - rect.top) / rect.height,
    };
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const { x, y } = toLocal(event);
    const index = hitTest(x, y);
    if (index < 0) {
      setFocused(null);
      return;
    }
    const node = nodesRef.current[index]!;
    setFocused(node.id);
    dragRef.current = {
      index,
      grabOffset: { ...node.pos },
    };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const local = toLocal(event);
    pointerRef.current = { x: local.x, y: local.y };

    if (!reduceMotion) {
      rotRef.current.targetY = 0.35 + (local.nx - 0.5) * 0.9;
      rotRef.current.targetX = 0.18 + (0.5 - local.ny) * 0.45;
    }

    const drag = dragRef.current;
    if (!drag) return;
    const node = nodesRef.current[drag.index];
    if (!node) return;

    // Map screen delta into approximate 3D tangential move
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const dx = (local.x - w * 0.5) / (Math.min(w, h) * 0.28);
    const dy = (local.y - h * 0.52) / (Math.min(w, h) * 0.28);
    const rot = rotRef.current;
    const cosY = Math.cos(-rot.y);
    const sinY = Math.sin(-rot.y);
    const worldX = dx * cosY;
    const worldZ = dx * sinY;
    node.pos.x = worldX;
    node.pos.y = dy * 0.7;
    node.pos.z = worldZ;
    node.vel = { x: 0, y: 0, z: 0 };
    // Keep base near drag so it spring-returns nearby
    node.base.x = node.pos.x * 0.85;
    node.base.y = node.pos.y * 0.85;
    node.base.z = node.pos.z * 0.85;
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
    <section
      className={styles.experience}
      aria-labelledby={titleId}
      data-goal="17"
    >
      <p className={styles.watermark} aria-hidden>
        17
      </p>

      <div className={styles.stage} ref={stageRef}>
        <canvas
          ref={canvasRef}
          className={`${styles.canvas} ${dragging ? styles.canvasDragging : ""}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerLeave}
          role="img"
          aria-label="Rete tridimensionale interattiva di collaborazione tra cittadini, scuole, governi, organizzazioni, imprese e associazioni"
          data-cursor={cursorData.values.media}
        />
      </div>

      <div className={styles.hud}>
        <p className={styles.hudBadge}>
          {linkCount}
          <span>legami attivi</span>
        </p>
        <p className={styles.hudHint}>
          Trascina i nodi · la luce segue il cursore
        </p>
      </div>

      <div className={styles.overlay}>
        <div className={styles.top}>
          <p className={styles.eyebrow}>Obiettivo 17 · Agenda 2030</p>
          <h3 id={titleId} className={styles.title}>
            Partnership
            <span className={styles.titleAccent}>per gli obiettivi</span>
          </h3>
          <p className={styles.lead}>
            Rafforzare i mezzi di attuazione e rivitalizzare la partnership
            globale: nessuna sfida si affronta da soli.
          </p>
        </div>

        <div className={styles.bottom}>
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
                >
                  {actor.label}
                </button>
              );
            })}
          </div>

          <div>
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
                    collegano nello spazio.
                  </p>
                </>
              )}
            </div>
            <div className={styles.ctaRow}>
              <Magnetic strength={12} radius={100}>
                <Link
                  href={`/argomenti/${siteConfig.goals[17].slug}`}
                  className={styles.cta}
                  data-cursor={cursorData.values.cta}
                >
                  Scopri l&apos;Obiettivo 17
                  <span aria-hidden>→</span>
                </Link>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>

      <p className={styles.srOnly}>
        Usa i pulsanti degli attori per evidenziare i collegamenti, oppure
        trascina i nodi sulla rete tridimensionale.
      </p>
    </section>
  );
}
