import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articoli",
  description: "Elenco degli articoli su ONU e Agenda 2030.",
};

export default function ArticoliPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Articoli
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Qui compariranno gli articoli filtrabili per argomento. La lista sarà
        collegata a Supabase nella Fase 2.
      </p>
    </div>
  );
}
