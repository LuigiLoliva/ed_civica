"use client";

import { useActionState } from "react";
import Link from "next/link";

import { requestPasswordResetAction } from "@/app/auth/login/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ForgotState = { error?: string; success?: boolean };
const initial: ForgotState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    initial,
  );

  return (
    <form action={formAction} className="space-y-4">
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
      </div>

      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      {state.success ? (
        <Alert>
          <AlertDescription>
            Se l&apos;indirizzo è registrato, riceverai a breve le istruzioni per
            reimpostare la password.
          </AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Invio…" : "Invia link di reset"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/login" className="text-primary hover:underline">
          Torna al login
        </Link>
      </p>
    </form>
  );
}
