import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-6xl flex-col items-start justify-center px-4 py-20 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
        404
      </p>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
        Pagina non trovata
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Il contenuto che cerchi non esiste o è stato spostato.
      </p>
      <Button render={<Link href="/" />} className="mt-8">
        Torna alla home
      </Button>
    </div>
  );
}
