import { describe, expect, it } from "vitest";
import { buildAdvancedSearchQuery, replaceExploreWithSearch, type AdvancedSearchValues } from "../../src/features/advanced-search";

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
});
