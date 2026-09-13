import { describe, expect, it } from "vitest";
import { hideSidebar, installSidebarCleanup } from "../../src/features/sidebar-cleanup";

describe("sidebar cleanup", () => {
  it("hides X's entire sidebar", () => {
    document.body.innerHTML = `<div data-testid="sidebarColumn"><section>Subscribe to Premium</section><section>Today's News</section><section>Trending now</section><section>Who to follow</section><footer>Terms · Privacy · Cookies</footer></div>`;
    const sidebar = document.querySelector<HTMLElement>('[data-testid="sidebarColumn"]')!;

    hideSidebar(sidebar);

    expect(sidebar.hidden).toBe(true);
    expect(sidebar.dataset.bxSidebarHidden).toBe("true");
    expect(sidebar.getAttribute("aria-hidden")).toBe("true");
  });

  it("hides bloat blocks embedded outside the sidebar root", () => {
    document.body.innerHTML = `<main><section><h2>Who to follow</h2><p>Suggested accounts</p></section><section><h2>Trending now</h2><p>Trending topic</p></section><footer>Terms · Privacy</footer></main>`;
    const stop = installSidebarCleanup();

    expect(document.querySelector<HTMLElement>("section")?.hidden).toBe(true);
    expect(document.querySelectorAll<HTMLElement>("section")[1].hidden).toBe(true);
    expect(document.querySelector<HTMLElement>("footer")?.hidden).toBe(true);
    stop();
  });

  it("hides a semantic aside even without X's sidebar test id", () => {
    document.body.innerHTML = `<aside><h2>Today's News</h2><p>Trending now</p></aside><main>Search</main>`;
    const stop = installSidebarCleanup();

    expect(document.querySelector<HTMLElement>("aside")?.hidden).toBe(true);
    expect(document.querySelector("main")?.textContent).toBe("Search");
    stop();
  });
});
