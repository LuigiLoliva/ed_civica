"use client";

import { useState } from "react";

import type { PublicComment } from "@/lib/comments/types";

import { CommentForm } from "./comment-form";
import { ReportButton } from "./report-button";

type Props = {
  articleId: string;
  comments: PublicComment[];
  onChanged?: () => void;
};

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("it-IT", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function CommentNode({
  comment,
  articleId,
  onChanged,
}: {
  comment: PublicComment;
  articleId: string;
  onChanged?: () => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const isTopLevel = !comment.parentId;

  return (
    <li className="border-b border-border/60 py-4 last:border-b-0">
      <article>
        <header className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <strong className="text-foreground">{comment.authorName}</strong>
          <time
            dateTime={comment.createdAt}
            className="text-xs text-muted-foreground"
          >
            {formatDate(comment.createdAt)}
          </time>
        </header>
        <p className="whitespace-pre-wrap text-foreground">{comment.body}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {isTopLevel && (
            <button
              type="button"
              className="text-xs font-medium text-primary underline-offset-2 hover:underline"
              onClick={() => setReplyOpen((v) => !v)}
              aria-expanded={replyOpen}
            >
              {replyOpen ? "Chiudi" : "Rispondi"}
            </button>
          )}
          <ReportButton commentId={comment.id} />
        </div>
        {replyOpen && isTopLevel && (
          <div className="mt-3 rounded-md bg-muted/40 p-3">
            <CommentForm
              articleId={articleId}
              parentId={comment.id}
              compact
              onSuccess={() => {
                setReplyOpen(false);
                onChanged?.();
              }}
            />
          </div>
        )}
        {comment.replies.length > 0 && (
          <ul className="mt-3 space-y-3 border-l-2 border-primary/25 pl-4">
            {comment.replies.map((reply) => (
              <CommentNode
                key={reply.id}
                comment={reply}
                articleId={articleId}
                onChanged={onChanged}
              />
            ))}
          </ul>
        )}
      </article>
    </li>
  );
}

export function CommentList({ articleId, comments, onChanged }: Props) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nessun commento ancora. Sii il primo a intervenire.
      </p>
    );
  }

  return (
    <ul>
      {comments.map((c) => (
        <CommentNode
          key={c.id}
          comment={c}
          articleId={articleId}
          onChanged={onChanged}
        />
      ))}
    </ul>
  );
}
