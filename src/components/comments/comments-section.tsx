"use client";

import { useRouter } from "next/navigation";

import type { PublicComment } from "@/lib/comments/types";

import { CommentForm } from "./comment-form";
import { CommentList } from "./comment-list";

type Props = {
  articleId: string;
  comments: PublicComment[];
};

export function CommentsSection({ articleId, comments }: Props) {
  const router = useRouter();

  return (
    <section
      id="commenti"
      aria-labelledby="commenti-heading"
      className="mt-12 border-t pt-8"
    >
      <h2
        id="commenti-heading"
        className="mb-6 font-heading text-2xl font-semibold tracking-tight"
      >
        Commenti
      </h2>
      <div className="mb-8 rounded-lg bg-muted/30 p-4 sm:p-6">
        <CommentForm
          articleId={articleId}
          onSuccess={() => router.refresh()}
        />
      </div>
      <CommentList
        articleId={articleId}
        comments={comments}
        onChanged={() => router.refresh()}
      />
    </section>
  );
}
