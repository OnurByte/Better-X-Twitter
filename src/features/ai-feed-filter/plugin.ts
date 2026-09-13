import { AIVerdictQueue } from "./queue";
import type { PluginContext } from "../../core/plugin";
import type { ParsedPost } from "../../x/types";

export function startAIFeedFilter(context: PluginContext, instruction: string): () => void {
  const queue = new AIVerdictQueue(async (posts) => { const response = await context.runtime.request<{ ok?: boolean; value?: string }>({ type: "ai.generate", request: { messages: [{ role: "user", content: `${instruction}\nReturn JSON object keyed by post id with {action, confidence, reason}.\n${JSON.stringify(posts)}` }] } }); if (!response.ok || !response.value) throw new Error("AI verdict unavailable"); return JSON.parse(response.value) as Record<string, string>; });
  let timer: number | undefined;
  const unsubscribe = context.events.on("POST_DISCOVERED", (value) => { const post = value as ParsedPost; queue.add({ id: post.identity.statusId ?? post.identity.contentHash, text: post.text }); window.clearTimeout(timer); timer = window.setTimeout(() => void queue.flush().then((verdicts) => Object.entries(verdicts).forEach(([id, verdict]) => { const target = Array.from(document.querySelectorAll<HTMLElement>("article")).find((article) => article.dataset.bxRevision && (article.querySelector(`a[href*='/status/${id}']`) !== null)); if (!target) return; if (verdict.action === "hide") target.hidden = true; if (verdict.action === "reduce") target.style.opacity = "0.55"; })), 500); });
  return () => { context.events.emit("AI_FEED_STOPPED"); unsubscribe(); if (timer) window.clearTimeout(timer); };
}
