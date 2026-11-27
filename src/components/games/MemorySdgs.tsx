"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { memoryPairs } from "@/data/games/memory-sdgs";
import { MatchBurst } from "@/components/games/MatchBurst";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionDuration, motionSpring } from "@/lib/motion/tokens";

type Card = {
  key: string;
  pairId: string;
  face: "symbol" | "name";
  label: string;
  hint?: string;
  accent?: string;
};

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildDeck(): Card[] {
  const cards: Card[] = memoryPairs.flatMap((pair) => [
    {
      key: `${pair.id}-symbol`,
      pairId: pair.id,
      face: "symbol" as const,
      label: pair.symbolLabel,
      hint: pair.symbolHint,
      accent: pair.accent,
    },
    {
      key: `${pair.id}-name`,
      pairId: pair.id,
      face: "name" as const,
      label: pair.nameLabel,
      accent: pair.accent,
    },
  ]);
  return shuffle(cards);
}

function CardFaceOpen({ card }: { card: Card }) {
  return (
    <span className="block space-y-1">
      <span className="block text-xs uppercase tracking-wide text-muted-foreground">
        {card.face === "symbol" ? "Simbolo" : "Nome"}
      </span>
      <span className="block font-medium text-foreground">{card.label}</span>
      {card.hint && (
        <span className="block text-xs text-muted-foreground">{card.hint}</span>
      )}
    </span>
  );
}

function CardFaceCovered({ accent }: { accent: string }) {
  return (
    <span className="relative flex h-10 w-10 items-center justify-center">
      <span
        className="absolute inset-0 rounded-full opacity-30"
        style={{
          background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
        }}
      />
      <span className="text-2xl text-primary/80">◆</span>
    </span>
  );
}

