import { test, expect, type Route } from "@playwright/test";
import {
  mockApi,
  MODULES,
  LANGUAGES,
  TRANSLATIONS,
  OK,
} from "./helpers/mock-api";

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
});

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
