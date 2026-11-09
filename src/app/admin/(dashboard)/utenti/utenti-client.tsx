"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  approveRegistrationAction,
  bulkApproveRegistrationsAction,
  createStudentManuallyAction,
  deleteUserAction,
  rejectRegistrationAction,
  setUserStatusAction,
} from "@/app/actions/registration";
import { AdminOnlyNotice } from "@/components/admin/AdminOnlyNotice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileStatusLabel } from "@/lib/auth/status";
import { useMockAuth } from "@/lib/mock/auth-context";
import type { Profile } from "@/types/database";

export function UtentiClient({
  serverCanManage,
  profiles,
  usingLiveData,
}: {
  serverCanManage: boolean | null;
  profiles: Profile[];
  usingLiveData: boolean;
}) {
  const { isAdmin, ready, usingDemo } = useMockAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  const canManage =
    serverCanManage !== null ? serverCanManage : ready && isAdmin;

  const pendingRequests = useMemo(
    () =>
      profiles.filter((p) => p.status === "pending" && p.role === "studente"),
    [profiles],
  );

  const others = useMemo(
    () => profiles.filter((p) => !(p.status === "pending" && p.role === "studente")),
    [profiles],
  );

  if (serverCanManage === null && !ready) {
    return <p className="text-muted-foreground">Caricamento…</p>;
  }

  if (!canManage) {
    return (
      <AdminOnlyNotice
        resource="gli utenti"
        showDemoHint={serverCanManage === null && usingDemo}
      />
    );
  }

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function run(
    promise: Promise<{ ok: boolean; message?: string; error?: string }>,
  ) {
    startTransition(async () => {
      const result = await promise;
      if (result.ok) {
        toast.success(result.message ?? "Operazione completata");
        setSelected([]);
      } else {
        toast.error(result.error ?? "Operazione non riuscita");
      }
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Utenti
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approva le richieste di registrazione, sospendi o elimina account.
          {!usingLiveData
            ? " Dati demo locali (collega Supabase + service role per l'elenco reale)."
            : null}
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-semibold">
            Richieste di registrazione
            {pendingRequests.length > 0 ? (
              <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-md bg-amber-100 px-1.5 text-xs font-semibold text-amber-950">
                {pendingRequests.length}
              </span>
            ) : null}
          </h2>
          {pendingRequests.length > 0 ? (
            <Button
              type="button"
              size="sm"
              disabled={pending || selected.length === 0}
              onClick={() =>
                run(bulkApproveRegistrationsAction(selected))
              }
            >
              Approva selezionati ({selected.length})
            </Button>
          ) : null}
        </div>

        {pendingRequests.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            Nessuna richiesta in attesa.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Sel.</th>
                  <th className="px-3 py-2">Nome</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Classe</th>
                  <th className="px-3 py-2">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(u.id)}
                        onChange={() => toggleSelect(u.id)}
                        aria-label={`Seleziona ${u.email}`}
                      />
                    </td>
                    <td className="px-3 py-3">
                      {u.first_name || u.full_name || "—"} {u.last_name || ""}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {u.email}
                    </td>
                    <td className="px-3 py-3">{u.class_name || "—"}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={pending}
                          onClick={() => run(approveRegistrationAction(u.id))}
                        >
                          Approva
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={pending}
                          onClick={() => {
                            const reason = window.prompt(
                              "Motivo del rifiuto (opzionale):",
                            );
                            if (reason === null) return;
                            run(rejectRegistrationAction(u.id, reason));
                          }}
                        >
                          Rifiuta
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={pending}
                          onClick={() => {
                            if (
                              !window.confirm(
                                `Eliminare definitivamente ${u.email}?`,
                              )
                            ) {
                              return;
                            }
                            run(deleteUserAction(u.id));
                          }}
                        >
                          Elimina
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold">Tutti gli utenti</h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Ruolo</th>
                <th className="px-3 py-2">Stato</th>
                <th className="px-3 py-2">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {others.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="px-3 py-3">
                    {u.first_name || u.full_name || "—"} {u.last_name || ""}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {profileStatusLabel(u.status)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      {u.role === "studente" && u.status === "active" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={pending}
                          onClick={() =>
                            run(setUserStatusAction(u.id, "suspended"))
                          }
                        >
                          Sospendi
                        </Button>
                      ) : null}
                      {u.role === "studente" &&
                      (u.status === "suspended" || u.status === "rejected") ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={pending}
                          onClick={() =>
                            run(setUserStatusAction(u.id, "active"))
                          }
                        >
                          Riattiva
                        </Button>
                      ) : null}
                      {u.role === "studente" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={pending}
                          onClick={() => {
                            if (
                              !window.confirm(
                                `Eliminare definitivamente ${u.email} e i relativi dati Auth?`,
                              )
                            ) {
                              return;
                            }
                            run(deleteUserAction(u.id));
                          }}
                        >
                          Elimina
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border bg-card p-4">
        <h2 className="font-heading text-xl font-semibold">
          Crea studente manualmente
        </h2>
        <p className="text-sm text-muted-foreground">
          L&apos;account nasce già attivo (senza passare dalla coda di
          approvazione). Richiede service role sul server.
        </p>
        <form
          className="grid gap-3 sm:grid-cols-2"
          action={(fd) => run(createStudentManuallyAction(fd))}
        >
          <div className="space-y-1">
            <Label htmlFor="manual-first">Nome</Label>
            <Input id="manual-first" name="firstName" required disabled={pending} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="manual-last">Cognome</Label>
            <Input id="manual-last" name="lastName" required disabled={pending} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="manual-email">Email</Label>
            <Input
              id="manual-email"
              name="email"
              type="email"
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="manual-pass">Password temporanea</Label>
            <Input
              id="manual-pass"
              name="password"
              type="password"
              minLength={8}
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="manual-class">Classe (opzionale)</Label>
            <Input id="manual-class" name="className" disabled={pending} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>
              Crea account attivo
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
