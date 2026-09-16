import type { Page, Route, Locator } from "@playwright/test";

// Mock data mirrors the real API contract: BtModuleModel / BtLanguageModel /
// BtTranslationModel with nested module/language, wrapped in ApiResponse.
export const MODULES = [
  { id: 1, name: "Auth", slug: "auth", icon: "lock" },
  { id: 2, name: "Billing", slug: "billing", icon: "payments" },
];

export const LANGUAGES = [
  { id: 1, code: "en", name: "English", isActive: true },
  { id: 2, code: "es", name: "Spanish", isActive: true },
];

export const TRANSLATIONS = [
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

export const OK = { success: true, message: "Ok", error: null };

/**
 * boundingBox that retries briefly — avoids null when React swaps the
 * element between visibility check and measurement.
 */
export async function stableBox(locator: Locator) {
  for (let i = 0; i < 20; i++) {
    const box = await locator.boundingBox();
    if (box) return box;
    await locator.page().waitForTimeout(100);
  }
  throw new Error(`element never produced a bounding box: ${locator}`);
}

/** Set up route mocks so the dashboard loads with deterministic data. */
export async function mockApi(page: Page) {
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

  // Dashboard (initial load check — returns 200 so tables are considered ready)
  await page.route("**/bt/dashboard", async (route: Route) => {
    await route.fulfill({ json: { status: "ok" } });
  });

  // Migration
  await page.route("**/bt/createTables", async (route: Route) => {
    await route.fulfill({ json: { success: true, message: "Tables created" } });
  });
}
