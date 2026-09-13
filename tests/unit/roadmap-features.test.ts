import { describe, expect, it } from "vitest";
import { parseAIVerdict } from "../../src/features/ai-feed-filter/verdict";
import { replaceSelectionIfUnchanged } from "../../src/features/composer-tools/selection";
import { nextRediscover, type RediscoverState } from "../../src/features/rediscover/state";
import { chooseMedia } from "../../src/features/media-saver/resolver";
import { visibleForTimeline } from "../../src/features/timeline-filter/filter";
import { slopSignal } from "../../src/features/slop-indicator/heuristic";
import { searchLibrary } from "../../src/features/local-library/search";
import { storageKey } from "../../src/storage/database";

describe("roadmap feature boundaries", () => {
  it("derives stable IndexedDB keys from supported records", () => {
    expect(storageKey({ id: "post-1" })).toBe("post-1");
    expect(storageKey({ postId: "post-2" })).toBe("post-2");
    expect(storageKey({ handle: "alice" })).toBe("alice");
  });

  it("fails open for malformed AI verdicts", () => {
    expect(parseAIVerdict("not json")).toEqual({ action: "show", confidence: 0, reason: "invalid verdict" });
    expect(parseAIVerdict(JSON.stringify({ action: "hide", confidence: 0.9, reason: "bait" }))).toMatchObject({ action: "hide", confidence: 0.9 });
  });

  it("does not overwrite a changed selection", () => {
    const target = document.createElement("div");
    target.textContent = "new";
    expect(replaceSelectionIfUnchanged(target, "old", "replacement")).toBe(false);
    target.textContent = "old";
    expect(replaceSelectionIfUnchanged(target, "old", "replacement")).toBe(true);
    expect(target.textContent).toBe("replacement");
  });

  it("selects an unseen rediscovery entry and retires it after three views", () => {
    const states: RediscoverState[] = [{ postId: "a", showCount: 3 }, { postId: "b", showCount: 0 }];
    expect(nextRediscover(states)?.postId).toBe("b");
    expect(nextRediscover([{ postId: "a", showCount: 3 }])).toBeUndefined();
  });

  it("prefers original media and hides non-visible timeline types", () => {
    expect(chooseMedia({ rendered: "rendered.jpg", fxtwitter: "fx.jpg" })).toBe("rendered.jpg");
    expect(visibleForTimeline("reply", { originals: true, replies: false, quotes: true, reposts: true, promoted: true })).toBe(false);
  });

  it("reports a heuristic signal without claiming certainty", () => {
    expect(slopSignal("BUY NOW!!! LIKE AND RETWEET!!!")).toMatchObject({ label: "Slop heuristic" });
  });

  it("searches only encountered library records", () => {
    expect(searchLibrary([{ text: "Rust tips", handle: "alice", tags: ["dev"] }, { text: "Dinner", handle: "bob", tags: [] }], "rust")).toHaveLength(1);
  });
});
