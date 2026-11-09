"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  forcedStudentRole,
  registrationSchema,
} from "@/lib/auth/registration-schema";
import {
  notifyAdminsNewRegistration,
  notifyStudentStatusChange,
} from "@/lib/auth/registration-email";
import {
  deleteUserCompletely,
  getProfileById,
  listAdminEmails,
  updateProfileStatus,
} from "@/lib/auth/profiles-store";
import { getCurrentProfile, isAdmin } from "@/lib/auth/roles";
import { getClientIp, hashIp } from "@/lib/comments/ip";
import { checkRateLimit } from "@/lib/comments/rate-limit";
import { verifyTurnstileToken } from "@/lib/comments/turnstile";
import { getSiteSettings } from "@/lib/site-settings";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { ProfileStatus } from "@/types/database";

export type RegisterState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  success?: boolean;
};

function sanitizeName(value: string): string {
  return value.replace(/[<>]/g, "").trim();
}

export async function registerStudentAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const settings = await getSiteSettings();
  if (!settings.studentRegistrationEnabled) {
    return {
      error:
        "La registrazione autonoma non è attiva. Chiedi a un docente di creare il tuo account.",
    };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      error:
        "Registrazione non disponibile: Supabase non è configurato. Contatta un docente.",
    };
  }

  const privacyRaw = formData.get("privacyAccepted");
  const privacyAccepted =
    privacyRaw === "on" || privacyRaw === "true" || privacyRaw === "1";
  const parsed = registrationSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    className: formData.get("className") || "",
    privacyAccepted,
    turnstileToken: formData.get("turnstileToken") || null,
  });

  if (!parsed.success) {
    return {
      error: "Controlla i campi evidenziati.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[] | undefined
      >,
    };
  }

  const ip = await getClientIp();
  const rate = checkRateLimit(`register:${hashIp(ip)}`);
  if (!rate.allowed) {
    return {
      error: `Troppe registrazioni da questo dispositivo. Riprova tra ${rate.retryAfterSeconds} secondi.`,
    };
  }

  const turnstile = await verifyTurnstileToken(
    parsed.data.turnstileToken,
    ip === "unknown" ? null : ip,
  );
  if (!turnstile.ok) {
    return { error: turnstile.error };
  }

  // Ignora qualsiasi role inviato dal client
  const role = forcedStudentRole(formData.get("role"));
  const firstName = sanitizeName(parsed.data.firstName);
  const lastName = sanitizeName(parsed.data.lastName);
  const className = sanitizeName(parsed.data.className || "") || null;
  const fullName = `${firstName} ${lastName}`.trim();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        class_name: className,
        role, // trigger ignora comunque: resta studente
        status: "pending",
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback`,
    },
  });

  if (error) {
    console.error("[registration] signUp:", error.message);
    const msg = error.message.toLowerCase();
    if (msg.includes("already") || msg.includes("registered")) {
      return {
        error:
          "Esiste già un account con questa email. Prova ad accedere o recupera la password.",
      };
    }
    return {
      error:
        "Registrazione non riuscita. Verifica i dati o riprova più tardi.",
    };
  }

  // Garantisce status pending + campi anche se il trigger non ha letto i meta
  if (data.user?.id) {
    const service = createServiceClient();
    if (service) {
      await service
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          class_name: className,
          role: "studente",
          status: "pending",
        })
        .eq("id", data.user.id);
    }
  }

  try {
    const adminEmails = await listAdminEmails();
    await notifyAdminsNewRegistration({
      studentName: fullName,
      studentEmail: parsed.data.email,
      adminEmails,
      siteName: settings.siteName,
    });
  } catch (err) {
    console.error("[registration] notify admins:", err);
  }

  // Se Supabase ha creato sessione (email confirm off), manda alla pending page
  if (data.session) {
    redirect("/auth/pending?status=pending");
  }

  return { success: true };
}

async function assertAdmin(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const profile = await getCurrentProfile();
  if (!isAdmin(profile)) {
    return { ok: false, error: "Solo gli admin possono gestire gli utenti." };
  }
  return { ok: true };
}

export type UserModerationResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function approveRegistrationAction(
  userId: string,
): Promise<UserModerationResult> {
  const gate = await assertAdmin();
  if (!gate.ok) return gate;

  const updated = await updateProfileStatus(userId, "active");
  if (!updated) {
    return { ok: false, error: "Impossibile approvare la richiesta." };
  }

  const settings = await getSiteSettings();
  const name =
    updated.full_name ||
    [updated.first_name, updated.last_name].filter(Boolean).join(" ") ||
    updated.email;
  await notifyStudentStatusChange({
    to: updated.email,
    studentName: name,
    siteName: settings.siteName,
    status: "active",
  });

  revalidatePath("/admin/utenti");
  return { ok: true, message: "Account approvato." };
}

export async function rejectRegistrationAction(
  userId: string,
  reason?: string,
): Promise<UserModerationResult> {
  const gate = await assertAdmin();
  if (!gate.ok) return gate;

  const updated = await updateProfileStatus(userId, "rejected", reason);
  if (!updated) {
    return { ok: false, error: "Impossibile rifiutare la richiesta." };
  }

  const settings = await getSiteSettings();
  const name =
    updated.full_name ||
    [updated.first_name, updated.last_name].filter(Boolean).join(" ") ||
    updated.email;
  await notifyStudentStatusChange({
    to: updated.email,
    studentName: name,
    siteName: settings.siteName,
    status: "rejected",
    reason,
  });

  revalidatePath("/admin/utenti");
  return { ok: true, message: "Richiesta rifiutata." };
}

export async function bulkApproveRegistrationsAction(
  userIds: string[],
): Promise<UserModerationResult> {
  const gate = await assertAdmin();
  if (!gate.ok) return gate;

  const settings = await getSiteSettings();
  let okCount = 0;
  for (const id of userIds) {
    const updated = await updateProfileStatus(id, "active");
    if (!updated) continue;
    okCount += 1;
    const name =
      updated.full_name ||
      [updated.first_name, updated.last_name].filter(Boolean).join(" ") ||
      updated.email;
    await notifyStudentStatusChange({
      to: updated.email,
      studentName: name,
      siteName: settings.siteName,
      status: "active",
    });
  }

  revalidatePath("/admin/utenti");
  return {
    ok: true,
    message: `${okCount} account approvati.`,
  };
}

export async function setUserStatusAction(
  userId: string,
  status: Extract<ProfileStatus, "active" | "suspended">,
): Promise<UserModerationResult> {
  const gate = await assertAdmin();
  if (!gate.ok) return gate;

  const me = await getCurrentProfile();
  if (me?.id === userId) {
    return { ok: false, error: "Non puoi sospendere il tuo stesso account." };
  }

  const updated = await updateProfileStatus(userId, status);
  if (!updated) {
    return { ok: false, error: "Aggiornamento stato non riuscito." };
  }

  revalidatePath("/admin/utenti");
  return {
    ok: true,
    message: status === "active" ? "Account riattivato." : "Account sospeso.",
  };
}

export async function deleteUserAction(
  userId: string,
): Promise<UserModerationResult> {
  const gate = await assertAdmin();
  if (!gate.ok) return gate;

  const me = await getCurrentProfile();
  if (me?.id === userId) {
    return { ok: false, error: "Non puoi eliminare il tuo stesso account." };
  }

  const target = await getProfileById(userId);
  if (!target) {
    return { ok: false, error: "Utente non trovato." };
  }

  const result = await deleteUserCompletely(userId);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/admin/utenti");
  return {
    ok: true,
    message: "Account e dati correlati eliminati.",
  };
}

export async function createStudentManuallyAction(
  formData: FormData,
): Promise<UserModerationResult> {
  const gate = await assertAdmin();
  if (!gate.ok) return gate;

  const service = createServiceClient();
  if (!service) {
    return {
      ok: false,
      error:
        "Creazione manuale richiede SUPABASE_SERVICE_ROLE_KEY sul server.",
    };
  }

  const firstName = sanitizeName(String(formData.get("firstName") || ""));
  const lastName = sanitizeName(String(formData.get("lastName") || ""));
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const className = sanitizeName(String(formData.get("className") || "")) || null;

  if (firstName.length < 2 || lastName.length < 2) {
    return { ok: false, error: "Nome e cognome obbligatori." };
  }
  if (!email.includes("@") || password.length < 8) {
    return {
      ok: false,
      error: "Email valida e password di almeno 8 caratteri obbligatorie.",
    };
  }

  const fullName = `${firstName} ${lastName}`;
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      class_name: className,
    },
  });

  if (error || !data.user) {
    console.error("[registration] createStudentManually:", error);
    return {
      ok: false,
      error: "Creazione non riuscita (email già usata o errore Auth).",
    };
  }

  await service
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      class_name: className,
      role: "studente",
      status: "active",
    })
    .eq("id", data.user.id);

  revalidatePath("/admin/utenti");
  return { ok: true, message: "Studente creato e già attivo." };
}
