import type { ParsedPost } from "../../x/types";

export type FeedRule = { id: string; kind: "keyword" | "user" | "domain" | "post-type"; value: string; action: "show" | "hide" | "reduce"; reason?: string; updatedAt?: number };

export function evaluateRules(post: Pick<ParsedPost, "text" | "author" | "type">, rules: FeedRule[]): { action: "show" | "hide" | "reduce"; reason?: string; ruleId?: string } {
  const matches = rules.filter((rule) => {
    if (rule.kind === "keyword") return post.text.toLocaleLowerCase().includes(rule.value.toLocaleLowerCase());
    if (rule.kind === "user") return post.author.handle?.toLowerCase() === rule.value.replace(/^@/, "").toLowerCase();
    if (rule.kind === "post-type") return post.type === rule.value;
    return [...post.text.matchAll(/https?:\/\/([^/\s]+)/gi)].some(([, host]) => host.toLowerCase() === rule.value.replace(/^www\./, "").toLowerCase());
  });
  const rank = { show: 3, hide: 2, reduce: 1 };
  const winner = matches.sort((a, b) => rank[b.action] - rank[a.action] || (b.updatedAt ?? 0) - (a.updatedAt ?? 0))[0];
  return winner ? { action: winner.action, reason: winner.reason ?? `${winner.kind}: ${winner.value}`, ruleId: winner.id } : { action: "show" };
}
