import { describe, expect, it } from "vitest";
import { normalizeFxResponse } from "../../src/features/fx-revival/normalizer";

describe("FxTwitter normalization", () => {
  it("normalizes a v2 success response", () => {
    const result = normalizeFxResponse({ code: 200, status: { id: "123", url: "https://x.com/a/status/123", text: "hello", author: { screen_name: "alice", name: "Alice" } } });
    expect(result).toMatchObject({ kind: "success", post: { statusId: "123", author: { handle: "alice" } } });
  });

  it("keeps tombstones unavailable", () => {
    expect(normalizeFxResponse({ code: 200, status: { type: "tombstone", reason: "private", message: "Private" } })).toEqual({ kind: "unavailable", reason: "private", message: "Private" });
  });
});
