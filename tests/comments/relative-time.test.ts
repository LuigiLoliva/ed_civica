import { describe, expect, it } from "vitest";

import { formatRelativeTimeIt } from "@/lib/format";

describe("formatRelativeTimeIt", () => {
  it("restituisce una forma relativa in italiano", () => {
    const now = Date.parse("2026-11-09T12:00:00.000Z");
    const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString();
    const label = formatRelativeTimeIt(twoDaysAgo, now);
    expect(label).toMatch(/2 giorni fa|l['’]altro ieri/i);
  });
});
