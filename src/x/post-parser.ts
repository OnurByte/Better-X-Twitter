import type { ParsedPost } from "./types";

function hash(value: string): string { let h1 = 0x811c9dc5; for (let i = 0; i < value.length; i++) { h1 ^= value.charCodeAt(i); h1 = Math.imul(h1, 16777619); } return (h1 >>> 0).toString(16).padStart(8, "0").repeat(2); }

export function parsePost(element: HTMLElement): ParsedPost | null {
  const link = Array.from(element.querySelectorAll<HTMLAnchorElement>('a[href*="/status/"]')).find((a) => /\/status\/\d+/.test(a.href));
  const match = link?.href.match(/\/([^/]+)\/status\/(\d+)/);
  const text = (element.querySelector<HTMLElement>('[data-testid="tweetText"]')?.innerText ?? element.querySelector<HTMLElement>('[data-testid="tweetText"]')?.textContent ?? "").trim();
  if (!link && !text) return null;
  const authorLink = Array.from(element.querySelectorAll<HTMLAnchorElement>('a[href^="/"]')).find((a) => /^\/[^/]+$/.test(a.getAttribute("href") ?? ""));
  const handle = match?.[1] ?? authorLink?.getAttribute("href")?.slice(1);
  const type = element.querySelector('[data-testid="socialContext"]')?.textContent?.toLowerCase().includes("repost") ? "repost" : element.querySelector('[data-testid="quoteTweet"]') ? "quote" : "original";
  return { identity: { statusId: match?.[2], authorHandle: handle?.toLowerCase(), contentHash: hash(`${handle ?? ""}:${text}`), domRevision: Number(element.dataset.bxRevision ?? 0) }, statusId: match?.[2], url: link?.href, author: { handle, displayName: authorLink?.textContent?.trim() }, text, type, element };
}
