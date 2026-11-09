import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Accedi",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-partnership-pattern px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            Area riservata
          </CardTitle>
          <CardDescription>
            Accesso per docenti e studenti di {siteConfig.name}. Il form di
            login sarà collegato a Supabase Auth nella prossima fase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled
            />
          </div>
          <Button className="w-full" disabled>
            Accedi (in arrivo)
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/" className="text-primary hover:underline">
              Torna al sito
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
