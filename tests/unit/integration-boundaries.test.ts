import { describe, expect, it } from "vitest";
import { resolveCountry } from "../../src/features/country-flags/resolver";
import { normalizeNote } from "../../src/features/notes/store";
import { insertReply } from "../../src/features/ai-reply/insert";
import { shouldApplyFocus } from "../../src/features/focus-mode/focus";
import { appendCountryBadge, renderCountryBadge } from "../../src/features/country-flags/ui";
import { copyShareLink } from "../../src/features/smart-share/share";
import { DomAdapter } from "../../src/x/dom-adapter";
import { injectQuickActions } from "../../src/features/quick-actions";
import { replaceXActionIcons } from "../../src/x/icon-replacer";

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
    expect(badge.textContent).toBe("");
    expect(badge.querySelector("svg.bx-country-flag")).not.toBeNull();
    expect(badge.querySelector("rect")?.getAttribute("fill")).toBe("#e30a17");
    expect(badge.getAttribute("title")).toContain("X account region");
  });

  it("keeps duplicate country badges to one per post", () => {
    const host = document.createElement("article");
    host.innerHTML = '<span data-bx-quick-actions><button></button><button></button><button></button></span>';
    const country = { handle: "alice", countryCode: "TR", countryName: "Türkiye", source: "x-about-account" as const, confidence: "high" as const, fetchedAt: 1 };
    appendCountryBadge(host, country);
    appendCountryBadge(host, country);
    expect(host.querySelectorAll("[data-bx-quick-actions] > .bx-country-badge")).toHaveLength(1);
  });

  it("renders quick actions with Heroicons instead of emoji", () => {
    const element = document.createElement("article");
    const post = { element, author: { handle: "alice" } } as Parameters<typeof injectQuickActions>[0];
    injectQuickActions(post, {} as Parameters<typeof injectQuickActions>[1], { block: true, notInterested: true, mute: true }, () => {});
    expect(element.querySelectorAll("[data-bx-quick-actions] button svg")).toHaveLength(3);
    expect(element.textContent).not.toMatch(/[⛔🔇✕]/);
  });

  it("replaces X post action SVGs with Heroicons", () => {
    const buttons = [["reply", "Reply"], ["retweet", "Repost"], ["like", "Like"], ["bookmark", "Bookmark"], ["share", "Share post"], ["caret", "More"]].map(([testid, label]) => {
      const button = document.createElement("button");
      button.dataset.testid = testid;
      button.setAttribute("aria-label", label);
      button.innerHTML = "<svg><path /></svg>";
      document.body.append(button);
      return button;
    });
    replaceXActionIcons();
    expect(buttons.every((button) => button.querySelector("svg.bx-x-icon"))).toBe(true);
    expect(buttons[2].querySelector("svg path")?.getAttribute("d")).toContain("M21 8.25");
  });

  it("replaces X navigation SVGs with Heroicons", () => {
    document.body.innerHTML = `<nav><a href="/home" aria-label="Home"><svg><path /></svg></a><a href="/explore" aria-label="Explore"><svg><path /></svg></a></nav>`;

    replaceXActionIcons();

    expect(document.querySelectorAll("nav svg.bx-x-icon")).toHaveLength(2);
    expect(document.querySelector('a[aria-label="Explore"] svg path')?.getAttribute("d")).toContain("m21 21");
  });

  it("returns only the explicitly selected share URL", () => {
    expect(copyShareLink("https://x.com/a/status/1", "fxtwitter")).toBe("https://fxtwitter.com/a/status/1");
  });

  it("opens the overflow menu belonging to the selected post", async () => {
    document.body.innerHTML = `<article data-testid="tweet"><a href="/alice/status/1">time</a><a href="/alice">Alice</a><div data-testid="tweetText">first</div><button data-testid="caret"></button></article><article data-testid="tweet"><a href="/bob/status/2">time</a><a href="/bob">Bob</a><div data-testid="tweetText">second</div><button data-testid="caret"></button></article>`;
    const posts = Array.from(document.querySelectorAll<HTMLElement>("article"));
    const adapter = new DomAdapter();
    const target = adapter.parsePost(posts[1]);
    expect(target).not.toBeNull();
    let firstClicks = 0;
    let secondClicks = 0;
    posts[0].querySelector("[data-testid=caret]")!.addEventListener("click", () => { firstClicks++; });
    posts[1].querySelector("[data-testid=caret]")!.addEventListener("click", () => { secondClicks++; document.body.insertAdjacentHTML("beforeend", '<div role="menu"><div role="menuitem">Block @bob</div></div>'); });
    const menu = await adapter.openPostMenu(target!);
    expect(firstClicks).toBe(0);
    expect(secondClicks).toBe(1);
    expect(await menu.choose("block")).toBe(true);
  });
});
