"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  adminReplyAction,
  moderateCommentAction,
} from "@/app/actions/comments";
import type { CommentRecord, CommentReport } from "@/lib/comments/types";

type Props = {
  comments: CommentRecord[];
  reports: CommentReport[];
};

const STATUS_LABEL: Record<CommentRecord["status"], string> = {
  in_attesa: "In attesa",
  approvato: "Approvato",
  rifiutato: "Rifiutato",
};

function articleLabel(comment: CommentRecord): {
  href: string | null;
  text: string;
} {
  if (comment.articleSlug) {
    return {
      href: `/articoli/${comment.articleSlug}`,
      text: comment.articleTitle?.trim() || comment.articleSlug,
    };
  }
  const looksUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      comment.articleId,
    );
  if (looksUuid) {
    return { href: null, text: `Articolo ${comment.articleId.slice(0, 8)}…` };
  }
  // File store / mock: articleId è spesso già lo slug.
  return {
    href: `/articoli/${comment.articleId}`,
    text: comment.articleTitle?.trim() || comment.articleId,
  };
}

export function ModerationClient({ comments, reports }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<
    "all" | "in_attesa" | "approvato" | "rifiutato"
  >("in_attesa");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered =
    filter === "all" ? comments : comments.filter((c) => c.status === filter);

  function runModerate(
    commentId: string,
    action: "approve" | "reject" | "delete",
  ) {
    startTransition(async () => {
      const result = await moderateCommentAction({ commentId, action });
      setMessage(result.message);
      router.refresh();
    });
  }

  function runReply(comment: CommentRecord) {
    const body = replyDrafts[comment.id]?.trim() ?? "";
    if (!body) return;
    startTransition(async () => {
      const result = await adminReplyAction({
        articleId: comment.articleSlug ?? comment.articleId,
        parentId: comment.parentId ?? comment.id,
        body,
      });
      setMessage(result.message);
      if (result.ok) {
        setReplyDrafts((d) => ({ ...d, [comment.id]: "" }));
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtro stato">
        {(["in_attesa", "approvato", "rifiutato", "all"] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            onClick={() => setFilter(key)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              filter === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            {key === "all"
              ? `Tutti (${comments.length})`
              : `${STATUS_LABEL[key]} (${comments.filter((c) => c.status === key).length})`}
          </button>
        ))}
      </div>

      {message && (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      )}

      <ul className="space-y-4">
        {filtered.length === 0 && (
          <li className="text-sm text-muted-foreground">
            Nessun commento in questo filtro.
          </li>
        )}
        {filtered.map((comment) => {
          const article = articleLabel(comment);
          return (
            <li
              key={comment.id}
              className="rounded-lg border bg-card p-4 text-card-foreground"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded bg-muted px-2 py-0.5 font-medium text-foreground">
                  {STATUS_LABEL[comment.status]}
                </span>
                {comment.reported && (
                  <span className="rounded bg-amber-100 px-2 py-0.5 font-medium text-amber-900">
                    Segnalato
                  </span>
                )}
                {article.href ? (
                  <Link
                    href={article.href}
                    className="underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {article.text}
                  </Link>
                ) : (
                  <span>{article.text}</span>
                )}
                {comment.parentId && <span>Risposta</span>}
                <time dateTime={comment.createdAt}>
                  {new Date(comment.createdAt).toLocaleString("it-IT")}
                </time>
              </div>
              <p className="font-medium">
                {comment.authorName}
                {comment.authorEmail && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({comment.authorEmail})
                  </span>
                )}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{comment.body}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {comment.status !== "approvato" && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => runModerate(comment.id, "approve")}
                    className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-50"
                  >
                    Approva
                  </button>
                )}
                {comment.status !== "rifiutato" && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => runModerate(comment.id, "reject")}
                    className="rounded-md border px-3 py-1.5 text-xs disabled:opacity-50"
                  >
                    Rifiuta
                  </button>
                )}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => runModerate(comment.id, "delete")}
                  className="rounded-md border border-destructive/40 px-3 py-1.5 text-xs text-destructive disabled:opacity-50"
                >
                  Elimina
                </button>
              </div>

              {!comment.parentId && (
                <div className="mt-3 border-t pt-3">
                  <label className="block text-xs font-medium">
                    Rispondi come redazione
                    <textarea
                      className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm"
                      rows={2}
                      value={replyDrafts[comment.id] ?? ""}
                      onChange={(e) =>
                        setReplyDrafts((d) => ({
                          ...d,
                          [comment.id]: e.target.value,
                        }))
                      }
                    />
                  </label>
                  <button
                    type="button"
                    disabled={pending || !(replyDrafts[comment.id] ?? "").trim()}
                    onClick={() => runReply(comment)}
                    className="mt-2 rounded-md bg-secondary px-3 py-1.5 text-xs text-secondary-foreground disabled:opacity-50"
                  >
                    Pubblica risposta
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <section aria-labelledby="segnalazioni-heading" className="space-y-3">
        <h2
          id="segnalazioni-heading"
          className="font-heading text-xl font-semibold"
        >
          Segnalazioni ({reports.length})
        </h2>
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nessuna segnalazione.</p>
        ) : (
          <ul className="space-y-2">
            {reports.map((r) => (
              <li
                key={r.id}
                className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/40"
              >
                <p>
                  Commento <code>{r.commentId.slice(0, 8)}…</code> —{" "}
                  {new Date(r.createdAt).toLocaleString("it-IT")}
                </p>
                <p className="mt-1">{r.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
