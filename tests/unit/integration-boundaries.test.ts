import { describe, expect, it } from "vitest";
import { resolveCountry } from "../../src/features/country-flags/resolver";
import { normalizeNote } from "../../src/features/notes/store";
import { insertReply } from "../../src/features/ai-reply/insert";
import { shouldApplyFocus } from "../../src/features/focus-mode/focus";
import { renderCountryBadge } from "../../src/features/country-flags/ui";
import { copyShareLink } from "../../src/features/smart-share/share";

describe("integration boundaries", () => {
  it("prefers public X account region over profile location", () => {
    expect(resolveCountry({ about_account: { based_in: "Türkiye" }, location: "Berlin, Germany" }, "alice")).toMatchObject({ countryCode: "TR", source: "x-about-account", confidence: "high" });
  });

  it("normalizes private notes without changing their content", () => {
    expect(normalizeNote({ handle: "@Alice", note: "good dev", tags: ["friend"] })).toMatchObject({ handle: "alice", note: "good dev", tags: ["friend"] });
  });

  it("inserts AI text only into the current composer", () => {
    const composer = document.createElement("div"); composer.contentEditable = "true"; composer.textContent = "draft";
    expect(insertReply(composer, "draft", "better draft")).toBe(true);
    expect(composer.textContent).toBe("better draft");
  });

  it("keeps focus filters explicit and independent", () => {
    expect(shouldApplyFocus({ isBookmark: false, isFollowing: true }, { bookmarksOnly: true, followingOnly: false })).toBe(false);
    expect(shouldApplyFocus({ isBookmark: true, isFollowing: true }, { bookmarksOnly: false, followingOnly: true })).toBe(true);
  });

  it("renders public country metadata without claiming location", () => {
    const badge = renderCountryBadge({ handle: "alice", countryCode: "TR", countryName: "Türkiye", source: "x-about-account", confidence: "high", fetchedAt: 1 });
    expect(badge.textContent).toContain("🇹🇷");
    expect(badge.getAttribute("title")).toContain("X account region");
  });

  it("returns only the explicitly selected share URL", () => {
    expect(copyShareLink("https://x.com/a/status/1", "fxtwitter")).toBe("https://fxtwitter.com/a/status/1");
  });
});
