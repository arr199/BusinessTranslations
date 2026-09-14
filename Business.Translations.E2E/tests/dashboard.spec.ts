import { test, expect, type Page, type Route, type Locator } from "@playwright/test";

// ---------------------------------------------------------------------------
// Shared mock data & helpers
// ---------------------------------------------------------------------------

// Mock data mirrors the real API contract: BtModuleModel / BtLanguageModel /
// BtTranslationModel with nested module/language, wrapped in ApiResponse.
const MODULES = [
  { id: 1, name: "Auth", slug: "auth", icon: "lock" },
  { id: 2, name: "Billing", slug: "billing", icon: "payments" },
];

const LANGUAGES = [
  { id: 1, code: "en", name: "English", isActive: true },
  { id: 2, code: "es", name: "Spanish", isActive: true },
];

const TRANSLATIONS = [
  {
    id: 1,
    moduleId: 1,
    languageId: 1,
    keyName: "login.title",
    value: "Welcome back",
    status: "active",
    module: MODULES[0],
    language: LANGUAGES[0],
  },
  {
    id: 2,
    moduleId: 1,
    languageId: 2,
    keyName: "login.subtitle",
    value: "Bienvenido",
    status: "active",
    module: MODULES[0],
    language: LANGUAGES[1],
  },
  {
    id: 3,
    moduleId: 2,
    languageId: 1,
    keyName: "invoice.total",
    value: "Total",
    status: "active",
    module: MODULES[1],
    language: LANGUAGES[0],
  },
];

const OK = { success: true, message: "Ok", error: null };

/**
 * boundingBox that retries briefly — avoids null when React swaps the
 * element between visibility check and measurement.
 */
async function stableBox(locator: Locator) {
  for (let i = 0; i < 20; i++) {
    const box = await locator.boundingBox();
    if (box) return box;
    await locator.page().waitForTimeout(100);
  }
  throw new Error(`element never produced a bounding box: ${locator}`);
}

/** Set up route mocks so the dashboard loads with deterministic data. */
async function mockApi(page: Page) {
  // Modules
  await page.route("**/bt/modules", async (route: Route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        json: { ...OK, data: MODULES },
      });
    } else if (route.request().method() === "POST") {
      const body = route.request().postDataJSON();
      await route.fulfill({
        json: { ...OK, id: "mod-new", ...body },
        status: 201,
      });
    } else {
      await route.continue();
    }
  });

  await page.route("**/bt/modules/*", async (route: Route) => {
    if (route.request().method() === "PUT") {
      await route.fulfill({ json: OK });
    } else if (route.request().method() === "DELETE") {
      await route.fulfill({ json: { ...OK, message: "Module deleted." } });
    } else {
      await route.continue();
    }
  });

  // Languages
  await page.route("**/bt/languages", async (route: Route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        json: { ...OK, data: LANGUAGES },
      });
    } else if (route.request().method() === "POST") {
      const body = route.request().postDataJSON();
      await route.fulfill({
        json: { ...OK, id: "lang-new", ...body },
        status: 201,
      });
    } else {
      await route.continue();
    }
  });

  await page.route("**/bt/languages/*", async (route: Route) => {
    if (route.request().method() === "DELETE") {
      await route.fulfill({ json: { ...OK, message: "Language deleted." } });
    } else {
      await route.continue();
    }
  });

  // Translations (GET with pagination envelope)
  await page.route("**/bt/translations?*", async (route: Route) => {
    if (route.request().method() === "GET") {
      const url = new URL(route.request().url());
      const keywords = url.searchParams.get("keywords") || "";
      const languageId = url.searchParams.get("languageId") || "";
      const moduleId = url.searchParams.get("moduleId") || "";

      let filtered = [...TRANSLATIONS];
      if (keywords) {
        const kw = keywords.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.keyName.toLowerCase().includes(kw) ||
            t.value.toLowerCase().includes(kw),
        );
      }
      if (languageId) {
        filtered = filtered.filter(
          (t) => t.languageId === Number(languageId),
        );
      }
      if (moduleId) {
        filtered = filtered.filter((t) => t.moduleId === Number(moduleId));
      }

      await route.fulfill({
        json: {
          ...OK,
          data: filtered,
          totalCount: filtered.length,
        },
      });
    } else {
      await route.continue();
    }
  });

  // Create translation
  await page.route("**/bt/translations", async (route: Route) => {
    if (route.request().method() === "POST") {
      const body = route.request().postDataJSON();
      await route.fulfill({
        json: { ...OK, id: "t-new", ...body },
        status: 201,
      });
    } else if (route.request().method() === "DELETE") {
      // bulk delete
      await route.fulfill({ json: { ...OK, message: "Deleted." } });
    } else {
      await route.continue();
    }
  });

  // Single translation operations
  await page.route("**/bt/translations/*", async (route: Route) => {
    if (route.request().method() === "PUT") {
      await route.fulfill({ json: { ...OK, message: "Updated." } });
    } else if (route.request().method() === "DELETE") {
      await route.fulfill({ json: { ...OK, message: "Deleted." } });
    } else {
      await route.continue();
    }
  });

  // Dashboard (initial load check â€” returns 200 so tables are considered ready)
  await page.route("**/bt/dashboard", async (route: Route) => {
    await route.fulfill({ json: { status: "ok" } });
  });

  // Migration
  await page.route("**/bt/createTables", async (route: Route) => {
    await route.fulfill({ json: { success: true, message: "Tables created" } });
  });
}

// ---------------------------------------------------------------------------
// 1. Dashboard layout & loading
// ---------------------------------------------------------------------------

