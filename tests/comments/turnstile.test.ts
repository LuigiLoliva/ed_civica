import { afterEach, describe, expect, it, vi } from "vitest";

describe("verifyTurnstileToken", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("in sviluppo senza secret salta con stub", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    vi.stubEnv("TURNSTILE_BYPASS", "");

    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { verifyTurnstileToken } = await import(
      "../../src/lib/comments/turnstile"
    );
    const result = await verifyTurnstileToken(null);
    expect(result).toEqual({ ok: true, stub: true });
    expect(warn).toHaveBeenCalled();
  });

  it("in produzione senza secret fallisce", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    vi.stubEnv("TURNSTILE_BYPASS", "");

    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { verifyTurnstileToken } = await import(
      "../../src/lib/comments/turnstile"
    );
    const result = await verifyTurnstileToken("any");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/anti-spam/i);
    }
  });
});
