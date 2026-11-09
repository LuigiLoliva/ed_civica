import { describe, expect, it } from "vitest";

import { checkOffensiveOrSpam } from "../../src/lib/comments/offensive-filter";
import {
  __resetRateLimitForTests,
  checkRateLimit,
} from "../../src/lib/comments/rate-limit";
import {
  escapeHtml,
  sanitizeCommentText,
  sanitizeDisplayName,
} from "../../src/lib/comments/sanitize";

describe("sanitizeCommentText", () => {
  it("rimuove tag script e HTML", () => {
    const out = sanitizeCommentText(
      `<script>alert("xss")</script><b>ciao</b> mondo`,
    );
    expect(out).not.toMatch(/<script/i);
    expect(out).not.toMatch(/<b>/i);
    expect(out).toContain("ciao");
    expect(out).toContain("mondo");
  });

  it("neutralizza attributi onerror", () => {
    const out = sanitizeCommentText(`<img src=x onerror=alert(1)>ok`);
    expect(out).not.toMatch(/onerror/i);
    expect(out).toContain("ok");
  });

  it("trimma spazi", () => {
    expect(sanitizeCommentText("  ciao  ")).toBe("ciao");
  });
});

describe("sanitizeDisplayName", () => {
  it("taglia a 50 caratteri", () => {
    expect(sanitizeDisplayName("a".repeat(100)).length).toBe(50);
  });
});

describe("escapeHtml", () => {
  it("escapa caratteri speciali", () => {
    expect(escapeHtml(`<"&'>`)).toBe("&lt;&quot;&amp;&#39;&gt;");
  });
});

describe("checkOffensiveOrSpam", () => {
  it("blocca URL", () => {
    expect(checkOffensiveOrSpam("guarda https://spam.example.com").ok).toBe(
      false,
    );
  });

  it("accetta testo pulito", () => {
    expect(checkOffensiveOrSpam("Bel articolo sull'ONU").ok).toBe(true);
  });
});

describe("rate-limit stub", () => {
  it("blocca dopo il massimo", () => {
    __resetRateLimitForTests();
    const key = "test-ip";
    expect(checkRateLimit(key).allowed).toBe(true);
    expect(checkRateLimit(key).allowed).toBe(true);
    expect(checkRateLimit(key).allowed).toBe(true);
    expect(checkRateLimit(key).allowed).toBe(false);
  });
});
