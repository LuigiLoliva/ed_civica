import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gioca e impara",
  description: "Quiz e mini-giochi su ONU e Agenda 2030.",
};

export default function GiocaPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Gioca e impara
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Quiz e quattro mini-giochi arriveranno in Fase 5. Lo schema database per
        quiz e contenuti di gioco è già previsto nelle migrazioni.
      </p>
    </div>
  );
}