export function MemorySdgs() {
  const reduceMotion = usePrefersReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  // Shuffle only after mount to avoid SSR/client hydration mismatch.
  const [deck, setDeck] = useState<Card[] | null>(null);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [lock, setLock] = useState(false);
  const [moves, setMoves] = useState(0);
  const [burst, setBurst] = useState({
    key: 0,
    x: 0,
    y: 0,
    color: "var(--onu)",
  });

  useEffect(() => {
    setDeck(buildDeck());
  }, []);

  const done = matched.length === memoryPairs.length;

  const status = useMemo(() => {
    if (!deck) return "Preparazione mazzo…";
    if (done) return `Completato in ${moves} mosse.`;
    return `Coppie trovate: ${matched.length}/${memoryPairs.length}. Mosse: ${moves}.`;
  }, [deck, done, matched.length, moves]);

  function reset() {
    setDeck(buildDeck());
    setFlipped([]);
    setMatched([]);
    setLock(false);
    setMoves(0);
  }

  function fireBurst(cardKeys: string[], color?: string) {
    if (reduceMotion || !gridRef.current) return;
    const gridBox = gridRef.current.getBoundingClientRect();
    const centers = cardKeys
      .map((key) => {
        const el = gridRef.current?.querySelector(
          `[data-card-key="${key}"]`,
        ) as HTMLElement | null;
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - gridBox.left,
          y: r.top + r.height / 2 - gridBox.top,
        };
      })
      .filter(Boolean) as { x: number; y: number }[];

    if (!centers.length) return;
    const mid = {
      x: centers.reduce((s, c) => s + c.x, 0) / centers.length,
      y: centers.reduce((s, c) => s + c.y, 0) / centers.length,
    };
    setBurst((b) => ({
      key: b.key + 1,
      x: mid.x,
      y: mid.y,
      color: color || "var(--onu)",
    }));
  }

  function onSelect(card: Card) {
    if (!deck || lock) return;
    if (matched.includes(card.pairId)) return;
    if (flipped.includes(card.key)) return;
    if (flipped.length >= 2) return;

    const next = [...flipped, card.key];
    setFlipped(next);

    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [aKey, bKey] = next;
      const a = deck.find((c) => c.key === aKey);
      const b = deck.find((c) => c.key === bKey);
      if (a && b && a.pairId === b.pairId && a.face !== b.face) {
        setMatched((m) => [...m, a.pairId]);
        setFlipped([]);
        fireBurst([aKey, bKey], a.accent || "var(--onu)");
      } else {
        setLock(true);
        window.setTimeout(() => {
          setFlipped([]);
          setLock(false);
        }, reduceMotion ? 200 : 800);
      }
    }
  }

  function onKeyDown(e: React.KeyboardEvent, card: Card) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(card);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
        {status} Usa Tab e Invio/Spazio per girare le carte.
      </p>
      {!deck ? (
        <div
          className="grid min-h-64 grid-cols-2 gap-3 sm:grid-cols-3"
          aria-busy="true"
          aria-label="Caricamento griglia memory"
        >
          {Array.from({ length: memoryPairs.length * 2 }).map((_, i) => (
            <div
              key={i}
              className="min-h-28 rounded-xl border border-border bg-white/70"
            />
          ))}
        </div>
      ) : (
      <div
        ref={gridRef}
        className="relative grid grid-cols-2 gap-3 sm:grid-cols-3"
        role="group"
        aria-label="Griglia memory"
        style={{ perspective: reduceMotion ? undefined : 1200 }}
      >
        <MatchBurst
          triggerKey={burst.key}
          x={burst.x}
          y={burst.y}
          color={burst.color}
        />
        {deck.map((card, index) => {
          const isMatched = matched.includes(card.pairId);
          const isOpen = flipped.includes(card.key) || isMatched;
          const accent = card.accent || "var(--onu)";

          return (
            <motion.button
              key={card.key}
              type="button"
              data-card-key={card.key}
              aria-pressed={isOpen}
              aria-label={
                isOpen
                  ? `${card.face === "symbol" ? "Simbolo" : "Nome"}: ${card.label}`
                  : "Carta coperta"
              }
              disabled={lock && !isOpen}
              onClick={() => onSelect(card)}
              onKeyDown={(e) => onKeyDown(e, card)}
              className="relative min-h-28 rounded-xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              style={{
                transformStyle: reduceMotion ? undefined : "preserve-3d",
                WebkitTapHighlightColor: "transparent",
              }}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: isMatched && !reduceMotion ? [1, 1.04, 1] : 1,
              }}
              transition={{
                delay: reduceMotion ? 0 : index * 0.03,
                duration: motionDuration.fast,
                scale: { duration: motionDuration.base },
              }}
              whileHover={
                reduceMotion || isOpen
                  ? undefined
                  : { y: -2, transition: { duration: motionDuration.instant } }
              }
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            >
              {reduceMotion ? (
                <span
                  className={[
                    "flex min-h-28 w-full items-center rounded-xl border p-3",
                    isOpen ? "" : "justify-center bg-white",
                  ].join(" ")}
                  style={
                    isOpen
                      ? {
                          background: `${accent}14`,
                          borderColor: accent,
                        }
                      : undefined
                  }
                >
                  {isOpen ? (
                    <CardFaceOpen card={card} />
                  ) : (
                    <CardFaceCovered accent={accent} />
                  )}
                </span>
              ) : (
                <motion.span
                  className="relative block h-full min-h-28 w-full"
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{ rotateY: isOpen ? 180 : 0 }}
                  transition={{ type: "spring", ...motionSpring.magnetic }}
                >
                  <span
                    className="absolute inset-0 flex items-center justify-center rounded-xl border border-border bg-gradient-to-br from-white via-warm-surface to-[#c8e3f1] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    <CardFaceCovered accent={accent} />
                  </span>
                  <span
                    className="absolute inset-0 flex flex-col justify-center rounded-xl border p-3 shadow-sm"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      background: `${accent}14`,
                      borderColor: accent,
                      boxShadow: isMatched
                        ? `0 0 0 1px ${accent}, 0 8px 24px ${accent}33`
                        : undefined,
                    }}
                  >
                    <CardFaceOpen card={card} />
                  </span>
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
      )}
      {done && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-3"
        >
          <p className="font-heading text-lg text-goal-16">
            Tutte le coppie trovate!
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-primary px-4 py-2 text-white transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Rigioca
          </button>
        </motion.div>
      )}
    </div>
  );
}
