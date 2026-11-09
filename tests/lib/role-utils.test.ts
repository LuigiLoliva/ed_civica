import { describe, expect, it } from "vitest";

import { isAdminRole, normalizeRole } from "@/lib/auth/role-utils";

describe("normalizeRole / isAdminRole", () => {
  it("accepts exact and messy admin strings", () => {
    expect(normalizeRole("admin")).toBe("admin");
    expect(normalizeRole(" Admin ")).toBe("admin");
    expect(normalizeRole("ADMIN")).toBe("admin");
    expect(isAdminRole(" Admin ")).toBe(true);
  });

  it("rejects unknown roles", () => {
    expect(normalizeRole("teacher")).toBeNull();
    expect(normalizeRole(null)).toBeNull();
    expect(isAdminRole("studente")).toBe(false);
  });
});
