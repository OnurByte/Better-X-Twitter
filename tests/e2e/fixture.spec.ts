import { test, expect } from "@playwright/test";
import { chromium } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

test("serves the deterministic X fixture used by adapter tests", async ({ page }) => {
  await page.goto("/tests/fixtures/x.html");
  await expect(page.locator('article[data-testid="tweet"]')).toContainText("A deterministic X post");
});

test("loads the real content bundle as an unpacked Chrome extension", async () => {
  const extensionPath = path.resolve("dist");
  const fixture = fs.readFileSync(path.resolve("tests/fixtures/x.html"), "utf8");
  const context = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(), "better-x-e2e-")), {
    headless: true,
    executablePath: "/usr/bin/chromium",
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker");
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("https://x.com/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: fixture }));
    await page.goto("https://x.com/home");
    await expect(page.locator('article[data-testid="tweet"]')).toContainText("A deterministic X post");
    await expect(page.locator("[data-bx-quick-actions]")).toHaveCount(1);
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});

test("renders and saves the extension settings page", async () => {
  const extensionPath = path.resolve("dist");
  const context = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(), "better-x-settings-")), {
    headless: true,
    executablePath: "/usr/bin/chromium",
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker");
    const extensionId = new URL(worker.url()).host;
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`);
    await expect(page.locator("h1").first()).toContainText("Better X");
    await expect(page.locator(".feature-card")).toHaveCount(19);
    await expect(page.locator("#save")).toBeVisible();
    expect(await page.locator("body").evaluate((body) => getComputedStyle(body).backgroundColor)).toBe("rgb(8, 11, 16)");
    await page.locator("label.feature-card", { hasText: "Media saver" }).click();
    await page.locator("#save").click();
    await expect(page.locator("#saveStatus")).toContainText("Saved");
  } finally {
    await context.close();
  }
});
