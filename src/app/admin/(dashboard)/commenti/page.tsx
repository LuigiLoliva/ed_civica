import type { Metadata } from "next";
import Link from "next/link";

import { fetchAdminModerationData } from "@/app/actions/comments";
import { requireAdminOrDemo } from "@/lib/auth/require-admin";
import { siteConfig } from "@/lib/site-config";

import { ModerationClient } from "./moderation-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Moderazione commenti | ${siteConfig.name}`,
};

export default async function AdminCommentiPage() {
  await requireAdminOrDemo();

  const { comments, reports } = await fetchAdminModerationData();

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
      <ModerationClient comments={comments} reports={reports} />
    </div>
  );
}
