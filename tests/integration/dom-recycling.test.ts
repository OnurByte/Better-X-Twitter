import { describe, expect, it } from "vitest";
import { DomAdapter } from "../../src/x/dom-adapter";

describe("DOM recycling", () => {
  it("increments revision when one article becomes another post", () => {
    document.body.innerHTML = `<article data-testid="tweet"><a href="/alice/status/123456789">time</a><a href="/alice">Alice</a><div data-testid="tweetText">A</div></article>`;
    const adapter = new DomAdapter();
    const article = document.querySelector("article")!;
    const first = adapter.parsePost(article)!;
    article.innerHTML = `<a href="/bob/status/987654321">time</a><a href="/bob">Bob</a><div data-testid="tweetText">B</div>`;
    const second = adapter.parsePost(article)!;
    expect(second.statusId).toBe("987654321");
    expect(second.identity.domRevision).toBeGreaterThan(first.identity.domRevision);
  });
});
