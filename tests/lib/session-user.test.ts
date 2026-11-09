import { describe, expect, it } from "vitest";

import {
  normalizeProfileRow,
  profileToSessionUser,
} from "@/lib/auth/session-user";
import type { Profile } from "@/types/database";

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "uuid-admin",
    email: "luigiloliva08@gmail.com",
    full_name: "Luigi Oliva",
    first_name: "Luigi",
    last_name: "Oliva",
    class_name: null,
    role: "admin",
    status: "active",
    rejection_reason: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("profileToSessionUser", () => {
  it("maps Supabase admin profile into mock session shape", () => {
    expect(profileToSessionUser(profile())).toEqual({
      id: "uuid-admin",
      email: "luigiloliva08@gmail.com",
      nome: "Luigi",
      cognome: "Oliva",
      role: "admin",
    });
  });

  it("prefers first_name/last_name over full_name split", () => {
    expect(
      profileToSessionUser(
        profile({
          first_name: "Anna",
          last_name: "Rossi",
          full_name: "Nome Vecchio",
        }),
      ),
    ).toMatchObject({ nome: "Anna", cognome: "Rossi" });
  });

  it("falls back to email local-part when names are null", () => {
    expect(
      profileToSessionUser(
        profile({
          full_name: null,
          first_name: null,
          last_name: null,
        }),
      ).nome,
    ).toBe("luigiloliva08");
  });
});

describe("normalizeProfileRow", () => {
  it("defaults missing status to active for legacy rows", () => {
    const row = normalizeProfileRow(
      profile({ status: undefined as unknown as Profile["status"] }),
    );
    expect(row.status).toBe("active");
  });
});
