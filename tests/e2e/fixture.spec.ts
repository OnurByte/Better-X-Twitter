import { test, expect } from "@playwright/test";

test("serves the deterministic X fixture used by adapter tests", async ({ page }) => {
  await page.goto("/tests/fixtures/x.html");
  await expect(page.locator('article[data-testid="tweet"]')).toContainText("A deterministic X post");
});
