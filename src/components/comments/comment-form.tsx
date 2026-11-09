"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { submitCommentAction } from "@/app/actions/comments";
import {
  createCommentSchema,
  type CreateCommentValues,
} from "@/lib/comments/schema";

import { TurnstileStub } from "./turnstile-stub";

type Props = {
  articleId: string;
  parentId?: string | null;
  onSuccess?: () => void;
  compact?: boolean;
};

export function CommentForm({
  articleId,
  parentId = null,
  onSuccess,
  compact = false,
}: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<CreateCommentValues>({
    resolver: zodResolver(createCommentSchema) as never,
    defaultValues: {
      articleId,
      parentId,
      authorName: "",
      authorEmail: "",
      body: "",
      turnstileToken: null,
    },
  });

  function onSubmit(values: CreateCommentValues) {
    setStatus(null);
    startTransition(async () => {
      const result = await submitCommentAction({
        ...values,
        parentId,
        turnstileToken: token,
      });
      setStatus(result.message);
      if (result.ok) {
        form.reset({
          articleId,
          parentId,
          authorName: "",
          authorEmail: "",
          body: "",
          turnstileToken: null,
        });
        setToken(null);
        onSuccess?.();
      }
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-3"
      noValidate
    >
      {!compact && (
        <h3 className="font-heading text-lg font-semibold tracking-tight">
          Lascia un commento
        </h3>
      )}
      {compact && <p className="text-sm text-muted-foreground">Rispondi</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Nome o nickname *</span>
          <input
            type="text"
            autoComplete="nickname"
            maxLength={80}
            className="w-full rounded-md border bg-background px-3 py-2"
            {...form.register("authorName")}
          />
          {form.formState.errors.authorName && (
            <span className="mt-1 block text-xs text-destructive">
              {form.formState.errors.authorName.message}
            </span>
          )}
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">
            Email{" "}
            <span className="font-normal text-muted-foreground">
              (opzionale, non pubblica)
            </span>
          </span>
          <input
            type="email"
            autoComplete="email"
            className="w-full rounded-md border bg-background px-3 py-2"
            {...form.register("authorEmail")}
          />
          {form.formState.errors.authorEmail && (
            <span className="mt-1 block text-xs text-destructive">
              {form.formState.errors.authorEmail.message}
            </span>
          )}
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Commento *</span>
        <textarea
          rows={compact ? 3 : 5}
          maxLength={2000}
          className="w-full rounded-md border bg-background px-3 py-2"
          {...form.register("body")}
        />
        {form.formState.errors.body && (
          <span className="mt-1 block text-xs text-destructive">
            {form.formState.errors.body.message}
          </span>
        )}
      </label>

      {!parentId && <TurnstileStub onToken={setToken} />}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Invio…" : parentId ? "Invia risposta" : "Invia commento"}
        </button>
        {status && (
          <p className="text-sm text-muted-foreground" role="status">
            {status}
          </p>
        )}
      </div>
    </form>
  );
}
