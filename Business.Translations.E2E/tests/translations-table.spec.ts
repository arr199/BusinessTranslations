import { test, expect, type Route } from "@playwright/test";
import { mockApi, TRANSLATIONS, MODULES, OK, stableBox } from "./helpers/mock-api";

test.describe("Translation table — row selection", () => {
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

test.describe("Table headers resilience", () => {
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
