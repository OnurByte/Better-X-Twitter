import { describe, expect, it } from "vitest";
import { parsePost } from "../../src/x/post-parser";

describe("parsePost", () => {
  it("extracts identity, author, text, url and type", () => {
    document.body.innerHTML = `<article data-testid="tweet">
      <a href="/alice/status/123456789">time</a>
      <a href="/alice">Alice</a>
      <div data-testid="tweetText">Hello Better X</div>
    </article>`;

    const post = parsePost(document.querySelector("article")!);

    expect(post).not.toBeNull();
    expect(post!).toMatchObject({ statusId: "123456789", author: { handle: "alice" }, text: "Hello Better X", type: "original" });
    expect(post!.identity.contentHash).toHaveLength(16);
  });
});
