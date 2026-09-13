import { describe, expect, it } from "vitest";
import { replaceSidebar } from "../../src/features/sidebar-cleanup";

describe("sidebar cleanup", () => {
  it("replaces X's promotional sidebar with Better X shortcuts", () => {
    document.body.innerHTML = `<div data-testid="sidebarColumn"><section>Subscribe to Premium</section><section>Today's News</section><section>Trending now</section><section>Who to follow</section><footer>Terms · Privacy · Cookies</footer></div>`;
    const sidebar = document.querySelector<HTMLElement>('[data-testid="sidebarColumn"]')!;

    replaceSidebar(sidebar, "chrome-extension://better-x/options.html");

    expect(sidebar.textContent).not.toContain("Subscribe to Premium");
    expect(sidebar.textContent).not.toContain("Today's News");
    expect(sidebar.querySelector("[data-bx-sidebar]")).toBeTruthy();
    expect(sidebar.querySelector<HTMLAnchorElement>('a[href="/home?f=following"]')?.textContent).toBe("Following");
    expect(sidebar.querySelector<HTMLAnchorElement>('a[href="chrome-extension://better-x/options.html"]')?.textContent).toBe("Settings ↗");
  });
});
