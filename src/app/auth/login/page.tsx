import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Accedi",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const settings = await getSiteSettings();
  const nextPath =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/admin";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-partnership-pattern px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="font-heading text-2xl font-semibold leading-snug">
            Area riservata
          </h1>
          <CardDescription>
            Accesso per docenti (admin) e studenti editor di {settings.siteName}.
            Gli account si creano da Supabase; il primo admin si promuove con lo
            SQL indicato nel README.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {params.error === "auth" ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Autenticazione non riuscita. Riprova o contatta un docente.
            </p>
          ) : null}
          <LoginForm nextPath={nextPath} />
        </CardContent>
      </Card>
    </div>
  );
}
