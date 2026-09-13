import type { ParsedPost } from "../../x/types";
export function isBookmarkRoute(url = location.pathname): boolean { return /\/i\/bookmarks/.test(url); }
export function bookmarkRecord(post: ParsedPost): Record<string, unknown> { return { id: post.statusId ?? post.identity.contentHash, statusId: post.statusId, handle: post.author.handle, text: post.text, url: post.url, capturedAt: Date.now() }; }
