"use client";

import { useRef } from "react";
import { ImagePlus, Star, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MockImage } from "@/lib/mock/article-types";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGES,
} from "@/lib/validations/article";

interface ImageFieldsProps {
  images: MockImage[];
  onChange: (images: MockImage[]) => void;
  error?: string;
  disabled?: boolean;
}

async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non disponibile");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
  return canvas.toDataURL(mime, 0.82);
}

export function ImageFields({
  images,
  onChange,
  error,
  disabled,
}: ImageFieldsProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const updateAt = (index: number, patch: Partial<MockImage>) => {
    onChange(images.map((img, i) => (i === index ? { ...img, ...patch } : img)));
  };

  const setCover = (index: number) => {
    onChange(images.map((img, i) => ({ ...img, isCover: i === index })));
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const remove = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    if (next.length && !next.some((i) => i.isCover)) {
      next[0] = { ...next[0], isCover: true };
    }
    onChange(next);
  };

  const onPick = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      alert(`Massimo ${MAX_IMAGES} immagini per articolo.`);
      return;
    }
    const selected = Array.from(files).slice(0, remaining);
    const added: MockImage[] = [];
    for (const file of selected) {
      if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
        alert(`${file.name}: solo JPG, PNG o WebP.`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        alert(`${file.name}: massimo 3 MB per file.`);
        continue;
      }
      try {
        const url = await compressImage(file);
        added.push({
          id: `img-${crypto.randomUUID()}`,
          url,
          altText: "",
          caption: "",
          credit: "",
          isCover: images.length === 0 && added.length === 0,
        });
      } catch {
        alert(`Impossibile elaborare ${file.name}`);
      }
    }
    if (added.length) onChange([...images, ...added]);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
        <strong>Copyright:</strong> usa solo immagini proprie, libere da diritti
        o con licenza (Wikimedia, Unsplash, materiale ONU con attribuzione).
        Compila i crediti per ogni foto.
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          disabled={disabled || images.length >= MAX_IMAGES}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="size-4" />
          Aggiungi immagini ({images.length}/{MAX_IMAGES})
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => void onPick(e.target.files)}
        />
        <span className="text-xs text-muted-foreground">
          JPG/PNG/WebP, max 3 MB. Compressione automatica.
        </span>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <ul className="space-y-4">
        {images.map((img, index) => (
          <li
            key={img.id}
            className="grid gap-3 rounded-lg border border-border bg-card p-3 sm:grid-cols-[140px_1fr]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.altText || "Anteprima"}
              className="h-28 w-full rounded-md object-cover sm:h-full"
            />
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={img.isCover ? "default" : "outline"}
                  disabled={disabled}
                  onClick={() => setCover(index)}
                >
                  <Star className="size-3.5" />
                  {img.isCover ? "Copertina" : "Imposta copertina"}
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  disabled={disabled || index === 0}
                  onClick={() => move(index, -1)}
                  aria-label="Sposta su"
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  disabled={disabled || index === images.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label="Sposta giù"
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="destructive"
                  className="ml-auto"
                  disabled={disabled}
                  onClick={() => remove(index)}
                  aria-label="Elimina immagine"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <Label>Testo alternativo *</Label>
                <Input
                  value={img.altText}
                  disabled={disabled}
                  placeholder="Descrivi l'immagine per l'accessibilità"
                  onChange={(e) => updateAt(index, { altText: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Didascalia</Label>
                <Input
                  value={img.caption}
                  disabled={disabled}
                  onChange={(e) => updateAt(index, { caption: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Crediti (autore / licenza)</Label>
                <Input
                  value={img.credit}
                  disabled={disabled}
                  placeholder="es. Wikimedia Commons — CC BY-SA 4.0"
                  onChange={(e) => updateAt(index, { credit: e.target.value })}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
