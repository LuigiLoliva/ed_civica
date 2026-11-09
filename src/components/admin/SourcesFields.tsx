"use client";

import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MockSource } from "@/lib/mock/article-types";

interface SourcesFieldsProps {
  sources: MockSource[];
  onChange: (sources: MockSource[]) => void;
  error?: string;
  disabled?: boolean;
}

export function SourcesFields({
  sources,
  onChange,
  error,
  disabled,
}: SourcesFieldsProps) {
  const update = (index: number, patch: Partial<MockSource>) => {
    onChange(sources.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...sources];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Almeno una fonte obbligatoria. Preferisci documenti ufficiali ONU /
        Agenda 2030 / ASviS.
      </p>
      {sources.map((source, index) => (
        <div
          key={source.id}
          className="space-y-2 rounded-lg border border-border bg-card p-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Fonte {index + 1}
            </span>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              disabled={disabled || index === 0}
              onClick={() => move(index, -1)}
              aria-label="Sposta su"
            >
              <ArrowUp className="size-3.5" />
            </Button>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              disabled={disabled || index === sources.length - 1}
              onClick={() => move(index, 1)}
              aria-label="Sposta giù"
            >
              <ArrowDown className="size-3.5" />
            </Button>
            <Button
              type="button"
              size="icon-xs"
              variant="destructive"
              className="ml-auto"
              disabled={disabled || sources.length <= 1}
              onClick={() => onChange(sources.filter((_, i) => i !== index))}
              aria-label="Rimuovi fonte"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
          <div className="space-y-1">
            <Label>Titolo / descrizione *</Label>
            <Input
              value={source.title}
              disabled={disabled}
              onChange={(e) => update(index, { title: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>URL *</Label>
            <Input
              type="url"
              value={source.url}
              disabled={disabled}
              placeholder="https://"
              onChange={(e) => update(index, { url: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Data di consultazione *</Label>
            <Input
              type="date"
              value={source.consultedAt}
              disabled={disabled}
              className="max-w-xs"
              onChange={(e) => update(index, { consultedAt: e.target.value })}
            />
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() =>
          onChange([
            ...sources,
            {
              id: `src-${crypto.randomUUID()}`,
              title: "",
              url: "",
              consultedAt: new Date().toISOString().slice(0, 10),
            },
          ])
        }
      >
        <Plus className="size-4" />
        Aggiungi fonte
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
