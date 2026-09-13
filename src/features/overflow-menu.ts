import type { PluginContext } from "../core/plugin";
import { shareUrl } from "./utilities/urls";
import { heroIcon, type HeroIconName } from "../ui/icons";

function menuItem(label: string, icon: HeroIconName, action: () => void): HTMLButtonElement { const item = document.createElement("button"); item.type = "button"; item.role = "menuitem"; item.className = "bx-menu-item"; item.append(heroIcon(icon), document.createTextNode(label)); item.dataset.bxMenuItem = label; item.addEventListener("click", action); return item; }
export function installOverflowMenu(context: PluginContext, options: { share: boolean; media: boolean }): () => void {
  const onClick = (event: Event) => { const target = event.target as HTMLElement; if (!target.closest('[data-testid="caret"], [aria-label*="More"]')) return; setTimeout(() => { const menu = document.querySelector<HTMLElement>('[role="menu"]'); if (!menu) return; const post = target.closest("article") ? context.x.parsePost(target.closest("article") as HTMLElement) : null; if (!post) return; if (options.share && post.url && !menu.querySelector('[data-bx-menu-item="Copy FxTwitter link"]')) menu.append(menuItem("Copy FxTwitter link", "link", () => { void navigator.clipboard?.writeText(shareUrl(post.url!, "fxtwitter")); context.ui.toast("FxTwitter link copied"); })); if (options.media && !menu.querySelector('[data-bx-menu-item="Download media"]')) menu.append(menuItem("Download media", "arrow-down-tray", () => { const media = post.element.querySelector<HTMLImageElement>("img[src], video[src]")?.src; if (media) void context.runtime.request({ type: "media.download", media: { url: media, filename: `better-x-${post.statusId ?? "media"}` } }); else context.ui.toast("No direct media found"); })); }, 0); };
  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}
