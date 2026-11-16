import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

const tmpRoot = path.join(os.tmpdir(), `voci-unite-admin-list-${process.pid}`);

vi.mock("@/lib/supabase/service", () => ({
  isSupabaseConfigured: () => false,
  createServiceClient: () => null,
}));

describe("listAllCommentsForAdmin enrichment (file store + mock)", () => {
  beforeEach(async () => {
    await fs.rm(tmpRoot, { recursive: true, force: true });
    await fs.mkdir(tmpRoot, { recursive: true });
    vi.spyOn(process, "cwd").mockReturnValue(tmpRoot);
    vi.resetModules();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(tmpRoot, { recursive: true, force: true });
  });

  it("arricchisce titolo da mock-data per public_slug", async () => {
    const store = await import("../../src/lib/comments/store");
    await store.insertComment({
      articleId: "obiettivo-17-partnership",
      parentId: null,
      authorName: "Anna",
      authorEmail: null,
      body: "Commento su articolo mock.",
      ipHash: null,
    });

    const list = await store.listAllCommentsForAdmin();
    expect(list).toHaveLength(1);
    expect(list[0]?.articleSlug).toBe("obiettivo-17-partnership");
    expect(list[0]?.articleTitle).toMatch(/partnership|Obiettivo 17/i);
    expect(list[0]?.status).toBe("in_attesa");
  });
});
