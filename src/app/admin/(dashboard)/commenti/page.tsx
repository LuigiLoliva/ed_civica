import type { Metadata } from "next";
import Link from "next/link";

import {
  adminReplyAction,
  moderateCommentAction,
} from "@/app/actions/comments";
import { requireAdminOrDemo } from "@/lib/auth/require-admin";
import {
  listAllCommentsForAdmin,
  listReports,
} from "@/lib/comments/store";
import type { CommentRecord, CommentReport } from "@/lib/comments/types";
import { siteConfig } from "@/lib/site-config";

import { ModerationClientLoader } from "./moderation-client-loader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Moderazione commenti | ${siteConfig.name}`,
};

export default async function AdminCommentiPage() {
  await requireAdminOrDemo();

  let comments: CommentRecord[] = [];
  let reports: CommentReport[] = [];
  let loadError: string | null = null;

  try {
    const [c, r] = await Promise.all([
      listAllCommentsForAdmin(),
      listReports(),
    ]);
    comments = c;
    reports = r;
  } catch (err) {
    console.error("[admin/commenti] fetch moderazione:", err);
    loadError =
      err instanceof Error
        ? err.message
        : "Impossibile caricare i commenti. Riprova tra poco.";
  }

  return (
    <div className="space-y-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/admin" className="hover:underline">
          Admin
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Commenti</span>
      </nav>
      <header>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Moderazione commenti
        </h1>
        <p className="mt-2 text-muted-foreground">
          Approva, rifiuta, elimina o rispondi. I commenti pubblici compaiono
          solo dopo l&apos;approvazione.
        </p>
      </header>
      {loadError ? (
        <div
          className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
          role="alert"
        >
          <p className="font-medium">Errore nel caricamento</p>
          <p className="mt-1 text-destructive/90">{loadError}</p>
          <p className="mt-2 text-muted-foreground">
            Se il problema continua, verifica su Supabase che la migrazione
            commenti (<code>public_slug</code>) sia applicata e che il ruolo
            admin sia attivo.
          </p>
        </div>
      ) : (
        <ModerationClientLoader
          comments={comments}
          reports={reports}
          moderateAction={moderateCommentAction}
          replyAction={adminReplyAction}
        />
      )}
    </div>
  );
}
