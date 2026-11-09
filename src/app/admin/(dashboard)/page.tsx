import type { Metadata } from "next";
import Link from "next/link";

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
    description: "Bozze, revisione e pubblicazione (Fase 3).",
    adminOnly: false,
  },
  {
    href: "/admin",
    title: "Argomenti",
    description: "Categorie del blog (Fase 3).",
    adminOnly: true,
  },
  {
    href: "/admin",
    title: "Commenti",
    description: "Moderazione e segnalazioni (Fase 4).",
    adminOnly: true,
  },
  {
    href: "/admin",
    title: "Quiz",
    description: "Editor quiz (Fase 5).",
    adminOnly: true,
  },
] as const;

export default async function AdminDashboardPage() {
  const profile = await getCurrentProfile();
  const admin = isAdmin(profile);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Area riservata per docenti e studenti. I moduli CRUD arriveranno in
          Fase 3; ruoli e gate di accesso sono già definiti nello schema e nelle
          policy RLS.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections
          .filter((section) => admin || !section.adminOnly)
          .map((section) => (
            <Card key={section.title} className="transition-colors hover:border-primary/40">
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
          Per attivare login e ruoli: crea un progetto Supabase, applica le
          migrazioni in <code>supabase/migrations</code>, compila{" "}
          <code>.env.local</code> e promuovi il primo admin come da README.
        </p>
      ) : null}
    </div>
  );
}
