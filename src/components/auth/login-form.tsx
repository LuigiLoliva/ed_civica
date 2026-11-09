"use client";

import { useActionState } from "react";
import Link from "next/link";

import { loginAction, type LoginState } from "@/app/auth/login/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = {};

type LoginFormProps = {
  nextPath?: string;
  registrationEnabled?: boolean;
};

export function LoginForm({
  nextPath = "/admin",
  registrationEnabled = false,
}: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />

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
          autoComplete="current-password"
          required
          disabled={pending}
        />
        {state.fieldErrors?.password?.[0] ? (
          <p className="text-sm text-destructive">
            {state.fieldErrors.password[0]}
          </p>
        ) : null}
      </div>

      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Accesso in corso…" : "Accedi"}
      </Button>

      <div className="space-y-2 text-center text-sm text-muted-foreground">
        <p>
          <Link
            href="/auth/forgot-password"
            className="text-primary hover:underline"
          >
            Password dimenticata?
          </Link>
        </p>
        {registrationEnabled ? (
          <p>
            Non hai un account?{" "}
            <Link href="/registrati" className="text-primary hover:underline">
              Registrati
            </Link>
          </p>
        ) : null}
        <p>
          <Link href="/" className="text-primary hover:underline">
            Torna al sito
          </Link>
        </p>
      </div>
    </form>
  );
}
