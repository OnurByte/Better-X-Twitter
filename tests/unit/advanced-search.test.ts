import { describe, expect, it } from "vitest";
import { buildAdvancedSearchQuery, renderAdvancedSearch, replaceExploreWithSearch, type AdvancedSearchValues } from "../../src/features/advanced-search";

describe("advanced search", () => {
  it("translates the form fields into native X operators", () => {
    const values: AdvancedSearchValues = {
      allWords: "nasa esa",
      exactPhrase: "state of the art",
      anyWords: "puppy kitten",
      noneWords: "spam",
      from: "NASA",
      to: "alice",
      mentioning: "bob",
      hashtags: "space",
      language: "en",
      since: "2025-01-01",
      until: "2025-02-01",
      minReplies: "2",
      minLikes: "10",
      minReposts: "3",
      media: "images",
      verified: true,
      following: true,
      replies: false,
      retweets: false
    };

    expect(buildAdvancedSearchQuery(values)).toBe('nasa esa "state of the art" (puppy OR kitten) -spam from:NASA to:alice @bob #space lang:en filter:images filter:verified filter:follows min_replies:2 min_faves:10 min_retweets:3 since:2025-01-01 until:2025-02-01');
  });

  it("turns the Explore navigation item into Search", () => {
    document.body.innerHTML = '<nav><a data-testid="AppTabBar_Explore_Link" href="/explore"><span>Explore</span></a></nav>';
    const link = document.querySelector<HTMLAnchorElement>("a")!;

    replaceExploreWithSearch();

    expect(link.getAttribute("href")).toBe("/search");
    expect(link.getAttribute("aria-label")).toBe("Search");
    expect(link.textContent).toBe("Search");
  });

  it("offers a detailed English example with a searchable topic", () => {
    const root = document.createElement("main");
    document.body.append(root);

    renderAdvancedSearch(root);

    expect(root.querySelector(".bx-search-main svg.bx-icon")).not.toBeNull();
    expect(root.querySelector(".bx-search-main")?.textContent).not.toContain("⌕");

    const example = root.querySelector<HTMLButtonElement>("[data-bx-search-example]")!;
    example.click();
    expect(example.textContent).toContain("15 July 2016");
    expect(root.querySelector<HTMLInputElement>('input[name="allWords"]')?.value).toContain('"15 Temmuz" OR darbe OR coup');
    expect(root.querySelector<HTMLOutputElement>("[data-bx-search-query]")?.textContent).toContain("since:2016-07-15_15:00:00_UTC");
  });
});
