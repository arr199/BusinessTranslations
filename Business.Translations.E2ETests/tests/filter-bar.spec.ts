import { test, expect, type Route } from "@playwright/test";
import { mockApi, TRANSLATIONS, OK } from "./helpers/mock-api";

test.describe("Filter bar — search", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("typing in the search box filters translations", async ({ page }) => {
    const search = page.getByPlaceholder("Search by key or value...");
    await search.fill("login");

    // Wait for debounce (350ms) + network
    await page.waitForTimeout(500);

    // Should still show Auth translations containing "login"
    await expect(page.getByText("login.title")).toBeVisible();
    // Billing key should be gone
    await expect(page.getByText("invoice.total")).not.toBeVisible();
  });

  test("clearing search shows all translations again", async ({ page }) => {
    const search = page.getByPlaceholder("Search by key or value...");
    await search.fill("login");
    await page.waitForTimeout(500);
    await expect(page.getByText("invoice.total")).not.toBeVisible();

    await search.clear();
    await page.waitForTimeout(500);
    await expect(page.getByText("invoice.total")).toBeVisible();
  });
});

test.describe("Filter bar — language dropdown", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("opens language dropdown and shows all languages", async ({ page }) => {
    await page.getByText("Language: All").click();
    const dropdownOptions = page.locator("div[class*='absolute'] button");
    await expect(
      dropdownOptions.filter({ hasText: "All Languages" }),
    ).toBeVisible();
    await expect(dropdownOptions.filter({ hasText: "English" })).toBeVisible();
    await expect(dropdownOptions.filter({ hasText: "Spanish" })).toBeVisible();
  });

  test("selecting a language filters translations", async ({ page }) => {
    await page.getByText("Language: All").click();
    await page
      .locator("div[class*='absolute'] button", { hasText: "Spanish" })
      .click();

    await expect(page.getByText("Language: Spanish")).toBeVisible();
    // Only Spanish translations should remain
    await expect(page.getByText("Bienvenido")).toBeVisible();
    await expect(page.getByText("Welcome back")).not.toBeVisible();
  });

  test("selecting All Languages resets filter", async ({ page }) => {
    await page.getByText("Language: All").click();
    await page
      .locator("div[class*='absolute'] button", { hasText: "Spanish" })
      .click();
    await expect(page.getByText("Welcome back")).not.toBeVisible();

    await page.getByText("Language: Spanish").click();
    await page
      .locator("div[class*='absolute'] button", { hasText: "All Languages" })
      .click();
    await expect(page.getByText("Language: All")).toBeVisible();
    await expect(page.getByText("Welcome back")).toBeVisible();
  });
});

test.describe("Filter bar — module dropdown", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("opens module dropdown and shows all modules", async ({ page }) => {
    await page.getByText("Module: All").click();
    const dropdownOptions = page.locator("div[class*='absolute'] button");
    await expect(
      dropdownOptions.filter({ hasText: "All Modules" }),
    ).toBeVisible();
    await expect(
      page.locator("div[class*='absolute'] button", { hasText: "Auth" }),
    ).toBeVisible();
    await expect(
      page.locator("div[class*='absolute'] button", { hasText: "Billing" }),
    ).toBeVisible();
  });

  test("selecting a module filters translations", async ({ page }) => {
    await page.getByText("Module: All").click();
    await page
      .locator("div[class*='absolute'] button", { hasText: "Auth" })
      .click();

    await expect(page.getByText("Module: Auth")).toBeVisible();
    await expect(page.getByText("login.title")).toBeVisible();
    await expect(page.getByText("invoice.total")).not.toBeVisible();
  });
});

test.describe("Filter bar — refresh", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("clicking refresh re-fetches translations", async ({ page }) => {
    let fetchCount = 0;
    await page.route("**/bt/translations?*", async (route: Route) => {
      fetchCount++;
      await route.fulfill({
        json: {
          ...OK,
          data: TRANSLATIONS,
          totalCount: TRANSLATIONS.length,
        },
      });
    });

    const refreshBtn = page.locator(
      'button:has(span.material-symbols-outlined:text("refresh"))',
    );
    await refreshBtn.click();
    // We expect at least one additional fetch
    expect(fetchCount).toBeGreaterThanOrEqual(1);
  });
});

