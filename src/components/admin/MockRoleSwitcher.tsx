"use client";

import { useMockAuth } from "@/lib/mock/auth-context";
import { resetMockData } from "@/lib/mock/store";
import { Button } from "@/components/ui/button";

/** Selettore ruolo mock (finché Supabase Auth non è attivo in locale). */
export function MockRoleSwitcher() {
  const { user, users, ready, login } = useMockAuth();

  if (!ready) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border bg-card px-3 py-2 text-sm">
      <span className="text-muted-foreground">Demo ruolo:</span>
      {users.map((u) => (
        <Button
          key={u.id}
          type="button"
          size="sm"
          variant={user?.id === u.id ? "default" : "outline"}
          onClick={() => login(u.id)}
        >
          {u.nome} ({u.role})
        </Button>
      ))}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => {
          resetMockData();
          window.location.reload();
        }}
      >
        Reset dati
      </Button>
    </div>
  );
}
