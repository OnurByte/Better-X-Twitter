import { describe, expect, it } from "vitest";
import { buildReplyPrompt } from "../../src/features/ai-reply/prompt-builder";

describe("reply prompt", () => {
  it("includes only the configured context and never submits", () => {
    const prompt = buildReplyPrompt({ text: "Original", authorHandle: "alice", draft: "My idea", style: "natural", includePrivateNote: false, privateNote: "secret" });
    expect(prompt).toContain("Original");
    expect(prompt).toContain("My idea");
    expect(prompt).not.toContain("secret");
    expect(prompt).toContain("Do not submit");
  });
});
