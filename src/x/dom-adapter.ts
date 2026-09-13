import type { XDomAdapter, XMenuHandle } from "../core/plugin";
import { parsePost } from "./post-parser";
import type { ParsedPost } from "./types";

export class DomAdapter implements XDomAdapter {
  private revision = 0;
  private signatures = new WeakMap<HTMLElement, string>();
  parsePost(article: HTMLElement): ParsedPost | null {
    const candidate = parsePost(article);
    if (!candidate) return null;
    const signature = `${candidate.statusId ?? ""}:${candidate.identity.authorHandle ?? ""}:${candidate.identity.contentHash}`;
    if (this.signatures.get(article) !== signature) { this.signatures.set(article, signature); article.dataset.bxRevision = String(++this.revision); }
    return parsePost(article);
  }
  observePosts(cb: (post: ParsedPost) => void): () => void {
    const scan = (root: ParentNode) => Array.from(root.querySelectorAll<HTMLElement>('article[data-testid="tweet"], article')).forEach((article) => { const post = this.parsePost(article); if (post) cb(post); });
    scan(document);
    const observer = new MutationObserver((records) => requestAnimationFrame(() => records.forEach((record) => Array.from(record.addedNodes).forEach((node) => { if (node instanceof HTMLElement) scan(node); }))));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }
  findComposer(): HTMLElement | null { return document.querySelector<HTMLElement>('[data-testid="tweetTextarea_0"], [contenteditable="true"]'); }
  async openPostMenu(_post: ParsedPost): Promise<XMenuHandle> { const button = document.querySelector<HTMLElement>('[aria-label*="More"], [data-testid="caret"]'); button?.click(); return { choose: async (label) => { const item = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]')).find((el) => el.textContent?.toLowerCase().includes(label.toLowerCase())); if (!item) return false; item.click(); return true; } }; }
}
