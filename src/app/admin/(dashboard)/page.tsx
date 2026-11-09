import type { Metadata } from "next";
import Link from "next/link";

import { ArticleDashboard } from "@/components/admin/ArticleDashboard";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentProfile, isAdmin } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Dashboard admin",
};

const sections = [
  {
    href: "/admin",
    title: "Articoli",
    description: "Bozze, revisione e pubblicazione (sotto).",
    adminOnly: false,
  },
  {
    href: "/admin/argomenti",
    title: "Argomenti",
    description: "Categorie del blog.",
    adminOnly: true,
  },
  {
    href: "/admin/utenti",
    title: "Utenti",
    description: "Ruoli docenti e studenti (stub).",
    adminOnly: true,
  },
  {
    href: "/admin/commenti",
    title: "Commenti",
    description: "Moderazione e segnalazioni (Fase 4).",
    adminOnly: true,
  },
  {
    href: "/admin/quiz",
    title: "Quiz",
    description: "Editor quiz e seed da revisionare (Fase 5).",
    adminOnly: true,
  },
] as const;

export default async function AdminDashboardPage() {
  const profile = await getCurrentProfile();
  const admin = isAdmin(profile);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {sections
          .filter((section) => admin || !section.adminOnly || !profile)
          .map((section) => (
            <Card
              key={section.title}
              className="transition-colors hover:border-primary/40"
            >
              <CardHeader>
                <CardTitle className="font-heading text-lg">
                  <Link href={section.href} className="hover:text-primary">
                    {section.title}
                  </Link>
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
      </div>

      {!profile ? (
        <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          Supabase non configurato: usa il selettore ruolo demo sotto per
          provare il flusso articoli. Per login reale: migrazioni in{" "}
          <code>supabase/migrations</code> e <code>.env.local</code>.
        </p>
      ) : null}

      <ArticleDashboard />
    </div>
  );
}
