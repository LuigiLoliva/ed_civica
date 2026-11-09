"use client";

import { useMemo, useState } from "react";
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
  const organs = useMemo(() => shuffle(abbinaItems.map((i) => i)), []);
  const [functions] = useState(() => shuffle(abbinaItems.map((i) => ({ id: i.id, text: i.function }))));
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("Seleziona un organo, poi la funzione corrispondente. Oppure usa Trascina.");
  const [checked, setChecked] = useState(false);

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
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
        {message} Tastiera: Tab, Invio/Spazio per selezionare e abbinare.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <ul className="space-y-2" aria-label="Organi ONU">
          {organs.map((organ) => {
            const isSelected = selectedOrgan === organ.id;
            const isMatched = matchedOrganIds.has(organ.id);
            const wrong =
              checked && matches[organ.id] !== undefined && matches[organ.id] !== organ.id;
            return (
              <li key={organ.id}>
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
                  className={[
                    "w-full rounded-lg border px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                    isSelected ? "border-primary bg-primary/10" : "border-border bg-white",
                    isMatched && !wrong ? "opacity-80" : "",
                    wrong ? "border-rose-400 bg-rose-50" : "",
                  ].join(" ")}
                >
                  <span className="font-medium">{organ.organ}</span>
                  {organ.hint && (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Hint: {organ.hint}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <ul className="space-y-2" aria-label="Funzioni">
          {functions.map((fn) => {
            const taken = matchedFunctionIds.has(fn.id);
            const organForFn = Object.entries(matches).find(([, f]) => f === fn.id)?.[0];
            const wrong = checked && organForFn !== undefined && organForFn !== fn.id;
            const correct = checked && organForFn === fn.id;
            return (
              <li key={fn.id}>
                <div
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
                  className={[
                    "w-full cursor-pointer rounded-lg border px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                    "border-border bg-white",
                    taken ? "border-goal-16" : "",
                    wrong ? "border-rose-400 bg-rose-50" : "",
                    correct ? "border-emerald-400 bg-emerald-50" : "",
                  ].join(" ")}
                  aria-label={`Funzione: ${fn.text}${organForFn ? `. Già abbinata.` : ""}`}
                >
                  <span>{fn.text}</span>
                  {organForFn && (
                    <span className="mt-1 block text-xs text-goal-16">
                      Abbinato a: {abbinaItems.find((i) => i.id === organForFn)?.organ}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={verify}
          disabled={!allMatched}
          className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Verifica
        </button>
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
