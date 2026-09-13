import type { PluginContext } from "../core/plugin";
import { buildSearchUrl } from "./utilities/urls";
import { heroIcon, type HeroIconName } from "../ui/icons";

function profileHandle(): string | undefined { const match = location.pathname.match(/^\/([A-Za-z0-9_]{1,15})\/?$/); return match?.[1]; }
function profileButton(label: string, icon: HeroIconName): HTMLButtonElement { const button = document.createElement("button"); button.type = "button"; button.className = "bx-text-action"; button.append(heroIcon(icon), document.createTextNode(label)); return button; }
export function installProfileTools(context: PluginContext, options: { notes: boolean; timeMachine: boolean }): () => void {
  const attach = () => { const handle = profileHandle(); if (!handle) return; const host = document.querySelector<HTMLElement>('[data-testid="UserProfileHeader_Items"], [data-testid="UserProfileHeader"]'); if (!host || host.querySelector("[data-bx-profile-tool]")) return; const actions = document.createElement("span"); actions.dataset.bxProfileTool = "true"; actions.className = "bx-profile-tools"; if (options.timeMachine) { const search = profileButton("Search posts by date", "calendar-days"); search.addEventListener("click", () => { const from = prompt("From (YYYY-MM-DD)", "2025-01-01"); const until = prompt("To (YYYY-MM-DD)", "2025-02-01"); if (from && until && from < until) location.href = buildSearchUrl(handle, from, until); }); actions.append(search); } if (options.notes) { const note = profileButton("Private note", "pencil-square"); note.addEventListener("click", () => { const text = prompt(`Private note for @${handle}`, ""); if (text !== null) void context.runtime.request({ type: "db.write", store: "user_notes", operation: { type: "put", value: { handle: handle.toLowerCase(), note: text, tags: [], updatedAt: Date.now() } } }); }); actions.append(note); } host.append(actions); };
  const observer = new MutationObserver(attach); observer.observe(document.body, { childList: true, subtree: true }); attach();
  return () => observer.disconnect();
}
