/**
 * Email opzionali per registrazione / approvazione.
 * Se RESEND_API_KEY (e opzionalmente RESEND_FROM) non sono configurate,
 * le funzioni no-op: il badge in /admin/utenti resta sufficiente.
 * Non inventare secret: usa solo env già presenti sul progetto.
 */

type MailPayload = {
  to: string;
  subject: string;
  text: string;
};

function mailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

async function sendMail(payload: MailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.info(
      "[registration-email] RESEND_API_KEY assente: email non inviata.",
      payload.subject,
    );
    return false;
  }

  const from =
    process.env.RESEND_FROM?.trim() || "Voci Unite <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [payload.to],
        subject: payload.subject,
        text: payload.text,
      }),
    });
    if (!res.ok) {
      console.error(
        "[registration-email] Resend error:",
        res.status,
        await res.text().catch(() => ""),
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error("[registration-email] rete:", err);
    return false;
  }
}

export async function notifyAdminsNewRegistration(opts: {
  studentName: string;
  studentEmail: string;
  adminEmails: string[];
  siteName: string;
}): Promise<void> {
  if (!mailConfigured() || opts.adminEmails.length === 0) return;
  await Promise.all(
    opts.adminEmails.map((to) =>
      sendMail({
        to,
        subject: `[${opts.siteName}] Nuova richiesta di registrazione`,
        text: [
          `Nuova richiesta da ${opts.studentName} <${opts.studentEmail}>.`,
          "",
          "Approva o rifiuta da /admin/utenti.",
        ].join("\n"),
      }),
    ),
  );
}

export async function notifyStudentStatusChange(opts: {
  to: string;
  studentName: string;
  siteName: string;
  status: "active" | "rejected";
  reason?: string | null;
}): Promise<void> {
  if (!mailConfigured()) return;

  if (opts.status === "active") {
    await sendMail({
      to: opts.to,
      subject: `[${opts.siteName}] Account approvato`,
      text: [
        `Ciao ${opts.studentName},`,
        "",
        "Un docente ha approvato il tuo account. Puoi accedere da /auth/login.",
      ].join("\n"),
    });
    return;
  }

  await sendMail({
    to: opts.to,
    subject: `[${opts.siteName}] Registrazione non approvata`,
    text: [
      `Ciao ${opts.studentName},`,
      "",
      "La tua richiesta di registrazione non è stata approvata.",
      opts.reason ? `Motivo: ${opts.reason}` : "",
      "",
      "Per chiarimenti contatta un docente referente.",
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

export function isRegistrationEmailConfigured(): boolean {
  return mailConfigured();
}
