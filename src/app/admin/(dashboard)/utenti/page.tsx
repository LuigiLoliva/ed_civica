"use client";

import { useMockAuth } from "@/lib/mock/auth-context";
import { getUsers } from "@/lib/mock/store";

/** Stub gestione utenti — solo admin. Account reali da Supabase Auth. */
export default function UtentiPage() {
  const { user, ready, usingDemo } = useMockAuth();
  const users = getUsers();

  if (!ready) {
    return <p className="text-muted-foreground">Caricamento…</p>;
  }

  if (user?.role !== "admin") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
        Solo gli admin possono gestire gli utenti.
        {usingDemo
          ? " Usa il selettore ruolo demo nella dashboard articoli."
          : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Utenti
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Stub: elenco ruoli mock. La creazione account studenti sarà via
          Supabase (email + password) con tabella{" "}
          <code className="rounded bg-muted px-1">profiles</code>.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Ruolo</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border/60 last:border-0">
                <td className="px-3 py-3">
                  {u.nome} {u.cognome}
                </td>
                <td className="px-3 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-3 py-3">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Prossimi passi (post-Supabase)</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Form creazione studente con invito email</li>
          <li>Assegnazione / cambio ruolo admin ↔ studente</li>
          <li>Disattivazione account</li>
        </ul>
      </div>
    </div>
  );
}
