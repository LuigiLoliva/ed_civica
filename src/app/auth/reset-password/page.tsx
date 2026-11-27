import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthStage } from "@/components/immersive/auth-stage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Nuova password",
};

export default function ResetPasswordPage() {
  return (
    <AuthStage>
      <Card className="w-full max-w-md bg-card/95 shadow-depth backdrop-blur-sm">
        <CardHeader>
          <h1 className="font-heading text-2xl font-semibold">
            Imposta nuova password
          </h1>
          <CardDescription>
            Scegli una password di almeno 8 caratteri. Devi aver aperto il link
            ricevuto via email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm />
        </CardContent>
      </Card>
    </AuthStage>
  );
}