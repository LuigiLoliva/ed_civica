import { useId } from "react";

import { cn } from "@/lib/utils";

type Motif = "orbits" | "balance" | "network" | "rays";

type GenerativeCoverProps = {
  /** Seme deterministico (slug articolo): stessa copertina su server e client. */
  seed: string;
  topicSlug?: string;
  /** Classi Tailwind del gradiente (`from-… to-…`). */
  gradient: string;
  className?: string;
};

const TOPIC_MOTIF: Record<string, Motif> = {
  "onu-storia-struttura": "orbits",
  "obiettivo-16": "balance",
  "giustizia-internazionale": "balance",
  "obiettivo-17": "network",
  "cooperazione-partnership": "network",
  "diritti-umani": "rays",
};

const TOPIC_MARK: Record<string, string> = {
  "onu-storia-struttura": "ONU",
  "obiettivo-16": "16",
  "obiettivo-17": "17",
};

const MOTIFS: Motif[] = ["orbits", "balance", "network", "rays"];

function hashSeed(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRandom(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (value: number) => Number(value.toFixed(1));

/**
 * Copertina generativa per gli articoli senza immagine: composizione grafica
 * deterministica (orbite, bilancia, rete, raggi) al posto del gradiente piatto.
 * Reagisce all'hover del genitore `.group`.
 */
export function GenerativeCover({
  seed,
  topicSlug,
  gradient,
  className,
}: GenerativeCoverProps) {
  const id = useId().replace(/:/g, "");
  const hash = hashSeed(seed);
  const rand = seededRandom(hash);
  const motif = (topicSlug && TOPIC_MOTIF[topicSlug]) || MOTIFS[hash % MOTIFS.length];
  const mark = topicSlug ? TOPIC_MARK[topicSlug] : undefined;

  const cx = f(250 + rand() * 70);
  const cy = f(105 + rand() * 50);

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden bg-gradient-to-br",
        gradient,
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgb(255_255_255_/_30%),transparent_46%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(200deg,transparent_35%,rgb(4_14_26_/_55%)_100%)]" />

      {mark ? (
        <span className="font-heading absolute -bottom-[0.22em] -left-[0.04em] text-[clamp(7rem,19vw,17rem)] leading-none font-semibold tracking-[-0.05em] text-white/[0.13] transition-transform duration-[1400ms] ease-out group-hover:translate-x-3">
          {mark}
        </span>
      ) : null}

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <pattern id={`dots-${id}`} width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="white" />
          </pattern>
          <radialGradient id={`glow-${id}`}>
            <stop offset="0" stopColor="white" stopOpacity="0.85" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="300" fill={`url(#dots-${id})`} opacity="0.16" />

        <g
          className="origin-center transition-transform duration-[1400ms] ease-out [transform-box:fill-box] group-hover:scale-110 group-hover:rotate-6"
          stroke="white"
          strokeLinecap="round"
        >
          {motif === "orbits" ? <Orbits cx={cx} cy={cy} seed={hash + 7} glow={`glow-${id}`} /> : null}
          {motif === "balance" ? <Balance cx={cx} cy={cy} seed={hash + 7} glow={`glow-${id}`} /> : null}
          {motif === "network" ? <Network seed={hash + 7} glow={`glow-${id}`} /> : null}
          {motif === "rays" ? <Rays seed={hash + 7} glow={`glow-${id}`} /> : null}
        </g>
      </svg>
    </div>
  );
}

/** Ogni motivo ricrea il proprio generatore: render puro anche in StrictMode. */
type MotifProps = { seed: number; glow: string };

function Orbits({ cx, cy, seed, glow }: MotifProps & { cx: number; cy: number }) {
  const rand = seededRandom(seed);
  const rings = [34, 62, 94, 130, 170];
  return (
    <>
      <circle cx={cx} cy={cy} r="46" fill={`url(#${glow})`} stroke="none" opacity="0.5" />
      <ellipse cx={cx} cy={cy} rx="13" ry="34" strokeWidth="0.8" opacity="0.7" />
      <path d={`M${cx - 34} ${cy}h68`} strokeWidth="0.8" opacity="0.7" />
      {rings.map((radius, index) => {
        const angle = rand() * Math.PI * 2;
        return (
          <g key={radius}>
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              strokeWidth={index === 0 ? 1.2 : 0.8}
              opacity={f(0.75 - index * 0.12)}
              strokeDasharray={index % 2 ? "2 7" : undefined}
            />
            <circle
              cx={f(cx + Math.cos(angle) * radius)}
              cy={f(cy + Math.sin(angle) * radius)}
              r={f(2.2 + rand() * 2.4)}
              fill="white"
              stroke="none"
            />
          </g>
        );
      })}
    </>
  );
}

