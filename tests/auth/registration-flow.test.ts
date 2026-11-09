import { describe, expect, it } from "vitest";

import {
  forcedStudentRole,
  passwordStrength,
  registrationSchema,
} from "@/lib/auth/registration-schema";
import { isAdminRole, normalizeRole } from "@/lib/auth/role-utils";
import {
  isActiveStatus,
  loginBlockedMessage,
  normalizeProfileStatus,
} from "@/lib/auth/status";
import type { Profile } from "@/types/database";

/** Specchio puro di canAccessAdmin / isAdmin (senza import server Next). */
function canAccessAdmin(profile: Profile | null): boolean {
  if (!profile) return false;
  const role = normalizeRole(profile.role);
  if (!role || (role !== "admin" && role !== "studente")) return false;
  return isActiveStatus(profile.status);
}

function isAdmin(profile: Profile | null): boolean {
  return Boolean(profile && isAdminRole(profile.role) && isActiveStatus(profile.status));
}

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "u1",
    email: "studente@scuola.it",
    full_name: "Mario Rossi",
    first_name: "Mario",
    last_name: "Rossi",
    class_name: "3A",
    role: "studente",
    status: "pending",
    rejection_reason: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("registrazione → pending → login bloccato → approvazione → accesso", () => {
  it("schema accetta dati validi e rifiuta privacy non accettata", () => {
    const ok = registrationSchema.safeParse({
      firstName: "Mario",
      lastName: "Rossi",
      email: "mario@scuola.it",
      password: "password1",
      className: "3A",
      privacyAccepted: true,
      turnstileToken: "tok",
    });
    expect(ok.success).toBe(true);

    const noPrivacy = registrationSchema.safeParse({
      firstName: "Mario",
      lastName: "Rossi",
      email: "mario@scuola.it",
      password: "password1",
      privacyAccepted: false,
    });
    expect(noPrivacy.success).toBe(false);
  });

  it("utente pending non accede all'admin; dopo active sì", () => {
    const pending = profile({ status: "pending" });
    expect(isActiveStatus(pending.status)).toBe(false);
    expect(canAccessAdmin(pending)).toBe(false);
    expect(loginBlockedMessage("pending")).toMatch(/docente/i);

    const active = profile({ status: "active" });
    expect(isActiveStatus(active.status)).toBe(true);
    expect(canAccessAdmin(active)).toBe(true);

    const rejected = profile({ status: "rejected" });
    expect(canAccessAdmin(rejected)).toBe(false);
    expect(loginBlockedMessage("rejected")).toMatch(/rifiutat/i);

    const suspended = profile({ status: "suspended" });
    expect(canAccessAdmin(suspended)).toBe(false);
  });

  it("admin non-active non è considerato admin operativo", () => {
    const adminPending = profile({
      role: "admin",
      status: "pending",
      email: "docente@scuola.it",
    });
    expect(isAdmin(adminPending)).toBe(false);
    expect(isAdmin(profile({ role: "admin", status: "active" }))).toBe(true);
  });
});

describe("hardening ruolo dalla registrazione pubblica", () => {
  it("forcedStudentRole ignora qualsiasi role client (anche admin)", () => {
    expect(forcedStudentRole("admin")).toBe("studente");
    expect(forcedStudentRole({ role: "admin" })).toBe("studente");
    expect(forcedStudentRole(null)).toBe("studente");
  });

  it("normalizeProfileStatus rifiuta valori sconosciuti", () => {
    expect(normalizeProfileStatus("active")).toBe("active");
    expect(normalizeProfileStatus("hacker")).toBeNull();
  });
});

describe("passwordStrength", () => {
  it("aumenta con complessità", () => {
    expect(passwordStrength("short").score).toBeLessThan(
      passwordStrength("LungaEComplessa1!").score,
    );
  });
});
