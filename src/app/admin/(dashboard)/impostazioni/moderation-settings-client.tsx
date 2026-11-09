"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateCommentsModerationAction } from "@/app/actions/comments";

type Props = {
  initialEnabled: boolean;
};

export function ModerationSettingsClient({ initialEnabled }: Props) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(next: boolean) {
    setEnabled(next);
    setMessage(null);
    startTransition(async () => {
      const result = await updateCommentsModerationAction(next);
      setMessage(result.message);
      if (!result.ok) {
        setEnabled(!next);
      }
      router.refresh();
    });
  }

  return (
    <section
      aria-labelledby="moderazione-heading"
      className="max-w-xl space-y-4 rounded-lg border bg-card p-5 text-card-foreground"
    >
      <div>
        <h2
          id="moderazione-heading"
          className="font-heading text-xl font-semibold tracking-tight"
        >
          Moderazione commenti
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Se attivo, i commenti nascono in stato &quot;in attesa&quot; e
          compaiono sul sito solo dopo l&apos;approvazione. Se disattivo,
          vengono pubblicati subito.
        </p>
      </div>

      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-md border px-3 py-3">
        <span className="text-sm font-medium">
          Moderazione commenti {enabled ? "attiva" : "disattiva"}
        </span>
        <input
          type="checkbox"
          className="size-4 accent-primary"
          checked={enabled}
          disabled={pending}
          onChange={(e) => toggle(e.target.checked)}
        />
      </label>

      {message && (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
