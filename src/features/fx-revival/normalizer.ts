export interface NormalizedPost { statusId: string; url?: string; text: string; author: { handle?: string; displayName?: string }; media?: unknown[] }
export type FxResult = { kind: "success"; post: NormalizedPost } | { kind: "unavailable"; reason: string; message: string };

export function normalizeFxResponse(input: unknown): FxResult {
  if (!input || typeof input !== "object") throw new Error("Invalid FxTwitter response");
  const body = input as { code?: number; status?: Record<string, unknown> };
  if (body.code !== 200 || !body.status) throw new Error("FxTwitter request failed");
  const status = body.status;
  if (status.type === "tombstone") return { kind: "unavailable", reason: String(status.reason ?? "unavailable"), message: String(status.message ?? "Post unavailable") };
  if (typeof status.id !== "string" || typeof status.text !== "string") throw new Error("Malformed FxTwitter status");
  const author = (status.author ?? {}) as Record<string, unknown>;
  return { kind: "success", post: { statusId: status.id, url: typeof status.url === "string" ? status.url : undefined, text: status.text, author: { handle: typeof author.screen_name === "string" ? author.screen_name : undefined, displayName: typeof author.name === "string" ? author.name : undefined }, media: Array.isArray(status.media) ? status.media : undefined } };
}
