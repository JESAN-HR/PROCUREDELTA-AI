import { test, expect } from "@playwright/test";
import path from "node:path";
test("ten meaningful public routes", async ({ page }) => {
  for (const route of [
    "",
    "analyze",
    "comparison",
    "documents",
    "history",
    "dashboard",
    "evidence",
    "architecture",
    "security",
    "docs",
  ]) {
    await page.goto("/" + route);
    await expect(page.locator("h1")).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Main navigation" }),
    ).toBeVisible();
  }
});
test("demo, evidence, persistence, correction, deletion", async ({ page }) => {
  await page.goto("/analyze");
  await page.getByRole("button", { name: "Load demo documents" }).click();
  await page
    .getByRole("button", { name: "Analyze changes", exact: true })
    .click();
  await expect(page).toHaveURL(/comparison/);
  await expect(
    page.getByText("Deadline extended by 7 days", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText("Experience requirement increased by 1 year."),
  ).toBeVisible();
  await page.getByText("Inspect source evidence").first().click();
  await expect(
    page.getByText("“Submission deadline: November 10, 2026”"),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Deadline extended by 7 days", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Correct inputs" }).click();
  await expect(
    page.getByRole("textbox", { name: "Original text" }),
  ).toHaveValue(/November 10/);
  await page.goto("/history");
  await page
    .getByRole("textbox", { name: "Search saved records" })
    .fill("not found");
  await expect(page.locator(".history-row")).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Search saved records" })
    .fill("fictional");
  await expect(page.locator(".history-row")).toHaveCount(1);
  await page.goto("/documents");
  await page.locator(".document-row").first().locator("summary").click();
  await page
    .getByRole("button", { name: "Delete document and linked reports" })
    .first()
    .click();
  await page.goto("/history");
  await expect(page.locator(".history-row")).toHaveCount(0);
});
test("real PDF extraction preserves page and source", async ({ page }) => {
  await page.goto("/analyze");
  await page
    .getByLabel("Original PDF")
    .setInputFiles(path.resolve("public/fixtures/original.pdf"));
  await expect(
    page.getByRole("textbox", { name: "Original text" }),
  ).toHaveValue(/November 10/);
  await page
    .getByLabel("Revised PDF")
    .setInputFiles(path.resolve("public/fixtures/revised.pdf"));
  await expect(page.getByRole("textbox", { name: "Revised text" })).toHaveValue(
    /November 17/,
  );
  await page
    .getByRole("button", { name: "Analyze changes", exact: true })
    .click();
  await expect(page).toHaveURL(/comparison/);
  await page.getByText("Inspect source evidence").first().click();
  await expect(page.getByText("original.pdf · Page 1").first()).toBeVisible();
});
test("invalid PDF and no-key endpoint fail honestly", async ({
  page,
  request,
}) => {
  await page.goto("/analyze");
  await page.getByLabel("Original PDF").setInputFiles({
    name: "invalid.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("bad"),
  });
  await expect(
    page.getByRole("alert").filter({ hasText: "Invalid PDF signature" }),
  ).toContainText("Invalid PDF signature");
  const response = await request.post("/api/ai", { data: {} });
  expect(response.status()).toBe(503);
});
test("mobile layout stays within viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/analyze");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("button", { name: "Load demo documents" }),
  ).toBeVisible();
});

test("textless PDF explains OCR limitation", async ({ page }) => {
  await page.goto("/analyze");
  await page
    .getByLabel("Original PDF")
    .setInputFiles(path.resolve("public/fixtures/no-text.pdf"));
  await expect(
    page.getByText("No readable text found.", { exact: false }),
  ).toBeVisible();
});
test("core processing needs no external requests and corrections clear page citations", async ({
  page,
}) => {
  const external: string[] = [];
  await page.route("**/*", (route) => {
    if (!route.request().url().startsWith("http://127.0.0.1:3000")) {
      external.push(route.request().url());
      return route.abort();
    }
    return route.continue();
  });
  await page.goto("/analyze");
  await page
    .getByLabel("Original PDF")
    .setInputFiles(path.resolve("public/fixtures/original.pdf"));
  await expect(
    page.getByRole("textbox", { name: "Original text" }),
  ).toHaveValue(/November 10/);
  const text = await page
    .getByRole("textbox", { name: "Original text" })
    .inputValue();
  await page
    .getByRole("textbox", { name: "Original text" })
    .fill(text + "\nUser reviewed text");
  await page
    .getByLabel("Revised PDF")
    .setInputFiles(path.resolve("public/fixtures/revised.pdf"));
  await expect(page.getByRole("textbox", { name: "Revised text" })).toHaveValue(
    /November 17/,
  );
  await page
    .getByRole("button", { name: "Analyze changes", exact: true })
    .click();
  await expect(page).toHaveURL(/comparison/);
  await page.getByText("Inspect source evidence").first().click();
  await expect(
    page.getByText("original.pdf · Text excerpt · no page citation").first(),
  ).toBeVisible();
  expect(external).toEqual([]);
});

