import { test, expect } from "@playwright/test";
import { mockApi } from "./helpers/mock-api";

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

    // Click the first icon — it should become highlighted (bg-primary)
    await iconGrid.first().click();
  });
});

test.describe("Database Schema Modal", () => {
  test("opens automatically when tables are not ready", async ({ page }) => {
    await page.route("**/bt/modules", async (route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/languages", async (route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/translations?*", async (route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/dashboard", async (route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/createTables", async (route) => {
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
    await page.route("**/bt/modules", async (route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/languages", async (route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/translations?*", async (route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/dashboard", async (route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/createTables", async (route) => {
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

    await page.route("**/bt/modules", async (route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/languages", async (route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/translations?*", async (route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/dashboard", async (route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/createTables", async (route) => {
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
    await page.route("**/bt/modules", async (route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/languages", async (route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/translations?*", async (route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/dashboard", async (route) => {
      await route.fulfill({ status: 500 });
    });
    await page.route("**/bt/createTables", async (route) => {
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