function Balance({ cx, cy, seed, glow }: MotifProps & { cx: number; cy: number }) {
  const rand = seededRandom(seed);
  const tilt = f(-7 + rand() * 14);
  const arm = 104;
  return (
    <>
      <circle cx={cx} cy={cy} r="60" fill={`url(#${glow})`} stroke="none" opacity="0.35" />
      {[150, 112, 76].map((radius, index) => (
        <circle
          key={radius}
          cx={cx}
          cy={cy}
          r={radius}
          strokeWidth="0.7"
          opacity={f(0.22 + index * 0.1)}
          strokeDasharray={index === 1 ? "1 8" : undefined}
        />
      ))}
      <path d={`M${cx} ${cy - 62}V${cy + 110}`} strokeWidth="1" opacity="0.7" />
      <g transform={`rotate(${tilt} ${cx} ${cy - 40})`}>
        <path d={`M${cx - arm} ${cy - 40}h${arm * 2}`} strokeWidth="1.6" />
        {[-arm, arm].map((offset) => (
          <g key={offset}>
            <path
              d={`M${cx + offset} ${cy - 40}l-26 62h52z`}
              strokeWidth="0.9"
              opacity="0.8"
              strokeLinejoin="round"
            />
            <path
              d={`M${cx + offset - 30} ${cy + 22}a30 13 0 0 0 60 0`}
              strokeWidth="1.4"
            />
            <circle cx={cx + offset} cy={cy - 40} r="3" fill="white" stroke="none" />
          </g>
        ))}
      </g>
      <circle cx={cx} cy={cy - 62} r="5" fill="white" stroke="none" />
    </>
  );
}

function Network({ seed, glow }: MotifProps) {
  const rand = seededRandom(seed);
  const nodes = Array.from({ length: 11 }, () => ({
    x: f(120 + rand() * 260),
    y: f(24 + rand() * 210),
    r: f(2 + rand() * 3.4),
  }));
  const edges: [number, number][] = [];
  nodes.forEach((node, a) => {
    nodes.forEach((other, b) => {
      if (b <= a) return;
      if (Math.hypot(node.x - other.x, node.y - other.y) < 118) edges.push([a, b]);
    });
  });
  return (
    <>
      {edges.map(([a, b]) => (
        <path
          key={`${a}-${b}`}
          d={`M${nodes[a].x} ${nodes[a].y}L${nodes[b].x} ${nodes[b].y}`}
          strokeWidth="0.8"
          opacity="0.5"
        />
      ))}
      {nodes.map((node, index) => (
        <g key={index}>
          <circle
            cx={node.x}
            cy={node.y}
            r={f(node.r * 4.5)}
            fill={`url(#${glow})`}
            stroke="none"
            opacity="0.55"
          />
          <circle cx={node.x} cy={node.y} r={node.r} fill="white" stroke="none" />
        </g>
      ))}
    </>
  );
}

function Rays({ seed, glow }: MotifProps) {
  const rand = seededRandom(seed);
  const ox = 330;
  const oy = 250;
  const count = 22;
  return (
    <>
      <circle cx={ox} cy={oy} r="90" fill={`url(#${glow})`} stroke="none" opacity="0.45" />
      {Array.from({ length: count }, (_, index) => {
        const angle = Math.PI + (index / (count - 1)) * (Math.PI / 2) * 1.15 - 0.1;
        const length = 150 + rand() * 190;
        return (
          <path
            key={index}
            d={`M${f(ox + Math.cos(angle) * 34)} ${f(oy + Math.sin(angle) * 34)}L${f(ox + Math.cos(angle) * length)} ${f(oy + Math.sin(angle) * length)}`}
            strokeWidth={index % 4 === 0 ? 1.4 : 0.7}
            opacity={f(0.35 + rand() * 0.5)}
          />
        );
      })}
      {[34, 120, 210].map((radius) => (
        <path
          key={radius}
          d={`M${ox - radius} ${oy}A${radius} ${radius} 0 0 1 ${ox} ${oy - radius}`}
          strokeWidth="0.8"
          opacity="0.5"
          strokeDasharray={radius === 120 ? "2 8" : undefined}
        />
      ))}
    </>
  );
}