test("messy PDF resolves actual amendments and exports a reviewed public copy", async ({
  page,
}) => {
  await page.goto("/analyze");
  await page
    .getByLabel("Original PDF")
    .setInputFiles(path.resolve("public/fixtures/messy-original-tender.pdf"));
  await expect(
    page.getByRole("textbox", { name: "Original text" }),
  ).toHaveValue(/two/);
  await page
    .getByLabel("Revised PDF")
    .setInputFiles(path.resolve("public/fixtures/messy-amendment-notice.pdf"));
  await expect(page.getByRole("textbox", { name: "Revised text" })).toHaveValue(
    /75,000/,
  );
  await page
    .getByRole("button", { name: "Analyze changes", exact: true })
    .click();
  await expect(page).toHaveURL(/comparison/);
  await expect(page.locator(".change-card")).toHaveCount(6);
  await expect(
    page.getByText("Bid security increased by BDT 25,000.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Comparable contract threshold",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Download reviewed public report (HTML)",
    }),
  ).toBeDisabled();
  await page
    .getByRole("checkbox", {
      name: "I reviewed the source evidence",
      exact: false,
    })
    .check();
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download reviewed public report (HTML)" })
    .click();
  expect((await pending).suggestedFilename()).toMatch(/\.html$/);
  await page.reload();
  await expect(page.locator(".change-card")).toHaveCount(6);
});
test("single notice brief, Bangla headings, searchable procurement timeline", async ({
  page,
}) => {
  await page.goto("/analyze");
  await page
    .getByRole("combobox", { name: "Analysis mode" })
    .selectOption("brief");
  await page
    .getByRole("textbox", { name: "Original text" })
    .fill(
      "Tender ID: TEST-2026-11\nTender title: Clinic supplies\nOffers must be received by 8 December 2026.\nBid security: BDT 40,000",
    );
  await page.getByRole("button", { name: "Create procurement brief" }).click();
  await expect(page).toHaveURL(/comparison/);
  await expect(page.getByText("Single-document brief")).toBeVisible();
  await page.getByRole("button", { name: "বাংলা শিরোনাম" }).click();
  await expect(
    page.getByRole("heading", { name: "দরপত্রের সারসংক্ষেপ" }),
  ).toBeVisible();
  await page.goto("/history");
  await page
    .getByRole("textbox", { name: "Search saved records" })
    .fill("TEST-2026-11");
  await expect(page.locator(".history-row")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Procurement timelines" }),
  ).toBeVisible();
});
test("scanned PDF OCR runs locally with no external requests", async ({
  page,
}) => {
  test.setTimeout(120000);
  const external: string[] = [];
  await page.route("**/*", (route) => {
    if (!route.request().url().startsWith("http://127.0.0.1:3000")) {
      external.push(route.request().url());
      return route.abort();
    }
    return route.continue();
  });
  await page.goto("/analyze");
  await page
    .getByRole("combobox", { name: "Analysis mode" })
    .selectOption("brief");
  await page
    .getByRole("checkbox", {
      name: "Enable local English + Bangla OCR",
      exact: false,
    })
    .check();
  await page
    .getByLabel("Original PDF")
    .setInputFiles(path.resolve("public/fixtures/scanned-fictional.pdf"));
  await expect(
    page.getByRole("textbox", { name: "Original text" }),
  ).toHaveValue(/November 10, 2026/, { timeout: 90000 });
  await expect(
    page.getByText("OCR-derived text.", { exact: false }).first(),
  ).toBeVisible();
  expect(external).toEqual([]);
  await page.getByRole("button", { name: "Create procurement brief" }).click();
  await expect(page).toHaveURL(/comparison/);
  await expect(
    page
      .getByText("OCR-derived text: page locations identify scanned pages;", {
        exact: false,
      })
      .first(),
  ).toBeVisible();
});
