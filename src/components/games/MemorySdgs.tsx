"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { memoryPairs } from "@/data/games/memory-sdgs";

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

export function MemorySdgs() {
  const reduceMotion = useReducedMotion();
  const [deck, setDeck] = useState(() => buildDeck());
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [lock, setLock] = useState(false);
  const [moves, setMoves] = useState(0);

  const done = matched.length === memoryPairs.length;

  const status = useMemo(() => {
    if (done) return `Completato in ${moves} mosse.`;
    return `Coppie trovate: ${matched.length}/${memoryPairs.length}. Mosse: ${moves}.`;
  }, [done, matched.length, moves]);

  function reset() {
    setDeck(buildDeck());
    setFlipped([]);
    setMatched([]);
    setLock(false);
    setMoves(0);
  }

  function onSelect(card: Card) {
    if (lock) return;
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
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        role="group"
        aria-label="Griglia memory"
      >
        {deck.map((card) => {
          const isOpen = flipped.includes(card.key) || matched.includes(card.pairId);
          return (
            <motion.button
              key={card.key}
              type="button"
              aria-pressed={isOpen}
              aria-label={
                isOpen
                  ? `${card.face === "symbol" ? "Simbolo" : "Nome"}: ${card.label}`
                  : "Carta coperta"
              }
              disabled={lock && !isOpen}
              onClick={() => onSelect(card)}
              onKeyDown={(e) => onKeyDown(e, card)}
              className="min-h-28 rounded-lg border border-border p-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              style={{
                background: isOpen
                  ? card.accent
                    ? `${card.accent}14`
                    : "var(--warm-surface)"
                  : "white",
                borderColor: isOpen && card.accent ? card.accent : undefined,
              }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              {isOpen ? (
                <span className="block space-y-1">
                  <span className="block text-xs uppercase tracking-wide text-muted-foreground">
                    {card.face === "symbol" ? "Simbolo" : "Nome"}
                  </span>
                  <span className="block font-medium text-foreground">
                    {card.label}
                  </span>
                  {card.hint && (
                    <span className="block text-xs text-muted-foreground">
                      {card.hint}
                    </span>
                  )}
                </span>
              ) : (
                <span className="flex h-full items-center justify-center text-2xl text-primary">
                  ◆
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
      {done && (
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary px-4 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Rigioca
        </button>
      )}
    </div>
  );
}
