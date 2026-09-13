import { evaluateRules, type FeedRule } from "../feed-rules/rules";
import type { ParsedPost } from "../../x/types";
export function filterNotification(post: ParsedPost, rules: FeedRule[]): void { const decision = evaluateRules(post, rules); if (decision.action === "hide") post.element.hidden = true; if (decision.action === "reduce") post.element.style.opacity = "0.55"; }
