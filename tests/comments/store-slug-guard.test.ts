import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fromMock = vi.fn();
const createServiceClientMock = vi.fn(() => ({ from: fromMock }));
const isSupabaseConfiguredMock = vi.fn(() => true);

vi.mock("@/lib/supabase/service", () => ({
  isSupabaseConfigured: () => isSupabaseConfiguredMock(),
  createServiceClient: () => createServiceClientMock(),
}));

vi.mock("@/lib/supabase/clients", () => ({
  createAnonClient: () => createServiceClientMock(),
  createReadClient: async () => createServiceClientMock(),
  createWriteClient: async () => ({
    client: createServiceClientMock(),
    mode: "service" as const,
  }),
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

  it("con slug mock interroga articles e comments.public_slug (mai article_id=slug)", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const eqSlug = vi.fn(() => ({ maybeSingle }));
    const selectArticles = vi.fn(() => ({ eq: eqSlug }));

    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    const eqPublicSlug = vi.fn(() => ({ order }));
    const eqStatus = vi.fn(() => ({ eq: eqPublicSlug, or: vi.fn() }));
    const selectComments = vi.fn(() => ({ eq: eqStatus }));

    fromMock.mockImplementation((table: string) => {
      if (table === "articles") {
        return { select: selectArticles };
      }
      if (table === "comments") {
        return { select: selectComments };
      }
      throw new Error(`tabella inattesa: ${table}`);
    });

    const { listApprovedComments } = await import(
      "../../src/lib/comments/store"
    );
    const comments = await listApprovedComments("obiettivo-17-partnership");

    expect(fromMock).toHaveBeenCalledWith("articles");
    expect(eqSlug).toHaveBeenCalledWith("slug", "obiettivo-17-partnership");
    expect(fromMock).toHaveBeenCalledWith("comments");
    expect(eqPublicSlug).toHaveBeenCalledWith(
      "public_slug",
      "obiettivo-17-partnership",
    );
    expect(comments).toEqual([]);
  });

  it("con UUID valido interroga comments con or(article_id, public_slug)", async () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    const orFilter = vi.fn(() => ({ order }));
    const eqStatus = vi.fn(() => ({ or: orFilter, eq: vi.fn() }));
    const selectComments = vi.fn(() => ({ eq: eqStatus }));

    fromMock.mockImplementation((table: string) => {
      if (table === "comments") {
        return { select: selectComments };
      }
      throw new Error(`tabella inattesa: ${table}`);
    });

    const { listApprovedComments } = await import(
      "../../src/lib/comments/store"
    );
    await listApprovedComments(uuid);

    expect(fromMock).toHaveBeenCalledWith("comments");
    expect(orFilter).toHaveBeenCalledWith(
      `article_id.eq.${uuid},public_slug.eq.${uuid}`,
    );
  });
});
