import { chromium, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
mkdirSync("artifacts", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
await page.goto("http://127.0.0.1:3000/analyze");
await expect(
  page.getByRole("button", { name: "Analyze changes", exact: true }),
).toBeEnabled();
await page.screenshot({
  path: "artifacts/analyzer-desktop.png",
  fullPage: true,
  caret: "initial",
});
await page.getByRole("button", { name: "Load demo documents" }).click();
await page
  .getByRole("button", { name: "Analyze changes", exact: true })
  .click();
await page.waitForURL("**/comparison");
await page.getByText("Inspect source evidence").first().click();
await page.screenshot({
  path: "artifacts/report-desktop.png",
  fullPage: true,
  caret: "initial",
});
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:3000/analyze");
await expect(
  page.getByRole("button", { name: "Analyze changes", exact: true }),
).toBeEnabled();
await page.screenshot({
  path: "artifacts/analyzer-mobile.png",
  fullPage: true,
  caret: "initial",
});
console.log(JSON.stringify({ pageAndConsoleErrors: errors }));
await browser.close();
if (errors.length) process.exitCode = 1;
