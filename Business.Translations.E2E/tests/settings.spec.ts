import { test, expect, type Route } from "@playwright/test";
import { mockApi, LANGUAGES, OK } from "./helpers/mock-api";

test.describe("Settings page — modules", () => {
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

test.describe("Settings page — languages", () => {
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
