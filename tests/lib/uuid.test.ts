import { describe, expect, it } from "vitest";

import { isUuid } from "../../src/lib/uuid";

describe("isUuid", () => {
  it("accetta UUID v4 validi", () => {
    expect(isUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isUuid("A0EEBC99-9C0B-4EF8-BB6D-6BB9BD380A11")).toBe(true);
  });

  it("rifiuta slug e valori non-UUID (non devono mai colpire colonne uuid)", () => {
    expect(isUuid("obiettivo-17-partnership")).toBe(false);
    expect(isUuid("cose-lonu-in-breve")).toBe(false);
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid("")).toBe(false);
    expect(isUuid(null)).toBe(false);
    expect(isUuid(undefined)).toBe(false);
    expect(isUuid("550e8400e29b41d4a716446655440000")).toBe(false);
  });
});
