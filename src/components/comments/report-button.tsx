"use client";

import { useState, useTransition } from "react";

import { reportCommentAction } from "@/app/actions/comments";

type Props = {
  commentId: string;
};

export function ReportButton({ commentId }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await reportCommentAction({ commentId, reason });
      setMessage(result.message);
      if (result.ok) {
        setReason("");
        setOpen(false);
      }
    });
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        className="text-xs text-muted-foreground underline-offset-2 hover:underline"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Segnala
      </button>
      {open && (
        <div className="mt-1 w-full min-w-[16rem] rounded-md border bg-background p-2 shadow-sm">
          <label className="block text-xs text-foreground">
            Motivo della segnalazione
            <textarea
              className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
            />
          </label>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={pending || reason.trim().length < 3}
              onClick={submit}
              className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground disabled:opacity-50"
            >
              Invia
            </button>
            <button
              type="button"
              className="text-xs text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              Annulla
            </button>
          </div>
        </div>
      )}
      {message && (
        <p className="text-xs text-muted-foreground" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
