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
    await expect(page.locator('[data-testid="sidebarColumn"]')).toBeHidden();
    await expect(page.locator('[role="complementary"]')).toBeHidden();
    await expect(page.locator('main section:has-text("Who to follow")')).toBeHidden();
    await expect(page.locator('main section:has-text("Trending now")')).toBeHidden();
    await expect(page.locator("main footer")).toBeHidden();
    await expect(page.locator('a[data-testid="AppTabBar_Search_Link"]')).toHaveAttribute("href", "/search");
    await expect(page.locator('a[data-testid="AppTabBar_Search_Link"] svg.bx-x-icon')).toHaveCount(1);
    await expect(page.locator('a[href="/i/grok"]')).toBeHidden();
    await expect(page.locator('a[href="/i/lists"]')).toBeHidden();
    await expect(page.locator('a[href="/i/premium_sign_up"]')).toBeHidden();
    await expect(page.locator('a[href^="https://ads."]')).toBeHidden();
    await expect(page.locator('button[aria-label="More"]')).toBeHidden();
    await expect(page.locator('[data-bx-nav-entry="communities"]')).toHaveCount(1);
    await expect(page.locator('[data-bx-nav-entry="settings"]')).toHaveCount(1);
    await expect(page.locator('a[aria-label="X"] svg')).toHaveAttribute("data-bx-brand-icon", "bird");
    await expect(page.locator("body")).toHaveCSS("font-family", /Helvetica Neue/);
    await expect(page.locator("[data-bx-quick-actions]")).toHaveCount(1);
    await page.evaluate(() => {
      const button = document.createElement("button");
      button.dataset.testid = "like";
      button.setAttribute("aria-label", "Like");
      button.innerHTML = "<svg><path /></svg>";
      document.body.append(button);
    });
    await expect(page.locator('button[data-testid="like"] svg.bx-x-icon')).toHaveCount(1);
    await page.locator('button[data-testid="like"] svg.bx-x-icon path').evaluate((path) => path.setAttribute("d", "native-again"));
    await expect(page.locator('button[data-testid="like"] svg.bx-x-icon path')).not.toHaveAttribute("d", "native-again");
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});

test("embeds extension settings inside X settings", async () => {
  const extensionPath = path.resolve("dist");
  const fixture = fs.readFileSync(path.resolve("tests/fixtures/x.html"), "utf8");
  const context = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(), "better-x-embedded-settings-")), {
    headless: true,
    executablePath: "/usr/bin/chromium",
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker");
    const page = await context.newPage();
    await page.route("https://x.com/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: fixture }));
    await page.goto("https://x.com/settings");
    const entry = page.locator('[data-bx-settings-entry="true"]');
    await expect(entry).toBeVisible();
    await entry.click();
    await expect(page).toHaveURL("https://x.com/settings/better-x");
    const frame = page.frameLocator('[data-bx-settings-frame="true"]');
    await expect(frame.locator("h1")).toHaveCount(0);
    await expect(frame.locator("h2").first()).toHaveText("Appearance");
    await expect(frame.locator("#apiKey")).toBeVisible();
    await frame.locator('[data-accent="#7856FF"]').click();
    await expect.poll(() => page.locator("html").evaluate((html) => getComputedStyle(html).getPropertyValue("--bx-accent").trim())).toBe("#7856FF");
  } finally {
    await context.close();
  }
});

test("opens the advanced search form and navigates with native X syntax", async () => {
  const extensionPath = path.resolve("dist");
  const fixture = fs.readFileSync(path.resolve("tests/fixtures/x.html"), "utf8");
  const context = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(), "better-x-search-e2e-")), {
    headless: true,
    executablePath: "/usr/bin/chromium",
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker");
    const page = await context.newPage();
    await page.route("https://x.com/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: fixture }));
    await page.goto("https://x.com/explore");
    await expect(page).toHaveURL(/https:\/\/x\.com\/search$/);
    await expect(page.locator("[data-bx-advanced-search]")).toBeVisible();
    await page.goto("https://x.com/home");
    await page.locator('a[data-testid="AppTabBar_Search_Link"]').click();
    await expect(page.locator("[data-bx-advanced-search]")).toBeVisible();
    await expect(page.locator(".bx-search-examples button")).toHaveCount(4);
    await page.locator('input[name="allWords"]').fill("nasa esa");
    await page.locator(".bx-search-advanced summary").click();
    await page.locator('input[name="from"]').fill("@NASA");
    await page.locator('select[name="media"]').selectOption("images");
    await page.locator(".bx-search-submit").click();
    await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBe("nasa esa from:NASA filter:images");
  } finally {
    await context.close();
  }
});

test("renders and auto-saves the X-native embedded settings page", async () => {
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
    await page.goto(`chrome-extension://${extensionId}/options.html?embedded=1`);
    await expect(page.locator("h1")).toHaveCount(0);
    await expect(page.locator("h2").first()).toHaveText("Appearance");
    await expect(page.locator("body")).toHaveClass(/embedded/);
    await expect(page.locator("body")).not.toHaveClass(/liquid-glass/);
    await expect(page.locator(".hero")).toHaveCount(0);
    await expect(page.locator(".feature-row")).toHaveCount(22);
    await expect(page.locator("#accentColor")).toHaveValue("#1d9bf0");
    await expect(page.locator("#liquidGlass")).toBeChecked();
    await expect(page.locator("#brandIcon")).toHaveValue("bird");
    await page.locator('[data-accent="#7856FF"]').click();
    await expect(page.locator("#accentColor")).toHaveValue("#7856ff");
    await page.locator("label.feature-row", { hasText: "Media saver" }).click();
    await expect(page.locator("#saveStatus")).toContainText("Saved");
  } finally {
    await context.close();
  }
});
