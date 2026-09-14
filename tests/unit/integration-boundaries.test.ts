import { describe, expect, it, vi } from "vitest";
import { resolveCountry } from "../../src/features/country-flags/resolver";
import { normalizeNote } from "../../src/features/notes/store";
import { insertReply } from "../../src/features/ai-reply/insert";
import { shouldApplyFocus } from "../../src/features/focus-mode/focus";
import { appendCountryBadge, renderCountryBadge } from "../../src/features/country-flags/ui";
import { copyShareLink } from "../../src/features/smart-share/share";
import { DomAdapter } from "../../src/x/dom-adapter";
import { injectQuickActions } from "../../src/features/quick-actions";
import { installXActionIcons, replaceXActionIcons } from "../../src/x/icon-replacer";
import { installOverflowMenu } from "../../src/features/overflow-menu";
import { applyAppearance } from "../../src/features/appearance";
import { installEmbeddedSettings } from "../../src/features/embedded-settings";

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

  it("renders public country metadata as an inline emoji without a card", () => {
    const badge = renderCountryBadge({ handle: "alice", countryCode: "TR", countryName: "Türkiye", source: "x-about-account", confidence: "high", fetchedAt: 1 });
    expect(badge.textContent).toBe("🇹🇷");
    expect(badge.classList.contains("bx-country-flag")).toBe(true);
    expect(badge.classList.contains("bx-country-badge")).toBe(false);
    expect(badge.querySelector("svg")).toBeNull();
    expect(badge.getAttribute("title")).toContain("X account region");
  });

  it("keeps duplicate country badges to one per post", () => {
    const host = document.createElement("article");
    host.innerHTML = '<span data-bx-quick-actions><button></button><button></button><button></button></span>';
    const country = { handle: "alice", countryCode: "TR", countryName: "Türkiye", source: "x-about-account" as const, confidence: "high" as const, fetchedAt: 1 };
    appendCountryBadge(host, country);
    appendCountryBadge(host, country);
    expect(host.querySelectorAll("[data-bx-quick-actions] > .bx-country-flag")).toHaveLength(1);
  });

  it("renders quick actions with Heroicons instead of emoji", () => {
    const element = document.createElement("article");
    const post = { element, author: { handle: "alice" } } as Parameters<typeof injectQuickActions>[0];
    injectQuickActions(post, {} as Parameters<typeof injectQuickActions>[1], { block: true, notInterested: true, mute: true }, () => {});
    expect(element.querySelectorAll("[data-bx-quick-actions] button svg")).toHaveLength(3);
    expect(element.textContent).not.toMatch(/[⛔🔇✕]/);
  });

  it("uses X confirmation without opening a Better X confirm dialog", async () => {
    const element = document.createElement("article");
    const post = { element, author: { handle: "alice" } } as Parameters<typeof injectQuickActions>[0];
    const choose = vi.fn().mockResolvedValue(true);
    const openPostMenu = vi.fn().mockResolvedValue({ choose });
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    injectQuickActions(post, { openPostMenu } as never, { block: true, notInterested: false, mute: false }, () => {});

    element.querySelector<HTMLButtonElement>('button[aria-label="Block"]')?.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(confirm).not.toHaveBeenCalled();
    expect(openPostMenu).toHaveBeenCalledOnce();
    expect(choose).toHaveBeenCalledWith("block");
    confirm.mockRestore();
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

  it("restores a Heroicon when X mutates the replaced SVG in place", () => {
    document.body.innerHTML = '<button data-testid="like" aria-label="Like"><svg><path /></svg></button>';
    replaceXActionIcons();
    const icon = document.querySelector<SVGSVGElement>("svg.bx-x-icon")!;
    icon.innerHTML = '<path d="old-x-icon" />';

    replaceXActionIcons();

    expect(document.querySelector("svg.bx-x-icon path")?.getAttribute("d")).toContain("M21 8.25");
  });

  it("restores a Heroicon after X recreates a clicked action", async () => {
    document.body.innerHTML = '<div id="actions"><button data-testid="like" aria-label="Like"><svg><path d="native-heart" /></svg></button></div>';
    const stop = installXActionIcons();
    document.querySelector<HTMLButtonElement>('[data-testid="like"]')?.click();
    document.querySelector("#actions")!.innerHTML = '<button data-testid="unlike" aria-label="Unlike"><svg><path d="native-liked" /></svg></button>';

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.querySelector('button[data-testid="unlike"] svg.bx-x-icon path')?.getAttribute("d")).toContain("M21 8.25");
    stop();
  });

  it("removes a native action SVG that X appends after an interaction", () => {
    document.body.innerHTML = '<button data-testid="like" aria-label="Like"><svg><path /></svg></button>';
    replaceXActionIcons();
    document.querySelector("button")!.insertAdjacentHTML("beforeend", '<svg class="native-action"><path d="old-x-heart" /></svg>');

    replaceXActionIcons();

    expect(document.querySelectorAll('button[data-testid="like"] svg.bx-x-icon')).toHaveLength(1);
    expect(document.querySelector('button[data-testid="like"] svg.native-action')).toBeNull();
  });

  it("replaces X navigation SVGs with Heroicons", () => {
    document.body.innerHTML = `<nav><a href="/home" aria-label="Home"><svg style="width:28px;height:28px;color:rgb(231, 233, 234)"><path /></svg></a><a href="/explore" aria-label="Explore"><svg><path /></svg></a><a href="/premium" aria-label="Premium"><svg><path /></svg></a><a href="/jobs" aria-label="Jobs"><svg><path /></svg></a><a href="/verified-orgs" aria-label="Verified Orgs"><svg><path /></svg></a></nav>`;

    replaceXActionIcons();

    expect(document.querySelectorAll("nav svg.bx-x-icon")).toHaveLength(5);
    expect(document.querySelector('a[aria-label="Explore"] svg path')?.getAttribute("d")).toContain("m21 21");
    expect(document.querySelector<SVGSVGElement>('a[aria-label="Home"] svg')?.style.width).toBe("28px");
    expect(document.querySelector<SVGSVGElement>('a[aria-label="Home"] svg')?.style.color).toBe("rgb(231, 233, 234)");
  });

  it("rejects browser fallback icon size and visited-link color", () => {
    document.body.style.backgroundColor = "rgb(0, 0, 0)";
    document.body.innerHTML = `<nav><a aria-label="Notifications"><svg style="width:300px;height:150px;color:rgb(85, 26, 139)"><path /></svg></a></nav>`;

    replaceXActionIcons();

    const icon = document.querySelector<SVGSVGElement>("nav svg.bx-x-icon")!;
    expect(icon.style.width).not.toBe("300px");
    expect(icon.style.height).not.toBe("150px");
    expect(icon.style.color).toBe("rgb(231, 233, 234)");

    document.body.style.backgroundColor = "rgb(255, 255, 255)";
    document.body.innerHTML = `<nav><a aria-label="Notifications"><svg style="color:rgb(85, 26, 139)"><path /></svg></a></nav>`;
    replaceXActionIcons();
    expect(document.querySelector<SVGSVGElement>("nav svg.bx-x-icon")?.style.color).toBe("rgb(15, 20, 25)");
  });

  it("returns only the explicitly selected share URL", () => {
    expect(copyShareLink("https://x.com/a/status/1", "fxtwitter")).toBe("https://fxtwitter.com/a/status/1");
  });

  it("reuses X menu styling for FxTwitter copy and media download", async () => {
    document.body.innerHTML = `<article><a href="https://x.com/alice/status/123">time</a><a href="/alice">Alice</a><div data-testid="tweetText">post</div><div data-testid="tweetPhoto"><img src="https://pbs.twimg.com/media/test.jpg"></div><button data-testid="caret">More</button></article><div role="menu"><div role="menuitem" class="native-row"><svg></svg><span>Copy link</span></div></div>`;
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const request = vi.fn().mockResolvedValue({ ok: true });
    const stop = installOverflowMenu({ x: new DomAdapter(), runtime: { request }, ui: { toast: () => {} } } as never, { share: true, media: true });

    document.querySelector<HTMLButtonElement>('[data-testid="caret"]')?.click();
    await new Promise((resolve) => setTimeout(resolve, 5));

    const copy = document.querySelector<HTMLElement>('[data-bx-menu-item="Copy FxTwitter embed"]')!;
    const download = document.querySelector<HTMLElement>('[data-bx-menu-item="Download media"]')!;
    expect(copy.classList.contains("native-row")).toBe(true);
    expect(download.classList.contains("native-row")).toBe(true);
    expect(document.querySelectorAll('[data-bx-menu-item="Download media"]')).toHaveLength(1);
    copy.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(writeText).toHaveBeenCalledWith("https://fxtwitter.com/alice/status/123");
    download.click();
    expect(request).toHaveBeenCalledWith({ type: "media.download", media: { url: "https://pbs.twimg.com/media/test.jpg", filename: "better-x-123" } });
    stop();
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

  it("keeps the native logo geometry when applying the selected brand icon", () => {
    document.body.innerHTML = '<header><a href="/home" aria-label="X"><svg class="r-4qtqp9 r-yyyyoo" width="32" height="32" style="transform:translateX(3px)"><path d="native-x" /></svg></a></header>';

    applyAppearance({ accentColor: "#7856FF", liquidGlass: true, brandIcon: "bird" });

    expect(document.documentElement.style.getPropertyValue("--bx-accent")).toBe("#7856FF");
    expect(document.documentElement.classList.contains("bx-liquid-glass")).toBe(true);
    const bird = document.querySelector<SVGSVGElement>('a[aria-label="X"] svg')!;
    expect(bird.getAttribute("data-bx-brand-icon")).toBe("bird");
    expect(bird.className.baseVal).toBe("r-4qtqp9 r-yyyyoo");
    expect(bird.getAttribute("width")).toBe("32");
    expect(bird.getAttribute("height")).toBe("32");
    expect(bird.style.transform).toBe("translateX(3px)");
    expect(bird.querySelector("path")?.getAttribute("d")).not.toBe("native-x");

    applyAppearance({ accentColor: "#1D9BF0", liquidGlass: false, brandIcon: "x" });
    expect(document.documentElement.classList.contains("bx-liquid-glass")).toBe(false);
    expect(document.querySelector('a[aria-label="X"] svg')?.getAttribute("data-bx-brand-icon")).toBe("x");
  });

  it("adds Better X to native settings and mounts an extension-origin frame", () => {
    vi.stubGlobal("chrome", { runtime: { getURL: (path: string) => `chrome-extension://better-x/${path}` } });
    history.replaceState({}, "", "/settings");
    document.body.innerHTML = '<main data-testid="primaryColumn"><a role="link" class="native-setting" href="/settings/privacy"><span>Privacy and safety</span></a></main>';
    const context = { settings: { get: async () => ({ appearance: { accentColor: "#1D9BF0", liquidGlass: true, brandIcon: "bird" } }) } } as never;
    const stop = installEmbeddedSettings(context);

    const entry = document.querySelector<HTMLAnchorElement>('[data-bx-settings-entry="true"]')!;
    expect(entry.classList.contains("native-setting")).toBe(true);
    expect(entry.getAttribute("href")).toBe("/settings/better-x");
    entry.click();

    expect(location.pathname).toBe("/settings/better-x");
    expect(document.querySelector<HTMLIFrameElement>('[data-bx-settings-frame="true"]')?.src).toBe("chrome-extension://better-x/options.html?embedded=1");
    stop();
    vi.unstubAllGlobals();
  });
});
