import Link from "next/link";
import type { ReactNode } from "react";

export function GameShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6">
      <p>
        <Link
          href="/gioca"
          className="text-sm text-primary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          ← Torna a Gioca e impara
        </Link>
      </p>
      <header className="space-y-2">
        <h1 className="font-heading text-3xl text-foreground">
          {title}
        </h1>
        <p className="text-muted-foreground">{description}</p>
      </header>
      {children}
    </div>
  );
}
