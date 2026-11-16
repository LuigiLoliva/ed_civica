"use client";

import dynamic from "next/dynamic";

import type {
  adminReplyAction,
  moderateCommentAction,
} from "@/app/actions/comments";
import type { CommentRecord, CommentReport } from "@/lib/comments/types";

/**
 * UI moderazione solo client (`ssr: false`) per non tirare il grafo delle
 * Server Action (ex isomorphic-dompurify) nello SSR Vercel della pagina.
 * Le action arrivano come props dal Server Component (manifest ok).
 */
const ModerationClient = dynamic(
  () => import("./moderation-client").then((m) => m.ModerationClient),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded-lg border border-border bg-card/50 p-8 text-sm text-muted-foreground"
        role="status"
      >
        Caricamento moderazione…
      </div>
    ),
  },
);

type ModerateAction = typeof moderateCommentAction;
type ReplyAction = typeof adminReplyAction;

export function ModerationClientLoader({
  comments,
  reports,
  moderateAction,
  replyAction,
}: {
  comments: CommentRecord[];
  reports: CommentReport[];
  moderateAction: ModerateAction;
  replyAction: ReplyAction;
}) {
  return (
    <ModerationClient
      comments={comments}
      reports={reports}
      moderateAction={moderateAction}
      replyAction={replyAction}
    />
  );
}
