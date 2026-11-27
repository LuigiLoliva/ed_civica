"use client";

import { useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { abbinaItems } from "@/data/games/abbina-principio";

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function AbbinaPrincipio() {
  const reduceMotion = useReducedMotion();
  const organs = useMemo(() => shuffle(abbinaItems.map((i) => i)), []);
  const [functions] = useState(() =>
    shuffle(abbinaItems.map((i) => ({ id: i.id, text: i.function }))),
  );
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [message, setMessage] = useState(
    "Seleziona un organo, poi la funzione corrispondente. Oppure trascina.",
  );
  const [checked, setChecked] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [flashPair, setFlashPair] = useState<string | null>(null);
  const dropRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const matchedOrganIds = new Set(Object.keys(matches));
  const matchedFunctionIds = new Set(Object.values(matches));
  const allMatched = Object.keys(matches).length === abbinaItems.length;

  function pair(organId: string, functionId: string) {
    setMatches((prev) => {
      const next = { ...prev };
      for (const [o, f] of Object.entries(next)) {
        if (f === functionId) delete next[o];
      }
      next[organId] = functionId;
      return next;
    });
    setSelectedOrgan(null);
    setChecked(false);
    setMessage("Abbinamento aggiornato.");
    setFlashPair(functionId);
    window.setTimeout(() => setFlashPair(null), 450);
  }

  function onOrganKey(e: React.KeyboardEvent, organId: string) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedOrgan(organId);
      setMessage(`Organo selezionato. Scegli ora una funzione.`);
    }
  }

  function onFunctionKey(e: React.KeyboardEvent, functionId: string) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!selectedOrgan) {
        setMessage("Prima seleziona un organo a sinistra.");
        return;
      }
      pair(selectedOrgan, functionId);
    }
  }

  function onDrop(functionId: string, organId: string) {
    pair(organId, functionId);
  }

  function hitTestDrop(point: { x: number; y: number }): string | null {
    for (const [id, el] of Object.entries(dropRefs.current)) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (
        point.x >= r.left &&
        point.x <= r.right &&
        point.y >= r.top &&
        point.y <= r.bottom
      ) {
        return id;
      }
    }
    return null;
  }

  function onFluidDrag(_: unknown, info: PanInfo, organId: string) {
    setDraggingId(organId);
    setDropTarget(hitTestDrop({ x: info.point.x, y: info.point.y }));
  }

  function onFluidDragEnd(_: unknown, info: PanInfo, organId: string) {
    const hit = hitTestDrop({ x: info.point.x, y: info.point.y });
    setDraggingId(null);
    setDropTarget(null);
    if (hit) onDrop(hit, organId);
  }

  function verify() {
    setChecked(true);
    const correct = abbinaItems.every((item) => matches[item.id] === item.id);
    setMessage(
      correct
        ? "Tutti gli abbinamenti sono corretti. Ben fatto!"
        : "Qualche abbinamento non è corretto: controlla gli elementi evidenziati.",
    );
  }

  function reset() {
    setMatches({});
    setSelectedOrgan(null);
    setChecked(false);
    setMessage("Abbinamenti azzerati.");
    setDraggingId(null);
    setDropTarget(null);
    setFlashPair(null);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
        {message} Tastiera: Tab, Invio/Spazio per selezionare e abbinare.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <ul className="space-y-2" aria-label="Organi ONU">
          {organs.map((organ, i) => {
            const isSelected = selectedOrgan === organ.id;
            const isMatched = matchedOrganIds.has(organ.id);
            const wrong =
              checked &&
              matches[organ.id] !== undefined &&
              matches[organ.id] !== organ.id;
            const isDragging = draggingId === organ.id;

            const className = [
              "w-full cursor-grab rounded-xl border px-4 py-3 text-left active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
              isSelected ? "border-primary bg-primary/10" : "border-border bg-white",
              isMatched && !wrong ? "opacity-80" : "",
              wrong ? "border-rose-400 bg-rose-50" : "",
              isDragging ? "opacity-90" : "",
            ].join(" ");

            const face = (
              <>
                <span className="font-medium">{organ.organ}</span>
                {organ.hint && (
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Hint: {organ.hint}
                  </span>
                )}
              </>
            );

            return (
              <li key={organ.id} className="relative">
                {reduceMotion ? (
                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/organ-id", organ.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onClick={() => {
                      setSelectedOrgan(organ.id);
                      setMessage(`Organo selezionato: ${organ.organ}`);
                    }}
                    onKeyDown={(e) => onOrganKey(e, organ.id)}
                    aria-pressed={isSelected}
                    className={className}
                  >
                    {face}
                  </button>
                ) : (
                  <motion.button
                    type="button"
                    drag
                    dragSnapToOrigin
                    dragElastic={0.18}
                    dragMomentum={false}
                    onDrag={(e, info) => onFluidDrag(e, info, organ.id)}
                    onDragEnd={(e, info) => onFluidDragEnd(e, info, organ.id)}
                    whileDrag={{
                      scale: 1.04,
                      boxShadow: "0 16px 36px -12px rgba(0,110,170,0.45)",
                      zIndex: 40,
                      cursor: "grabbing",
                    }}
                    whileHover={{ y: -1, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.985 }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => {
                      setSelectedOrgan(organ.id);
                      setMessage(`Organo selezionato: ${organ.organ}`);
                    }}
                    onKeyDown={(e) => onOrganKey(e, organ.id)}
                    aria-pressed={isSelected}
                    aria-grabbed={isDragging}
                    className={className}
                  >
                    {face}
                  </motion.button>
                )}
              </li>
            );
          })}
        </ul>

        <ul className="space-y-2" aria-label="Funzioni">
          {functions.map((fn, i) => {
            const taken = matchedFunctionIds.has(fn.id);
            const organForFn = Object.entries(matches).find(
              ([, f]) => f === fn.id,
            )?.[0];
            const wrong =
              checked && organForFn !== undefined && organForFn !== fn.id;
            const correct = checked && organForFn === fn.id;
            const isHot = dropTarget === fn.id;
            const isFlash = flashPair === fn.id;
            return (
              <li key={fn.id}>
                <motion.div
                  ref={(el) => {
                    dropRefs.current[fn.id] = el;
                  }}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (!selectedOrgan) {
                      setMessage("Prima seleziona un organo a sinistra.");
                      return;
                    }
                    pair(selectedOrgan, fn.id);
                  }}
                  onKeyDown={(e) => onFunctionKey(e, fn.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const organId = e.dataTransfer.getData("text/organ-id");
                    if (organId) onDrop(fn.id, organId);
                  }}
                  initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: isHot && !reduceMotion ? 1.02 : 1,
                  }}
                  transition={{
                    delay: reduceMotion ? 0 : i * 0.04,
                    type: "spring",
                    stiffness: 380,
                    damping: 28,
                  }}
                  className={[
                    "relative w-full cursor-pointer overflow-hidden rounded-xl border px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                    "border-border bg-white",
                    taken ? "border-goal-16" : "",
                    wrong ? "border-rose-400 bg-rose-50" : "",
                    correct ? "border-emerald-400 bg-emerald-50" : "",
                    isHot ? "border-primary bg-primary/10 shadow-md" : "",
                  ].join(" ")}
                  aria-label={`Funzione: ${fn.text}${organForFn ? `. Già abbinata.` : ""}`}
                >
                  <AnimatePresence>
                    {isFlash && !reduceMotion && (
                      <motion.span
                        className="pointer-events-none absolute inset-0 bg-primary/15"
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45 }}
                        aria-hidden
                      />
                    )}
                  </AnimatePresence>
                  <span className="relative">{fn.text}</span>
                  {organForFn && (
                    <motion.span
                      className="relative mt-1 block text-xs text-goal-16"
                      initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      Abbinato a:{" "}
                      {abbinaItems.find((item) => item.id === organForFn)?.organ}
                    </motion.span>
                  )}
                </motion.div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <motion.button
          type="button"
          onClick={verify}
          disabled={!allMatched}
          whileTap={reduceMotion || !allMatched ? undefined : { scale: 0.97 }}
          className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Verifica
        </motion.button>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-border px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Azzera
        </button>
      </div>
    </div>
  );
}
