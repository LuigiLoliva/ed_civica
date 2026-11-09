import type { Metadata } from "next";
import Link from "next/link";

import { logoutAction } from "@/app/auth/login/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { loginBlockedMessage, normalizeProfileStatus } from "@/lib/auth/status";

export const metadata: Metadata = {
  title: "Account in attesa",
};

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function PendingPage({ searchParams }: Props) {
  const params = await searchParams;
  const status = normalizeProfileStatus(params.status) ?? "pending";

  const title =
    status === "pending"
      ? "Registrazione ricevuta!"
      : status === "rejected"
        ? "Registrazione non approvata"
        : status === "suspended"
          ? "Account sospeso"
          : "Accesso non disponibile";

  const description =
    status === "pending"
      ? "Un docente deve approvare il tuo account. Riceverai una mail quando sarà attivo (se le notifiche email sono configurate)."
      : loginBlockedMessage(status);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-partnership-pattern px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="font-heading text-2xl font-semibold">{title}</h1>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button render={<Link href="/" />} variant="outline">
            Torna al sito
          </Button>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost">
              Esci
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
