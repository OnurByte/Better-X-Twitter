import type { ParsedPost } from "../../x/types";
import type { XDomAdapter } from "../../core/plugin";

export function injectQuickActions(post: ParsedPost, x: XDomAdapter, enabled: { block: boolean; notInterested: boolean; mute: boolean }, toast: (message: string) => void): void {
  const host = post.element.querySelector<HTMLElement>("[data-testid=\"User-Name\"], header") ?? post.element;
  if (host.querySelector("[data-bx-quick-actions]")) return;
  const controls = document.createElement("span"); controls.dataset.bxQuickActions = "true"; controls.className = "bx-quick-actions";
  const add = (label: string, action: () => Promise<void>, active: boolean) => { if (!active) return; const button = document.createElement("button"); button.type = "button"; button.title = label; button.textContent = label === "Block" ? "⛔" : label === "Mute" ? "🔇" : "✕"; button.addEventListener("click", () => void action()); controls.append(button); };
  const confirmAuthor = (verb: string) => window.confirm(`${verb} @${post.author.handle ?? "this user"}?`);
  add("Block", async () => { if (confirmAuthor("Block") && !(await (await x.openPostMenu(post)).choose("block"))) toast("X's block menu was not available"); }, enabled.block);
  add("Not Interested", async () => { const ok = await (await x.openPostMenu(post)).choose("not interested"); if (!ok) { post.element.dataset.bxHidden = "not-interested"; post.element.hidden = true; toast("Hidden locally by Better X"); } }, enabled.notInterested);
  add("Mute", async () => { if (confirmAuthor("Mute") && !(await (await x.openPostMenu(post)).choose("mute"))) toast("X's mute menu was not available"); }, enabled.mute);
  host.append(controls);
}
