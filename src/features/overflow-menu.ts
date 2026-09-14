import type { PluginContext } from "../core/plugin";
import { shareUrl } from "./utilities/urls";
import { heroIcon, type HeroIconName } from "../ui/icons";

function nativeMenuItem(template: HTMLElement, label: string, iconName: HeroIconName, action: () => void): HTMLElement {
  const item = template.cloneNode(true) as HTMLElement;
  item.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
  item.removeAttribute("data-testid");
  item.dataset.bxMenuItem = label;
  item.querySelector("svg")?.replaceWith(heroIcon(iconName));
  const text = Array.from(item.querySelectorAll<HTMLElement>("*")).reverse().find((element) => element.children.length === 0 && Boolean(element.textContent?.trim()));
  if (text) text.textContent = label;
  else item.append(document.createTextNode(label));
  item.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); action(); });
  return item;
}

export function installOverflowMenu(context: PluginContext, options: { share: boolean; media: boolean; target?: "original" | "fxtwitter" | "vxtwitter" }): () => void {
  const onClick = (event: Event) => {
    const target = event.target as HTMLElement;
    const trigger = target.closest<HTMLElement>('[data-testid="caret"], [aria-label*="More"]');
    const article = trigger?.closest<HTMLElement>("article");
    if (!article) return;
    const post = context.x.parsePost(article);
    if (!post) return;
    setTimeout(() => {
      const menu = document.querySelector<HTMLElement>('[role="menu"]');
      const template = menu?.querySelector<HTMLElement>('[role="menuitem"]');
      if (!menu || !template) return;
      const target = options.target ?? "fxtwitter";
      const copyLabel = target === "original" ? "Copy link" : `Copy ${target === "fxtwitter" ? "FxTwitter" : "VxTwitter"} embed`;
      if (options.share && post.url && !menu.querySelector(`[data-bx-menu-item="${copyLabel}"]`)) {
        const original = Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]')).find((item) => /^copy link$/i.test(item.textContent?.trim() ?? ""));
        const copy = nativeMenuItem(original ?? template, copyLabel, "link", () => {
          void navigator.clipboard?.writeText(shareUrl(post.url!, target));
          context.ui.toast(target === "original" ? "X link copied" : `${target === "fxtwitter" ? "FxTwitter" : "VxTwitter"} embed copied`);
        });
        if (original) original.replaceWith(copy); else menu.append(copy);
      }
      if (options.media && !menu.querySelector('[data-bx-menu-item="Download media"]')) {
        const download = nativeMenuItem(template, "Download media", "arrow-down-tray", () => {
          const media = post.element.querySelector<HTMLImageElement>('video[src], [data-testid="tweetPhoto"] img[src], img[src*="/media/"]')?.src;
          if (media) void context.runtime.request({ type: "media.download", media: { url: media, filename: `better-x-${post.statusId ?? "media"}` } });
          else context.ui.toast("No direct media found");
        });
        menu.append(download);
      }
    }, 0);
  };
  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}
