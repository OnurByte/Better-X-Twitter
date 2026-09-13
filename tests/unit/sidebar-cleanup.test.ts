import { describe, expect, it } from "vitest";
import { hideSidebar } from "../../src/features/sidebar-cleanup";

describe("sidebar cleanup", () => {
  it("hides X's entire sidebar", () => {
    document.body.innerHTML = `<div data-testid="sidebarColumn"><section>Subscribe to Premium</section><section>Today's News</section><section>Trending now</section><section>Who to follow</section><footer>Terms · Privacy · Cookies</footer></div>`;
    const sidebar = document.querySelector<HTMLElement>('[data-testid="sidebarColumn"]')!;

    hideSidebar(sidebar);

    expect(sidebar.hidden).toBe(true);
    expect(sidebar.dataset.bxSidebarHidden).toBe("true");
    expect(sidebar.getAttribute("aria-hidden")).toBe("true");
  });
});
