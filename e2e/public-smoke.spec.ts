import { expect, test } from "@playwright/test";

/**
 * Smoke e2e sul sito pubblico (dati mock, senza Supabase live).
 * Flusso redazionale completo studente→admin→pubblicato richiede
 * progetto Supabase reale + seed: vedi README.
 */
test.describe("sito pubblico", () => {
  test("home mostra brand e CTA principali", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Voci Unite",
    );
    await expect(
      page.getByRole("link", { name: "Leggi gli articoli" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Metti alla prova le tue conoscenze" }),
    ).toBeVisible();
  });

  test("footer espone Privacy e Cookie Policy", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(
      footer.getByRole("link", { name: "Privacy Policy" }),
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "Cookie Policy" }),
    ).toBeVisible();
  });

  test("pagina privacy e cookie sono raggiungibili", async ({ page }) => {
    await page.goto("/privacy");
    await expect(
      page.getByRole("heading", { name: "Privacy Policy" }),
    ).toBeVisible();
    await expect(page.getByText(/bozza scolastica/i).first()).toBeVisible();

    await page.goto("/cookie");
    await expect(
      page.getByRole("heading", { name: "Cookie Policy" }),
    ).toBeVisible();
  });

  test("elenco articoli mock e apertura dettaglio", async ({ page }) => {
    await page.goto("/articoli");
    await page.getByRole("link", { name: /cos'è l'onu/i }).click();
    await expect(page).toHaveURL(/\/articoli\//);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("robots e sitemap rispondono", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).toContain("Sitemap");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    expect(await sitemap.text()).toContain("/privacy");
  });
});

/**
 * Stub del flusso redazionale (senza Supabase): verifica solo che
 * le route admin/login esistano. Il flusso reale sarà abilitato
 * quando esistono credenziali e seed.
 */
test.describe("flusso redazionale (stub senza Supabase)", () => {
  test("login e admin rispondono senza crash", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(
      page.getByRole("heading", { name: "Area riservata" }),
    ).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();

    await page.goto("/admin");
    await expect(page.locator("body")).toBeVisible();
  });
});
