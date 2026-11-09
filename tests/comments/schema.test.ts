import { describe, expect, it } from "vitest";

import {
  createCommentSchema,
  moderateCommentSchema,
  reportCommentSchema,
} from "@/lib/comments/schema";

describe("createCommentSchema", () => {
  it("accetta commento minimo (nome ≥2, body ≥2)", () => {
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

  it("rifiuta nome troppo corto", () => {
    const result = createCommentSchema.safeParse({
      articleId: "articolo-demo",
      authorName: "A",
      body: "Commento valido",
    });
    expect(result.success).toBe(false);
  });

  it("rifiuta nome oltre 50 caratteri", () => {
    const result = createCommentSchema.safeParse({
      articleId: "articolo-demo",
      authorName: "a".repeat(51),
      body: "Commento valido",
    });
    expect(result.success).toBe(false);
  });

  it("rifiuta body troppo corto", () => {
    const result = createCommentSchema.safeParse({
      articleId: "articolo-demo",
      authorName: "Marco",
      body: "x",
    });
    expect(result.success).toBe(false);
  });

  it("rifiuta body troppo lungo (>1000)", () => {
    const result = createCommentSchema.safeParse({
      articleId: "articolo-demo",
      authorName: "Marco",
      body: "x".repeat(1001),
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
