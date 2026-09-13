import { buildReplyPrompt } from "./prompt-builder";
import { insertReply } from "./insert";
import type { RuntimeBridge } from "../../core/plugin";

export function attachReplyTool(composer: HTMLElement, runtime: RuntimeBridge, style: string): void {
  if (composer.parentElement?.querySelector("[data-bx-ai-reply]")) return;
  const button = document.createElement("button"); button.type = "button"; button.dataset.bxAiReply = "true"; button.textContent = "AI Reply"; button.addEventListener("click", () => { const draft = composer.textContent ?? ""; const prompt = buildReplyPrompt({ text: draft, draft, style, includePrivateNote: false }); void runtime.request<{ ok?: boolean; value?: string }>({ type: "ai.generate", request: { messages: [{ role: "user", content: prompt }] } }).then((response) => { if (response.ok && response.value) insertReply(composer, draft, response.value); }); });
  composer.parentElement?.append(button);
}
