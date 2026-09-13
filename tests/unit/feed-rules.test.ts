import { describe, expect, it } from "vitest";
import { evaluateRules, type FeedRule } from "../../src/features/feed-rules/rules";

const post = { text: "Win this giveaway", author: { handle: "alice" }, type: "original" } as never;

describe("feed rules", () => {
  it("prefers explicit show over hide", () => {
    const rules: FeedRule[] = [
      { id: "hide", kind: "keyword", value: "giveaway", action: "hide" },
      { id: "show", kind: "user", value: "alice", action: "show" }
    ];
    expect(evaluateRules(post, rules)).toMatchObject({ action: "show", ruleId: "show" });
  });

  it("matches domains and post types", () => {
    const domainPost = { text: "https://example.com/a", author: { handle: "alice" }, type: "original" } as never;
    expect(evaluateRules(domainPost, [{ id: "d", kind: "domain", value: "example.com", action: "reduce" }])).toMatchObject({ action: "reduce" });
    expect(evaluateRules(post, [{ id: "t", kind: "post-type", value: "original", action: "hide" }])).toMatchObject({ action: "hide" });
  });
});
