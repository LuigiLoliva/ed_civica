"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");

    if (password.length < 8) {
      setError("La password deve avere almeno 8 caratteri.");
      setPending(false);
      return;
    }
    if (password !== confirm) {
      setError("Le password non coincidono.");
      setPending(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        setError(
          "Impossibile aggiornare la password. Apri di nuovo il link dall'email.",
        );
        setPending(false);
        return;
      }
      router.push("/auth/login");
      router.refresh();
    } catch {
      setError("Operazione non riuscita. Riprova.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Nuova password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={pending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Conferma password</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={pending}
        />
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Salvataggio…" : "Salva password"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/login" className="text-primary hover:underline">
          Torna al login
        </Link>
      </p>
    </form>
  );
}
