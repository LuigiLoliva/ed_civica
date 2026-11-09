import { describe, expect, it } from "vitest";

import {
  createCommentSchema,
  moderateCommentSchema,
  reportCommentSchema,
} from "@/lib/comments/schema";

describe("createCommentSchema", () => {
  it("accetta commento minimo", () => {
    const result = createCommentSchema.safeParse({
      articleId: "articolo-demo",
      authorName: "Marco",
      body: "Ottimo approfondimento sull'ONU.",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.authorEmail).toBeNull();
    }
  });

  it("rifiuta body troppo lungo", () => {
    const result = createCommentSchema.safeParse({
      articleId: "articolo-demo",
      authorName: "Marco",
      body: "x".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("rifiuta email non valida", () => {
    const result = createCommentSchema.safeParse({
      articleId: "articolo-demo",
      authorName: "Marco",
      authorEmail: "non-un-email",
      body: "Commento",
    });
    expect(result.success).toBe(false);
  });
});

describe("reportCommentSchema", () => {
  it("richiede motivo minimo", () => {
    expect(
      reportCommentSchema.safeParse({
        commentId: "550e8400-e29b-41d4-a716-446655440000",
        reason: "ab",
      }).success,
    ).toBe(false);
  });
});

describe("moderateCommentSchema", () => {
  it("accetta azioni note", () => {
    expect(
      moderateCommentSchema.safeParse({
        commentId: "550e8400-e29b-41d4-a716-446655440000",
        action: "approve",
      }).success,
    ).toBe(true);
  });

  it("rifiuta azione sconosciuta", () => {
    expect(
      moderateCommentSchema.safeParse({
        commentId: "550e8400-e29b-41d4-a716-446655440000",
        action: "publish",
      }).success,
    ).toBe(false);
  });
});
