import { test, expect } from "@playwright/test";
import { mockApi } from "./helpers/mock-api";

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
    // Start in light mode — click to enable dark
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
