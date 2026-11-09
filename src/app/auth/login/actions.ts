"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { loginBlockedMessage, normalizeProfileStatus } from "@/lib/auth/status";
import { normalizeProfileRow } from "@/lib/auth/session-user";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

const loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "Password troppo corta"),
  next: z.string().optional(),
});

export type LoginState = {
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};

function isSafeNextPath(next: string | undefined): next is string {
  return Boolean(next && next.startsWith("/") && !next.startsWith("//"));
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      error:
        "Supabase non è configurato. Compila `.env.local` come descritto nel README.",
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    return {
      error: "Controlla email e password.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return {
      error: "Accesso non riuscito. Verifica le credenziali con un docente.",
    };
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profileRow) {
    await supabase.auth.signOut();
    return {
      error:
        "Profilo non trovato. Contatta un docente o riprova dopo la migrazione SQL.",
    };
  }

  const profile = normalizeProfileRow(profileRow as Profile);
  const status = normalizeProfileStatus(profile.status);

  if (status !== "active") {
    await supabase.auth.signOut();
    if (status === "pending") {
      redirect("/auth/pending?status=pending");
    }
    return { error: loginBlockedMessage(status) };
  }

  const next = isSafeNextPath(parsed.data.next) ? parsed.data.next : "/admin";
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/auth/login");
}

export async function requestPasswordResetAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      error: "Reset password non disponibile: Supabase non configurato.",
    };
  }

  const email = String(formData.get("email") || "").trim();
  if (!email.includes("@")) {
    return { error: "Inserisci un'email valida." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: siteUrl
      ? `${siteUrl}/auth/callback?next=/auth/reset-password`
      : undefined,
  });

  if (error) {
    console.error("[auth] resetPasswordForEmail:", error.message);
  }

  // Messaggio generico per non rivelare se l'email esiste
  return {
    success: true,
  };
}
