export interface AIFeedVerdict { action: "show" | "hide" | "reduce"; confidence: number; reason: string }
export function parseAIVerdict(raw: string): AIFeedVerdict {
  try { const value = JSON.parse(raw) as Partial<AIFeedVerdict>; if (!(["show", "hide", "reduce"] as const).includes(value.action as never) || typeof value.confidence !== "number" || typeof value.reason !== "string") throw new Error("invalid"); const confidence = Math.max(0, Math.min(1, value.confidence)); return confidence < 0.7 ? { action: "show", confidence, reason: value.reason } : { action: value.action!, confidence, reason: value.reason }; } catch { return { action: "show", confidence: 0, reason: "invalid verdict" }; }
}
