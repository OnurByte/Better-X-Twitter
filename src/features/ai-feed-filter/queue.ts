import { parseAIVerdict, type AIFeedVerdict } from "./verdict";
export class AIVerdictQueue {
  private pending: Array<{ id: string; text: string }> = [];
  constructor(private readonly generate: (posts: Array<{ id: string; text: string }>) => Promise<Record<string, string>>) {}
  add(post: { id: string; text: string }): void { if (!this.pending.some((item) => item.id === post.id)) this.pending.push(post); }
  async flush(): Promise<Record<string, AIFeedVerdict>> { const batch = this.pending.splice(0, 10); if (!batch.length) return {}; try { const raw = await this.generate(batch); return Object.fromEntries(batch.map((post) => [post.id, parseAIVerdict(raw[post.id] ?? "")])) as Record<string, AIFeedVerdict>; } catch { return Object.fromEntries(batch.map((post) => [post.id, { action: "show", confidence: 0, reason: "provider unavailable" }])) as Record<string, AIFeedVerdict>; } }
}
