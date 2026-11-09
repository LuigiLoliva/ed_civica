import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard admin",
};

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Dashboard
      </h1>
      <p className="mt-2 text-muted-foreground">
        Pannello docenti/studenti: gestione articoli, argomenti, commenti e
        quiz. Implementazione completa in Fase 3.
      </p>
    </div>
  );
}