test.describe("CSV Export", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("clicking Export triggers a download", async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByText("Export").click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });
});

test.describe("CSV Import", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("import label triggers hidden file input", async ({ page }) => {
    const fileInput = page.locator('input[type="file"][accept=".csv"]');
    await expect(fileInput).toBeAttached();
    await expect(fileInput).toHaveClass(/hidden/);
  });

  test("uploading a CSV file calls the bulk import API", async ({ page }) => {
    let bulkCalled = false;
    await page.route("**/bt/translations/bulk", async (route: Route) => {
      if (route.request().method() === "POST") {
        bulkCalled = true;
        await route.fulfill({
          json: {
            ...OK,
            data: { created: 1, updated: 0, skipped: [], failed: [] },
          },
        });
      } else {
        await route.continue();
      }
    });

    // Create a CSV in-memory
    const csvContent =
      "module,keyName,languageCode,value\nAuth,import.key,EN,Imported Value";
    const fileInput = page.locator('input[type="file"][accept=".csv"]');

    await fileInput.setInputFiles({
      name: "import.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csvContent),
    });

    // Wait for processing
    await page.waitForTimeout(500);
    expect(bulkCalled).toBe(true);
  });

  test("trims whitespace from CSV fields before importing", async ({
    page,
  }) => {
    let sentRows: { module: string; keyName: string; languageCode: string; value: string }[] | undefined;
    await page.route("**/bt/translations/bulk", async (route: Route) => {
      sentRows = (route.request().postDataJSON() as { rows: typeof sentRows }).rows;
      await route.fulfill({
        json: {
          ...OK,
          data: { created: 1, updated: 0, skipped: [], failed: [] },
        },
      });
    });

    const csvContent =
      "module,keyName,languageCode,value\n Authentication , import.key , EN , Padded Value ";
    const fileInput = page.locator('input[type="file"][accept=".csv"]');

    await fileInput.setInputFiles({
      name: "import.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csvContent),
    });

    await page.waitForTimeout(500);

    expect(sentRows).toBeDefined();
    expect(sentRows![0].module).toBe("Authentication");
    expect(sentRows![0].keyName).toBe("import.key");
    expect(sentRows![0].languageCode).toBe("EN");
    expect(sentRows![0].value).toBe("Padded Value");
  });

  test("importing shows a summary modal with per-row results", async ({
    page,
  }) => {
    await page.route("**/bt/translations/bulk", async (route: Route) => {
      await route.fulfill({
        json: {
          ...OK,
          data: { created: 2, updated: 1, skipped: [], failed: [] },
        },
      });
    });

    const csvContent =
      "module,keyName,languageCode,value\nAuth,a.one,EN,One\nAuth,a.two,EN,Two\nAuth,a.one,EN,One-Updated";
    const fileInput = page.locator('input[type="file"][accept=".csv"]');

    await fileInput.setInputFiles({
      name: "import.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csvContent),
    });

    const modal = page.getByTestId("import-summary-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByTestId("summary-created").getByText("2")).toBeVisible();
    await expect(modal.getByTestId("summary-updated").getByText("1")).toBeVisible();

    // Closing the modal dismisses it
    await modal.getByRole("button", { name: "Close" }).click();
    await expect(modal).not.toBeVisible();
  });

  test("summary modal lists skipped rows with reasons", async ({ page }) => {
    await page.route("**/bt/translations/bulk", async (route: Route) => {
      await route.fulfill({
        json: {
          ...OK,
          data: {
            created: 0,
            updated: 0,
            skipped: [
              { key: "import.key", reason: "Module 'Nope_Module' not found." },
            ],
            failed: [],
          },
        },
      });
    });

    const csvContent = "module,keyName,languageCode,value\nNope_Module,import.key,EN,Imported Value";
    const fileInput = page.locator('input[type="file"][accept=".csv"]');

    await fileInput.setInputFiles({
      name: "import.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csvContent),
    });

    const modal = page.getByTestId("import-summary-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByTestId("summary-skipped").getByText("1")).toBeVisible();
    await expect(modal.getByText("import.key")).toBeVisible();
    await expect(modal.getByText("Module 'Nope_Module' not found.")).toBeVisible();
  });
});
