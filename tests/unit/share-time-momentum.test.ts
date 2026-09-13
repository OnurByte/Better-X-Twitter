import { describe, expect, it } from "vitest";
import { buildSearchUrl, shareUrl } from "../../src/features/utilities/urls";
import { momentum } from "../../src/features/utilities/momentum";

describe("utility features", () => {
  it("builds native X search and explicit share links", () => {
    expect(buildSearchUrl("alice", "2025-01-01", "2025-02-01")).toContain("from%3Aalice");
    expect(shareUrl("https://x.com/alice/status/123", "fxtwitter")).toBe("https://fxtwitter.com/alice/status/123");
  });

  it("calculates a bounded momentum rate", () => {
    expect(momentum({ likes: 60, reposts: 20, replies: 10 }, 2)).toBe(50);
  });
});
