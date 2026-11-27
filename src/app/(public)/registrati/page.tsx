import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";
import { RegistratiShell } from "@/components/immersive/registrati-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { getSiteSettings } from "@/lib/site-settings/get-site-settings";

export const metadata: Metadata = {
  title: "Registrati",
};

export default async function RegistratiPage() {
  const settings = await getSiteSettings();

  if (!settings.studentRegistrationEnabled) {
    return (
      <RegistratiShell>
        <Card>
          <CardHeader>
            <h1 className="font-heading text-2xl font-semibold">
              Registrazione non attiva
            </h1>
            <CardDescription>
              Al momento gli studenti non possono creare da soli un account su{" "}
              {settings.siteName}. Chiedi a un docente di attivare la
              registrazione oppure di creare il tuo profilo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/auth/login"
              className="text-sm text-primary hover:underline"
            >
              Vai al login
            </Link>
          </CardContent>
        </Card>
      </RegistratiShell>
    );
  }

  return (
    <RegistratiShell>
      <Card>
        <CardHeader>
          <h1 className="font-heading text-2xl font-semibold">
            Registrati come studente
          </h1>
          <CardDescription>
            Compila i dati per richiedere un account su {settings.siteName}. Un
            docente dovrà approvare la richiesta prima che tu possa accedere.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </RegistratiShell>
  );
}