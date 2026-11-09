import { describe, expect, it } from "vitest";

import { profileToSessionUser } from "@/lib/auth/session-user";
import type { Profile } from "@/types/database";

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "uuid-admin",
    email: "luigiloliva08@gmail.com",
    full_name: "Luigi Oliva",
    role: "admin",
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

  it("falls back to email local-part when full_name is null", () => {
    expect(profileToSessionUser(profile({ full_name: null })).nome).toBe(
      "luigiloliva08",
    );
  });
});