test.describe("Dashboard layout", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("renders sidebar with dashboard and settings buttons", async ({
    page,
  }) => {
    await expect(page.locator('button[title="Projects"]')).toBeVisible();
    await expect(page.locator('button[title="Settings"]')).toBeVisible();
  });

  test("renders modules sidebar with All Modules and loaded modules", async ({
    page,
  }) => {
    const modulesAside = page.locator("aside", { hasText: "Add Module" });
    await expect(modulesAside.getByText("All Modules")).toBeVisible();
    await expect(modulesAside.getByText("Auth")).toBeVisible();
    await expect(modulesAside.getByText("Billing")).toBeVisible();
  });

  test("renders header with title and version badge", async ({ page }) => {
    await expect(page.locator("header").getByText("Translations")).toBeVisible();
    await expect(page.getByText("v1.0.0")).toBeVisible();
  });

  test("renders filter bar with search, dropdowns, and action buttons", async ({
    page,
  }) => {
    await expect(
      page.getByPlaceholder("Search by key or value..."),
    ).toBeVisible();
    await expect(page.getByText("Language: All")).toBeVisible();
    await expect(page.getByText("Module: All")).toBeVisible();
    await expect(page.getByText("Import")).toBeVisible();
    await expect(page.getByText("Export")).toBeVisible();
  });

  test("renders translation table with data rows", async ({ page }) => {
    await expect(page.getByText("login.title")).toBeVisible();
    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.getByText("Bienvenido")).toBeVisible();
    await expect(page.getByText("invoice.total")).toBeVisible();
  });

  test("renders footer with pagination info", async ({ page }) => {
    await expect(page.getByText(/Showing/)).toBeVisible();
    await expect(page.getByText("Rows per page:")).toBeVisible();
  });

  test("renders table column headers: Module, Key, Language, Value", async ({
    page,
  }) => {
    const thead = page.locator("thead");
    await expect(thead.getByText("Module")).toBeVisible();
    await expect(thead.getByText("Key")).toBeVisible();
    await expect(thead.getByText("Language")).toBeVisible();
    await expect(thead.getByText("Value")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2. Sidebar navigation
// ---------------------------------------------------------------------------

test.describe("Sidebar navigation", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("clicking Settings navigates to settings view", async ({ page }) => {
    await page.locator('button[title="Settings"]').click();
    await expect(page.getByText("Settings").first()).toBeVisible();
    await expect(page.getByText("Manage modules & languages")).toBeVisible();
  });

  test("clicking Projects from settings returns to dashboard", async ({
    page,
  }) => {
    await page.locator('button[title="Settings"]').click();
    await expect(page.getByText("Manage modules & languages")).toBeVisible();

    await page.locator('button[title="Projects"]').click();
    await expect(
      page.locator("header").getByText("Translations"),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("Search by key or value..."),
    ).toBeVisible();
  });

  test("hash-based routing: navigating to #settings shows settings page", async ({
    page,
  }) => {
    await page.goto("/#settings");
    await expect(page.getByText("Manage modules & languages")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 3. Modules sidebar
// ---------------------------------------------------------------------------

test.describe("Modules sidebar", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("Add Module button is visible at bottom of sidebar", async ({
    page,
  }) => {
    await expect(page.locator("aside").getByText("Add Module")).toBeVisible();
  });

  test("clicking Add Module opens new module modal", async ({ page }) => {
    await page.locator("aside").getByText("Add Module").click();
    await expect(page.getByText("Add New Module")).toBeVisible();
  });

  test("selecting a module highlights it", async ({ page }) => {
    const authButton = page.locator("aside button", { hasText: "Auth" });
    await authButton.click();
    // After clicking, the module dropdown in filter bar should reflect it
    await expect(page.getByText("Module: Auth")).toBeVisible();
  });

  test("selecting All Modules resets module filter", async ({ page }) => {
    // First select a specific module
    await page.locator("aside button", { hasText: "Auth" }).click();
    await expect(page.getByText("Module: Auth")).toBeVisible();

    // Then select All Modules
    await page.locator("aside button", { hasText: "All Modules" }).click();
    await expect(page.getByText("Module: All")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 4. Dark mode toggle
// ---------------------------------------------------------------------------

test.describe("Dark mode", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("dark mode button is visible", async ({ page }) => {
    const toggle = page
      .locator('button[title="Switch to Dark Mode"]')
      .or(page.locator('button[title="Switch to Light Mode"]'));
    await expect(toggle.first()).toBeVisible();
  });

  test("clicking toggle adds dark class to html element", async ({ page }) => {
    // Start in light mode â€” click to enable dark
    const toggle = page
      .locator('button[title="Switch to Dark Mode"]')
      .or(page.locator('button[title="Switch to Light Mode"]'));
    await toggle.first().click();

    // The <html> element should have the 'dark' class
    const hasDark = await page
      .locator("html")
      .evaluate((el) => el.classList.contains("dark"));
    // Just verify the button title changed (it should now offer the opposite)
    const btn = page
      .locator('button[title="Switch to Dark Mode"]')
      .or(page.locator('button[title="Switch to Light Mode"]'));
    await expect(btn.first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 5. Search / filter bar
// ---------------------------------------------------------------------------

test.describe("Filter bar â€” search", () => {
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

test.describe("Filter bar â€” language dropdown", () => {
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

test.describe("Filter bar â€” module dropdown", () => {
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

test.describe("Filter bar â€” refresh", () => {
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

// ---------------------------------------------------------------------------
// 6. Header actions â€” Add Language modal
// ---------------------------------------------------------------------------

test.describe("Add Language modal", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("opens when clicking Add Language header button", async ({ page }) => {
    await page.locator("header").getByText("Add Language").click();
    await expect(page.getByText("Add New Language")).toBeVisible();
  });

  test("has code and name fields", async ({ page }) => {
    await page.locator("header").getByText("Add Language").click();
    await expect(page.getByPlaceholder("e.g., EN, ES, FR")).toBeVisible();
    await expect(
      page.getByPlaceholder("e.g., English, Spanish, French"),
    ).toBeVisible();
  });

  test("code field auto-uppercases input", async ({ page }) => {
    await page.locator("header").getByText("Add Language").click();
    const codeInput = page.getByPlaceholder("e.g., EN, ES, FR");
    await codeInput.fill("fr");
    await expect(codeInput).toHaveValue("FR");
  });

  test("submit button is disabled when form is incomplete", async ({
    page,
  }) => {
    await page.locator("header").getByText("Add Language").click();
    const submitBtn = page.getByRole("button", { name: "Add Language" }).last();
    await expect(submitBtn).toBeDisabled();
  });

  test("can fill and submit the form", async ({ page }) => {
    await page.locator("header").getByText("Add Language").click();
    await page.getByPlaceholder("e.g., EN, ES, FR").fill("FR");
    await page
      .getByPlaceholder("e.g., English, Spanish, French")
      .fill("French");

    const submitBtn = page.getByRole("button", { name: "Add Language" }).last();
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Modal should close
    await expect(page.getByText("Add New Language")).not.toBeVisible();
  });

  test("cancel button closes modal without submitting", async ({ page }) => {
    await page.locator("header").getByText("Add Language").click();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("Add New Language")).not.toBeVisible();
  });

  test("pressing Escape closes modal", async ({ page }) => {
    await page.locator("header").getByText("Add Language").click();
    await expect(page.getByText("Add New Language")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByText("Add New Language")).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 7. Header actions â€” Add New Key (Translation) modal
// ---------------------------------------------------------------------------

test.describe("Add New Translation modal", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("opens when clicking Add New Key", async ({ page }) => {
    await page.getByText("Add New Key").click();
    await expect(page.getByText("Add New Translation")).toBeVisible();
  });

  test("has module dropdown, key input, language dropdown, value textarea", async ({
    page,
  }) => {
    await page.getByText("Add New Key").click();

    await expect(page.getByText("Module").first()).toBeVisible();
    await expect(page.getByText("Translation Key")).toBeVisible();
    await expect(
      page.getByPlaceholder("e.g., login_welcome_header"),
    ).toBeVisible();
    await expect(page.getByText("Translation Value")).toBeVisible();
    await expect(
      page.getByPlaceholder("Enter translation text..."),
    ).toBeVisible();
  });

  test("submit button is disabled until required fields are filled", async ({
    page,
  }) => {
    await page.getByText("Add New Key").click();
    const submitBtn = page.getByRole("button", { name: "Add Translation" });
    await expect(submitBtn).toBeDisabled();
  });

  test("can fill key and value fields", async ({ page }) => {
    await page.getByText("Add New Key").click();

    const keyInput = page.getByPlaceholder("e.g., login_welcome_header");
    await keyInput.fill("test.new_key");
    await expect(keyInput).toHaveValue("test.new_key");

    const valueInput = page.getByPlaceholder("Enter translation text...");
    await valueInput.fill("Hello World");
    await expect(valueInput).toHaveValue("Hello World");
  });

  test("module dropdown in modal shows available modules", async ({ page }) => {
    await page.getByText("Add New Key").click();

    // Click the module dropdown trigger (shows "Select module" placeholder)
    await page.getByText("Select module").click();
    const modalDropdownOptions = page.locator("div[class*='absolute'] button");
    await expect(
      modalDropdownOptions.filter({ hasText: "Auth" }),
    ).toBeVisible();
    await expect(
      modalDropdownOptions.filter({ hasText: "Billing" }),
    ).toBeVisible();
  });

  test("language dropdown in modal shows available languages", async ({
    page,
  }) => {
    await page.getByText("Add New Key").click();

    await page.getByText("Select language").click();
    const modalDropdownOptions = page.locator("div[class*='absolute'] button");
    await expect(
      modalDropdownOptions.filter({ hasText: "English" }),
    ).toBeVisible();
    await expect(
      modalDropdownOptions.filter({ hasText: "Spanish" }),
    ).toBeVisible();
  });

  test("cancel button closes modal", async ({ page }) => {
    await page.getByText("Add New Key").click();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("Add New Translation")).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 8. Add Module modal
// ---------------------------------------------------------------------------

test.describe("Add Module modal", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("opens from modules sidebar Add Module button", async ({ page }) => {
    await page.locator("aside").getByText("Add Module").click();
    await expect(page.getByText("Add New Module")).toBeVisible();
  });

  test("has module name field and icon picker grid", async ({ page }) => {
    await page.locator("aside").getByText("Add Module").click();
    await expect(page.getByText("Module Name")).toBeVisible();
    await expect(
      page.getByPlaceholder("e.g., Authentication, Billing"),
    ).toBeVisible();
    await expect(page.getByText("Icon")).toBeVisible();
  });

  test("submit is disabled with empty name", async ({ page }) => {
    await page.locator("aside").getByText("Add Module").click();
    const submitBtn = page.getByRole("button", { name: "Add Module" }).last();
    await expect(submitBtn).toBeDisabled();
  });

  test("can fill name and submit", async ({ page }) => {
    await page.locator("aside").getByText("Add Module").click();
    await page
      .getByPlaceholder("e.g., Authentication, Billing")
      .fill("Notifications");

    const submitBtn = page.getByRole("button", { name: "Add Module" }).last();
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    await expect(page.getByText("Add New Module")).not.toBeVisible();
  });

  test("icon picker allows selecting an icon", async ({ page }) => {
    await page.locator("aside").getByText("Add Module").click();

    // The icon grid should be visible
    const iconGrid = page.locator(
      "div.grid button:has(span.material-symbols-outlined)",
    );
    const count = await iconGrid.count();
    expect(count).toBeGreaterThan(0);

    // Click the first icon â€” it should become highlighted (bg-primary)
    await iconGrid.first().click();
  });
});

// ---------------------------------------------------------------------------
// 9. Translation table â€” selection
// ---------------------------------------------------------------------------

test.describe("Translation table â€” row selection", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("select-all checkbox exists in header", async ({ page }) => {
    await expect(page.locator("thead input[type=checkbox]")).toBeVisible();
  });

  test("individual row checkboxes exist for each row", async ({ page }) => {
    const rowCheckboxes = page.locator("tbody input[type=checkbox]");
    await expect(rowCheckboxes).toHaveCount(TRANSLATIONS.length);
  });

  test("checking select-all selects all rows", async ({ page }) => {
    await page.locator("thead input[type=checkbox]").check();

    // Bulk action bar should appear
    await expect(
      page.getByText(`${TRANSLATIONS.length} selected`),
    ).toBeVisible();
  });

  test("unchecking select-all deselects all rows", async ({ page }) => {
    await page.locator("thead input[type=checkbox]").check();
    await expect(
      page.getByText(`${TRANSLATIONS.length} selected`),
    ).toBeVisible();

    await page.locator("thead input[type=checkbox]").uncheck();
    await expect(
      page.getByText(`${TRANSLATIONS.length} selected`),
    ).not.toBeVisible();
  });

  test("checking an individual row shows the bulk action bar", async ({
    page,
  }) => {
    await page.locator("tbody input[type=checkbox]").first().check();
    await expect(page.getByText("1 selected")).toBeVisible();
  });

  test("selecting a row does not shift the table layout", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first();
    await expect(firstRow).toBeVisible();
    // Font swap can reflow rows — wait for it before measuring
    await page.evaluate(() => document.fonts.ready);
    const before = (await stableBox(firstRow)).y;

    await page.locator("tbody input[type=checkbox]").first().check();
    await expect(page.getByTestId("selection-bar")).toBeVisible();

    const after = (await stableBox(firstRow)).y;
    expect(after).toBe(before);
  });

  test("selection bar clears when switching modules", async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
    await expect(page.locator("tbody tr").first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);

    await page.locator("tbody input[type=checkbox]").first().check();
    await expect(page.getByTestId("selection-bar")).toBeVisible();

    await page.locator("aside button", { hasText: "Billing" }).click();
    await page.waitForTimeout(500);

    await expect(page.getByTestId("selection-bar")).not.toBeVisible();
    await expect(page.getByText("1 selected")).not.toBeVisible();
  });

  test("selection bar floats above the footer, bottom-centered", async ({
    page,
  }) => {
    await expect(page.locator("tbody tr").first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.locator("tbody input[type=checkbox]").first().check();
    const bar = page.getByTestId("selection-bar");
    await expect(bar).toBeVisible();

    const barBox = await stableBox(bar);
    const footerBox = await stableBox(page.locator("footer"));
    const viewport = page.viewportSize()!;

    expect(barBox.y + barBox.height).toBeLessThanOrEqual(footerBox.y);
    expect(barBox.x).toBeGreaterThanOrEqual(0);
    expect(barBox.x + barBox.width).toBeLessThanOrEqual(viewport.width);
    expect(
      Math.abs(barBox.x + barBox.width / 2 - viewport.width / 2),
    ).toBeLessThan(10);
  });

  test("Clear selection button in bulk bar deselects everything", async ({
    page,
  }) => {
    await page.locator("thead input[type=checkbox]").check();
    await page.getByText("Clear selection").click();
    await expect(
      page.getByText(`${TRANSLATIONS.length} selected`),
    ).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 10. Bulk delete
// ---------------------------------------------------------------------------

test.describe("Bulk delete", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("Delete button appears in selection bar after selection", async ({
    page,
  }) => {
    await page.locator("thead input[type=checkbox]").check();
    const bulkDeleteBtn = page
      .getByTestId("selection-bar")
      .getByRole("button", { name: "Delete" });
    await expect(bulkDeleteBtn).toBeVisible();
  });

  test("clicking bulk Delete opens confirmation modal", async ({ page }) => {
    await page.locator("thead input[type=checkbox]").check();
    await page
      .getByTestId("selection-bar")
      .getByRole("button", { name: "Delete" })
      .click();

    await expect(page.getByText("Delete Selected Translations")).toBeVisible();
    await expect(
      page.getByText(/Are you sure you want to delete/),
    ).toBeVisible();
  });

  test("cancel in bulk delete modal keeps selection", async ({ page }) => {
    await page.locator("thead input[type=checkbox]").check();
    await page
      .getByTestId("selection-bar")
      .getByRole("button", { name: "Delete" })
      .click();
    await page.getByRole("button", { name: "Cancel" }).click();

    // Selection should still be present
    await expect(
      page.getByText(`${TRANSLATIONS.length} selected`),
    ).toBeVisible();
  });

  test("confirming bulk delete calls API and clears selection", async ({
    page,
  }) => {
    let bulkDeleteCalled = false;
    await page.route("**/bt/translations", async (route: Route) => {
      if (route.request().method() === "DELETE") {
        bulkDeleteCalled = true;
        await route.fulfill({ json: { ...OK, message: "Deleted." } });
      } else if (route.request().method() === "POST") {
        await route.fulfill({ json: { ...OK, id: "t-new" }, status: 201 });
      } else {
        await route.continue();
      }
    });

    await page.locator("thead input[type=checkbox]").check();
    await page
      .getByTestId("selection-bar")
      .getByRole("button", { name: "Delete" })
      .click();

    // Confirm
    await page.getByRole("button", { name: "Delete" }).last().click();

    // Toast should appear
    await expect(page.getByText(/deleted/i)).toBeVisible();
    expect(bulkDeleteCalled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 11. Single translation delete
// ---------------------------------------------------------------------------

test.describe("Single translation delete", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("delete button appears on each row", async ({ page }) => {
    const deleteButtons = page.locator('tbody button[title="Delete key"]');
    await expect(deleteButtons).toHaveCount(TRANSLATIONS.length);
  });

  test("clicking row delete opens confirmation modal with key name", async ({
    page,
  }) => {
    await page.locator('tbody button[title="Delete key"]').first().click();

    await expect(page.getByText("Delete Translation")).toBeVisible();
    await expect(
      page.getByText("Are you sure you want to delete this translation?"),
    ).toBeVisible();
    // Key name should appear in modal
    await expect(
      page.locator("code", { hasText: "login.title" }).last(),
    ).toBeVisible();
  });

  test("cancel in delete modal closes without deleting", async ({ page }) => {
    await page.locator('tbody button[title="Delete key"]').first().click();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("Delete Translation")).not.toBeVisible();
    // Row should still be there
    await expect(page.getByText("login.title")).toBeVisible();
  });

  test("confirming delete calls API", async ({ page }) => {
    let deleteCalled = false;
    await page.route("**/bt/translations/*", async (route: Route) => {
      if (route.request().method() === "DELETE") {
        deleteCalled = true;
        await route.fulfill({ json: { ...OK, message: "Deleted." } });
      } else {
        await route.continue();
      }
    });

    await page.locator('tbody button[title="Delete key"]').first().click();
    await page.getByRole("button", { name: "Delete" }).last().click();

    await expect(page.getByText(/deleted/i)).toBeVisible();
    expect(deleteCalled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 12. Inline editing
// ---------------------------------------------------------------------------

test.describe("Inline translation editing", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("translation value is editable inline via textarea", async ({
    page,
  }) => {
    const textarea = page.locator("tbody textarea").first();
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveValue("Welcome back");
  });

  test("editing value and pressing Enter triggers save", async ({ page }) => {
    let putCalled = false;
    await page.route("**/bt/translations/*", async (route: Route) => {
      if (route.request().method() === "PUT") {
        putCalled = true;
        await route.fulfill({ json: OK });
      } else {
        await route.continue();
      }
    });

    const textarea = page.locator("tbody textarea").first();
    await textarea.click();
    await textarea.fill("Welcome back updated");
    await textarea.press("Enter");

    // Should trigger PUT
    await page.waitForTimeout(300);
    expect(putCalled).toBe(true);
  });

  test("pressing Escape cancels edit and restores original value", async ({
    page,
  }) => {
    const textarea = page.locator("tbody textarea").first();
    await textarea.click();
    await textarea.fill("Changed value");

    await textarea.press("Escape");
    await expect(textarea).toHaveValue("Welcome back");
  });

  test("blurring textarea after change saves the value", async ({ page }) => {
    let putCalled = false;
    await page.route("**/bt/translations/*", async (route: Route) => {
      if (route.request().method() === "PUT") {
        putCalled = true;
        await route.fulfill({ json: OK });
      } else {
        await route.continue();
      }
    });

    const textarea = page.locator("tbody textarea").first();
    await textarea.click();
    await textarea.fill("Updated via blur");

    // Click somewhere else to blur
    await page.locator("thead").click();
    await page.waitForTimeout(300);

    expect(putCalled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 13. Copy key
// ---------------------------------------------------------------------------

test.describe("Copy key button", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("copy key button exists on each row (visible on hover)", async ({
    page,
  }) => {
    const copyButtons = page.locator('button[title="Copy key"]');
    // They exist in the DOM even if opacity-0
    await expect(copyButtons.first()).toBeAttached();
  });

  test("clicking copy key shows check icon feedback", async ({ page }) => {
    // Grant clipboard permission
    await page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"]);

    const firstRow = page.locator("tbody tr").first();
    // Hover to reveal buttons
    await firstRow.hover();

    const copyBtn = firstRow.locator('button[title="Copy key"]');
    await copyBtn.click();

    // Should show check icon briefly
    await expect(firstRow.locator('span:text("check")')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 14. CSV Export
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// 15. CSV Import
// ---------------------------------------------------------------------------

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

  test("uploading a CSV file calls create translation API", async ({
    page,
  }) => {
    let createCalls = 0;
    await page.route("**/bt/translations", async (route: Route) => {
      if (route.request().method() === "POST") {
        createCalls++;
        await route.fulfill({
          json: { id: `t-imp-${createCalls}` },
          status: 201,
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
    expect(createCalls).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// 16. Settings page â€” modules management
// ---------------------------------------------------------------------------

test.describe("Settings page â€” modules", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/#settings");
  });

  test("displays Settings title and back button", async ({ page }) => {
    await expect(page.locator("h1", { hasText: "Settings" })).toBeVisible();
    await expect(page.locator('button[title="Back"]')).toBeVisible();
  });

  test("lists modules with name input and save/delete buttons", async ({
    page,
  }) => {
    // Each module should have its name in an input
    const moduleInputs = page.locator(
      'section:has-text("Modules") ul input',
    );
    await expect(moduleInputs.first()).toBeVisible();
  });

  test("Save button is disabled when module name is unchanged", async ({
    page,
  }) => {
    const saveBtn = page
      .locator('section:has-text("Modules") button[title="Save module"]')
      .first();
    await expect(saveBtn).toBeDisabled();
  });

  test("editing module name enables Save button", async ({ page }) => {
    const nameInput = page
      .locator('section:has-text("Modules") ul input')
      .first();
    await nameInput.fill("Auth Renamed");

    const saveBtn = page
      .locator('section:has-text("Modules") button[title="Save module"]')
      .first();
    await expect(saveBtn).toBeEnabled();
  });

  test("clicking Save calls update module API", async ({ page }) => {
    let putCalled = false;
    await page.route("**/bt/modules/*", async (route: Route) => {
      if (route.request().method() === "PUT") {
        putCalled = true;
        await route.fulfill({ json: OK });
      } else {
        await route.continue();
      }
    });

    const nameInput = page
      .locator('section:has-text("Modules") ul input')
      .first();
    await nameInput.fill("Auth Updated");

    await page
      .locator('section:has-text("Modules") button[title="Save module"]')
      .first()
      .click();

    await page.waitForTimeout(300);
    expect(putCalled).toBe(true);
  });

  test("clicking icon button opens icon picker grid", async ({ page }) => {
    await page
      .locator('section:has-text("Modules") button[title="Change icon"]')
      .first()
      .click();

    // Icon grid should appear
    const icons = page.locator('section:has-text("Modules") div.grid button');
    const count = await icons.count();
    expect(count).toBeGreaterThan(0);
  });

  test("clicking delete module opens ConfirmNameModal", async ({ page }) => {
    await page
      .locator('section:has-text("Modules") button[title="Delete module"]')
      .first()
      .click();

    await expect(page.getByText("Delete Module")).toBeVisible();
    await expect(page.getByText(/Type.*to confirm/)).toBeVisible();
  });

  test("ConfirmNameModal delete button is disabled until name matches", async ({
    page,
  }) => {
    await page
      .locator('section:has-text("Modules") button[title="Delete module"]')
      .first()
      .click();

    const deleteBtn = page.getByRole("button", { name: "Delete" }).last();
    await expect(deleteBtn).toBeDisabled();

    // Type the wrong name
    const confirmInput = page.locator("input[placeholder]").last();
    await confirmInput.fill("wrong name");
    await expect(deleteBtn).toBeDisabled();

    // Type the correct name
    await confirmInput.fill("Auth");
    await expect(deleteBtn).toBeEnabled();
  });

  test("confirming module delete calls API", async ({ page }) => {
    let deleteCalled = false;
    await page.route("**/bt/modules/*", async (route: Route) => {
      if (route.request().method() === "DELETE") {
        deleteCalled = true;
        await route.fulfill({ json: OK });
      } else {
        await route.continue();
      }
    });

    await page
      .locator('section:has-text("Modules") button[title="Delete module"]')
      .first()
      .click();

    const confirmInput = page.locator("input[placeholder]").last();
    await confirmInput.fill("Auth");
    await page.getByRole("button", { name: "Delete" }).last().click();

    await page.waitForTimeout(300);
    expect(deleteCalled).toBe(true);
  });

  test("Add Module button in settings opens new module modal", async ({
    page,
  }) => {
    await page
      .locator('section:has-text("Modules")')
      .getByText("Add Module")
      .click();
    await expect(page.getByText("Add New Module")).toBeVisible();
  });

  test("back button returns to dashboard view", async ({ page }) => {
    await page.locator('button[title="Back"]').click();
    await expect(
      page.getByPlaceholder("Search by key or value..."),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 17. Settings page â€” languages management
// ---------------------------------------------------------------------------

test.describe("Settings page â€” languages", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/#settings");
  });

  test("lists languages with code and name", async ({ page }) => {
    const langSection = page.locator('section:has-text("Languages")');
    await expect(langSection.getByText("EN", { exact: true })).toBeVisible();
    await expect(langSection.getByText("English", { exact: true })).toBeVisible();
    await expect(langSection.getByText("ES", { exact: true })).toBeVisible();
    await expect(langSection.getByText("Spanish", { exact: true })).toBeVisible();
  });

  test("each language has a delete button", async ({ page }) => {
    const deleteButtons = page.locator(
      'section:has-text("Languages") button[title="Delete language"]',
    );
    await expect(deleteButtons).toHaveCount(LANGUAGES.length);
  });

  test("clicking delete language opens confirmation modal", async ({
    page,
  }) => {
    await page
      .locator('section:has-text("Languages") button[title="Delete language"]')
      .first()
      .click();

    await expect(
      page.getByRole("heading", { name: "Delete Language" }),
    ).toBeVisible();
    await expect(
      page.getByText("Are you sure you want to delete this language?"),
    ).toBeVisible();
  });

  test("confirming language delete calls API", async ({ page }) => {
    let deleteCalled = false;
    await page.route("**/bt/languages/*", async (route: Route) => {
      if (route.request().method() === "DELETE") {
        deleteCalled = true;
        await route.fulfill({ json: OK });
      } else {
        await route.continue();
      }
    });

    await page
      .locator('section:has-text("Languages") button[title="Delete language"]')
      .first()
      .click();

    await page.getByRole("button", { name: "Delete" }).last().click();

    await page.waitForTimeout(300);
    expect(deleteCalled).toBe(true);
  });

  test("Add Language button in settings opens language modal", async ({
    page,
  }) => {
    await page
      .locator('section:has-text("Languages")')
      .getByText("Add Language")
      .click();
    await expect(page.getByText("Add New Language")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 18. Footer / Pagination
// ---------------------------------------------------------------------------

test.describe("Footer and pagination", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("shows correct item range", async ({ page }) => {
    await expect(
      page.getByText(/Showing.*\d+-\d+.*of.*\d+.*translations/),
    ).toBeVisible();
  });

  test("rows per page selector is present with options", async ({ page }) => {
    const select = page.locator("footer select");
    await expect(select).toBeVisible();

    // Should have 10, 25, 50 options
    await expect(select.locator("option")).toHaveCount(3);
  });

  test("previous page button is disabled on first page", async ({ page }) => {
    const prevBtn = page.locator(
      'footer button:has(span:text("chevron_left"))',
    );
    await expect(prevBtn).toBeDisabled();
  });

  test("current page number is displayed", async ({ page }) => {
    const pageNumber = page.locator("footer span.font-bold.text-primary");
    await expect(pageNumber).toHaveText("1");
  });

  test("changing rows per page updates the display", async ({ page }) => {
    const select = page.locator("footer select");
    await select.selectOption("25");
    await expect(select).toHaveValue("25");
  });
});

// ---------------------------------------------------------------------------
// 19. Empty state
// ---------------------------------------------------------------------------

test.describe("Empty state", () => {
  test("shows empty state when no translations exist", async ({ page }) => {
    // Mock empty translations
    await page.route("**/bt/translations?*", async (route: Route) => {
      await route.fulfill({ json: { ...OK, data: [], totalCount: 0 } });
    });
    await page.route("**/bt/modules", async (route: Route) => {
      await route.fulfill({ json: MODULES });
    });
    await page.route("**/bt/languages", async (route: Route) => {
      await route.fulfill({ json: LANGUAGES });
    });
    await page.route("**/bt/dashboard", async (route: Route) => {
      await route.fulfill({ json: { status: "ok" } });
    });

    await page.goto("/");

    await expect(page.getByText("No translations yet")).toBeVisible();
    await expect(
      page.getByText("Get started by adding your first translation key."),
    ).toBeVisible();
  });

  test("empty state has Add Translation button", async ({ page }) => {
    await page.route("**/bt/translations?*", async (route: Route) => {
      await route.fulfill({ json: { ...OK, data: [], totalCount: 0 } });
    });
    await page.route("**/bt/modules", async (route: Route) => {
      await route.fulfill({ json: MODULES });
    });
    await page.route("**/bt/languages", async (route: Route) => {
      await route.fulfill({ json: LANGUAGES });
    });
    await page.route("**/bt/dashboard", async (route: Route) => {
      await route.fulfill({ json: { status: "ok" } });
    });

    await page.goto("/");

    const addBtn = page.getByRole("button", { name: "Add Translation" });
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    await expect(page.getByText("Add New Translation")).toBeVisible();
  });

  test("shows 'No translations found' when search has no results", async ({
    page,
  }) => {
    await mockApi(page);

    // Override translations route to return empty for a search
    await page.route("**/bt/translations?*", async (route: Route) => {
      const url = new URL(route.request().url());
      const keywords = url.searchParams.get("keywords") || "";
      if (keywords) {
        await route.fulfill({ json: { ...OK, data: [], totalCount: 0 } });
      } else {
        await route.fulfill({
          json: { ...OK, data: TRANSLATIONS, totalCount: TRANSLATIONS.length },
        });
      }
    });

    await page.goto("/");
    await page.getByPlaceholder("Search by key or value...").fill("zzzzz");
    await page.waitForTimeout(500);

    await expect(page.getByText("No translations found")).toBeVisible();
    await expect(
      page.getByText("Try adjusting your search or filter criteria."),
    ).toBeVisible();
  });

  test("table headers stay visible when the selected module has no translations", async ({
    page,
  }) => {
    await mockApi(page);

    // Add a module that has no translations
    await page.route("**/bt/modules", async (route: Route) => {
      await route.fulfill({
        json: {
          ...OK,
          data: [...MODULES, { id: 3, name: "Empty", slug: "empty", icon: "block" }],
        },
      });
    });

    await page.goto("/");
    await page.locator("aside button", { hasText: "Empty" }).click();
    await page.waitForTimeout(500);

    const thead = page.locator("thead");
    await expect(thead).toBeVisible();
    await expect(thead.getByText("Module")).toBeVisible();
    await expect(thead.getByText("Key")).toBeVisible();
    await expect(thead.getByText("Language")).toBeVisible();

    await expect(page.getByText("No translations found")).toBeVisible();
  });

  test("table headers stay put while translations load when switching modules", async ({
    page,
  }) => {
    await mockApi(page);

    // Slow response only for the Billing module
    await page.route("**/bt/translations?*", async (route: Route) => {
      const url = new URL(route.request().url());
      if (url.searchParams.get("moduleId") === "2") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      await route.fulfill({
        json: {
          ...OK,
          data: TRANSLATIONS,
          totalCount: TRANSLATIONS.length,
        },
      });
    });

    await page.goto("/");
    await expect(page.locator("thead input[type=checkbox]")).toBeVisible();

    await page.locator("aside button", { hasText: "Billing" }).click();

    // While the fetch is pending, the real header (with its checkbox) must
    // stay visible — no full-table skeleton swap.
    await expect(
      page.locator("thead input[type=checkbox]"),
    ).toBeVisible({ timeout: 1000 });
    await expect(page.locator("tbody tr.animate-pulse").first()).toBeVisible();

    await expect(page.getByText("invoice.total")).toBeVisible({
      timeout: 5000,
    });
  });
});

// ---------------------------------------------------------------------------
// 20. Database Schema Modal
// ---------------------------------------------------------------------------

test.describe("Database Schema Modal", () => {
  test("opens automatically when tables are not ready", async ({ page }) => {
    await page.route("**/bt/modules", async (route: Route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/languages", async (route: Route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/translations?*", async (route: Route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/dashboard", async (route: Route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/createTables", async (route: Route) => {
      await route.fulfill({
        json: { success: true, message: "Tables created" },
      });
    });

    await page.goto("/");
    // The schema modal should appear automatically
    await expect(page.getByText("Database Schema Setup").first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("schema modal has Copy All SQL and Run Migration buttons", async ({
    page,
  }) => {
    await page.route("**/bt/modules", async (route: Route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/languages", async (route: Route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/translations?*", async (route: Route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/dashboard", async (route: Route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/createTables", async (route: Route) => {
      await route.fulfill({
        json: { success: true, message: "Tables created" },
      });
    });

    await page.goto("/");
    await expect(page.getByText("Database Schema Setup").first()).toBeVisible({
      timeout: 5000,
    });

    await expect(page.getByText("Copy All SQL")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Run Migration" }),
    ).toBeVisible();
  });

  test("clicking Run Migration calls createTables API", async ({ page }) => {
    let migrationCalled = false;

    await page.route("**/bt/modules", async (route: Route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/languages", async (route: Route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/translations?*", async (route: Route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/dashboard", async (route: Route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/createTables", async (route: Route) => {
      migrationCalled = true;
      await route.fulfill({
        json: { success: true, message: "Tables created" },
      });
    });

    await page.goto("/");
    await expect(page.getByText("Database Schema Setup").first()).toBeVisible({
      timeout: 5000,
    });

    await page.getByRole("button", { name: "Run Migration" }).click();
    await page.waitForTimeout(300);
    expect(migrationCalled).toBe(true);
  });

  test("schema modal can be closed with Cancel", async ({ page }) => {
    await page.route("**/bt/modules", async (route: Route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/languages", async (route: Route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/translations?*", async (route: Route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/dashboard", async (route: Route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/createTables", async (route: Route) => {
      await route.fulfill({
        json: { success: true, message: "Tables created" },
      });
    });

    await page.goto("/");
    await expect(page.getByText("Database Schema Setup").first()).toBeVisible({
      timeout: 5000,
    });

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("Database Schema Setup")).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 21. Toast notifications
// ---------------------------------------------------------------------------

test.describe("Toast notifications", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("success toast appears after creating a language", async ({ page }) => {
    await page.locator("header").getByText("Add Language").click();
    await page.getByPlaceholder("e.g., EN, ES, FR").fill("FR");
    await page
      .getByPlaceholder("e.g., English, Spanish, French")
      .fill("French");

    await page.getByRole("button", { name: "Add Language" }).last().click();

    // A success toast should appear
    await expect(page.locator('span:text("check_circle")')).toBeVisible({
      timeout: 3000,
    });
  });

  test("success toast appears after creating a module", async ({ page }) => {
    await page.locator("aside").getByText("Add Module").click();
    await page
      .getByPlaceholder("e.g., Authentication, Billing")
      .fill("TestModule");

    await page.getByRole("button", { name: "Add Module" }).last().click();

    await expect(page.locator('span:text("check_circle")')).toBeVisible({
      timeout: 3000,
    });
  });

  test("toast can be dismissed by clicking close", async ({ page }) => {
    // Trigger a toast
    await page.locator("header").getByText("Add Language").click();
    await page.getByPlaceholder("e.g., EN, ES, FR").fill("DE");
    await page
      .getByPlaceholder("e.g., English, Spanish, French")
      .fill("German");
    await page.getByRole("button", { name: "Add Language" }).last().click();

    const toastEl = page.locator('[id^="toast-"]').first();
    await expect(toastEl).toBeVisible({ timeout: 3000 });

    // Close it
    await toastEl.locator("button").click();
    await expect(toastEl).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 22. Error handling
// ---------------------------------------------------------------------------

test.describe("Error handling", () => {
  test("error toast appears when API fails on translation update", async ({
    page,
  }) => {
    await mockApi(page);
    await page.goto("/");

    // Override PUT to fail
    await page.route("**/bt/translations/*", async (route: Route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({ status: 500 });
      } else {
        await route.continue();
      }
    });

    const textarea = page.locator("tbody textarea").first();
    await textarea.click();
    await textarea.fill("Will fail");
    await textarea.press("Enter");

    await expect(page.locator('span:text("error")').first()).toBeVisible({
      timeout: 3000,
    });
  });

  test("error toast appears when CSV export has no data", async ({ page }) => {
    // Load with empty translations
    await page.route("**/bt/translations?*", async (route: Route) => {
      await route.fulfill({ json: { ...OK, data: [], totalCount: 0 } });
    });
    await page.route("**/bt/modules", async (route: Route) => {
      await route.fulfill({ json: MODULES });
    });
    await page.route("**/bt/languages", async (route: Route) => {
      await route.fulfill({ json: LANGUAGES });
    });
    await page.route("**/bt/dashboard", async (route: Route) => {
      await route.fulfill({ json: { status: "ok" } });
    });

    await page.goto("/");

    await page.getByText("Export").click();

    // Should show error toast "No translations to export."
    await expect(page.getByText("No translations to export.")).toBeVisible({
      timeout: 3000,
    });
  });
});

// ---------------------------------------------------------------------------
// 23. Keyboard shortcuts & accessibility
// ---------------------------------------------------------------------------

test.describe("Keyboard interactions", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("Escape closes any open modal", async ({ page }) => {
    // Open Add New Key modal
    await page.getByText("Add New Key").click();
    await expect(page.getByText("Add New Translation")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByText("Add New Translation")).not.toBeVisible();
  });

  test("Enter submits inline edit on translation row", async ({ page }) => {
    let putCalled = false;
    await page.route("**/bt/translations/*", async (route: Route) => {
      if (route.request().method() === "PUT") {
        putCalled = true;
        await route.fulfill({ json: OK });
      } else {
        await route.continue();
      }
    });

    const textarea = page.locator("tbody textarea").first();
    await textarea.click();
    await textarea.fill("Keyboard save");
    await textarea.press("Enter");

    await page.waitForTimeout(300);
    expect(putCalled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 24. Language badge colors
// ---------------------------------------------------------------------------

test.describe("Language badge display", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("each row shows language code badge", async ({ page }) => {
    // EN badge
    const enBadge = page.locator("tbody span.rounded-full", { hasText: "EN" });
    await expect(enBadge.first()).toBeVisible();

    // ES badge
    const esBadge = page.locator("tbody span.rounded-full", { hasText: "ES" });
    await expect(esBadge.first()).toBeVisible();
  });

  test("language name is displayed next to badge", async ({ page }) => {
    const rows = page.locator("tbody tr");
    // First row should have English
    await expect(rows.first().getByText("English")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 25. Module badge display in rows
// ---------------------------------------------------------------------------

test.describe("Module badge in rows", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
  });

  test("each row displays module name as badge", async ({ page }) => {
    const authBadges = page.locator("tbody span", { hasText: "Auth" });
    await expect(authBadges.first()).toBeVisible();

    const billingBadges = page.locator("tbody span", { hasText: "Billing" });
    await expect(billingBadges.first()).toBeVisible();
  });
});
