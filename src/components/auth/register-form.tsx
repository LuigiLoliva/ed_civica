"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";

import {
  registerStudentAction,
  type RegisterState,
} from "@/app/actions/registration";
import { TurnstileStub } from "@/components/comments/turnstile-stub";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwordStrength } from "@/lib/auth/registration-schema";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerStudentAction,
    initialState,
  );
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const strength = useMemo(() => passwordStrength(password), [password]);

  if (state.success) {
    return (
      <Alert>
        <AlertDescription>
          Registrazione ricevuta! Un docente deve approvare il tuo account.
          Riceverai una mail quando sarà attivo (se le email sono configurate).
          Puoi anche{" "}
          <Link href="/auth/login" className="underline">
            tornare al login
          </Link>
          .
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="turnstileToken" value={token ?? ""} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nome</Label>
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            required
            disabled={pending}
          />
          {state.fieldErrors?.firstName?.[0] ? (
            <p className="text-sm text-destructive">
              {state.fieldErrors.firstName[0]}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Cognome</Label>
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            required
            disabled={pending}
          />
          {state.fieldErrors?.lastName?.[0] ? (
            <p className="text-sm text-destructive">
              {state.fieldErrors.lastName[0]}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
        />
        {state.fieldErrors?.email?.[0] ? (
          <p className="text-sm text-destructive">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={pending}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {password ? (
          <p className="text-xs text-muted-foreground">
            Robustezza:{" "}
            <span className="font-medium text-foreground">{strength.label}</span>
            <span className="ml-2 inline-flex gap-0.5" aria-hidden>
              {Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  className={
                    i < strength.score
                      ? "inline-block h-1.5 w-4 rounded-sm bg-primary"
                      : "inline-block h-1.5 w-4 rounded-sm bg-muted"
                  }
                />
              ))}
            </span>
          </p>
        ) : null}
        {state.fieldErrors?.password?.[0] ? (
          <p className="text-sm text-destructive">
            {state.fieldErrors.password[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="className">Classe (opzionale)</Label>
        <Input
          id="className"
          name="className"
          placeholder="es. 3A"
          disabled={pending}
        />
      </div>

      <div className="flex items-start gap-2 rounded-md border border-border p-3">
        <input
          id="privacyAccepted"
          name="privacyAccepted"
          type="checkbox"
          value="true"
          required
          disabled={pending}
          className="mt-1 size-4"
        />
        <Label htmlFor="privacyAccepted" className="text-sm font-normal leading-snug">
          Confermo di aver letto l&apos;
          <Link href="/privacy" className="text-primary underline">
            informativa privacy
          </Link>
          . Per i minorenni può essere richiesto il consenso della scuola o di
          chi esercita la responsabilità genitoriale.
        </Label>
      </div>
      {state.fieldErrors?.privacyAccepted?.[0] ? (
        <p className="text-sm text-destructive">
          {state.fieldErrors.privacyAccepted[0]}
        </p>
      ) : null}

      <TurnstileStub onToken={setToken} />

      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Invio in corso…" : "Richiedi registrazione"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Hai già un account?{" "}
        <Link href="/auth/login" className="text-primary hover:underline">
          Accedi
        </Link>
      </p>
    </form>
  );
}
