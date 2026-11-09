"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MockAuthor } from "@/lib/mock/article-types";

interface AuthorsFieldsProps {
  authors: MockAuthor[];
  onChange: (authors: MockAuthor[]) => void;
  error?: string;
  disabled?: boolean;
}

export function AuthorsFields({
  authors,
  onChange,
  error,
  disabled,
}: AuthorsFieldsProps) {
  const update = (index: number, patch: Partial<MockAuthor>) => {
    onChange(authors.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  };

  return (
    <div className="space-y-3">
      {authors.map((author, index) => (
        <div key={index} className="flex flex-wrap items-end gap-2">
          <div className="min-w-[140px] flex-1 space-y-1">
            <Label htmlFor={`author-first-${index}`}>Nome *</Label>
            <Input
              id={`author-first-${index}`}
              value={author.firstName}
              disabled={disabled}
              onChange={(e) => update(index, { firstName: e.target.value })}
            />
          </div>
          <div className="min-w-[140px] flex-1 space-y-1">
            <Label htmlFor={`author-last-${index}`}>Cognome *</Label>
            <Input
              id={`author-last-${index}`}
              value={author.lastName}
              disabled={disabled}
              onChange={(e) => update(index, { lastName: e.target.value })}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            disabled={disabled || authors.length <= 1}
            onClick={() => onChange(authors.filter((_, i) => i !== index))}
            aria-label="Rimuovi autore"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() =>
          onChange([...authors, { firstName: "", lastName: "" }])
        }
      >
        <Plus className="size-4" />
        Aggiungi autore
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
