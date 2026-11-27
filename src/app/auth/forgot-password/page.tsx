import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthStage } from "@/components/immersive/auth-stage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Password dimenticata",
};

export default function ForgotPasswordPage() {
  return (
    <AuthStage>
      <Card className="w-full max-w-md bg-card/95 shadow-depth backdrop-blur-sm">
        <CardHeader>
          <h1 className="font-heading text-2xl font-semibold">
            Password dimenticata
          </h1>
          <CardDescription>
            Inserisci l&apos;email del tuo account: se è registrata, riceverai un
            link per scegliere una nuova password (via email Supabase).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </AuthStage>
  );
}