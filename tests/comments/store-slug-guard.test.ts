import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fromMock = vi.fn();
const createServiceClientMock = vi.fn(() => ({ from: fromMock }));
const isSupabaseConfiguredMock = vi.fn(() => true);

vi.mock("@/lib/supabase/service", () => ({
  isSupabaseConfigured: () => isSupabaseConfiguredMock(),
  createServiceClient: () => createServiceClientMock(),
}));

describe("listApprovedComments slug guard", () => {
  beforeEach(() => {
    fromMock.mockReset();
    createServiceClientMock.mockClear();
    isSupabaseConfiguredMock.mockReturnValue(true);
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("con slug mock interroga articles per slug e non comments.article_id con lo slug", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const eqSlug = vi.fn(() => ({ maybeSingle }));
    const selectArticles = vi.fn(() => ({ eq: eqSlug }));

    fromMock.mockImplementation((table: string) => {
      if (table === "articles") {
        return { select: selectArticles };
      }
      throw new Error(`comments non deve essere interrogato con slug non risolto (${table})`);
    });

    const { listApprovedComments } = await import("../../src/lib/comments/store");
    const comments = await listApprovedComments("obiettivo-17-partnership");

    expect(fromMock).toHaveBeenCalledWith("articles");
    expect(eqSlug).toHaveBeenCalledWith("slug", "obiettivo-17-partnership");
    expect(comments).toEqual([]);
  });

  it("con UUID valido interroga comments.article_id", async () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    const eqStatus = vi.fn(() => ({ order }));
    const eqArticle = vi.fn(() => ({ eq: eqStatus }));
    const selectComments = vi.fn(() => ({ eq: eqArticle }));

    fromMock.mockImplementation((table: string) => {
      if (table === "comments") {
        return { select: selectComments };
      }
      throw new Error(`tabella inattesa: ${table}`);
    });

    const { listApprovedComments } = await import("../../src/lib/comments/store");
    await listApprovedComments(uuid);

    expect(fromMock).toHaveBeenCalledWith("comments");
    expect(eqArticle).toHaveBeenCalledWith("article_id", uuid);
  });
});
