import { heroIcon, type HeroIconName } from "../ui/icons";

const actionIcons: Array<[RegExp, HeroIconName]> = [
  [/\b(reply|comment)\b/, "chat-bubble-left"],
  [/\b(repost|retweet)\b/, "arrow-path-rounded-square"],
  [/\b(unlike|like)\b/, "heart"],
  [/\b(remove bookmark|bookmark)\b/, "bookmark"],
  [/\b(share|copy link)\b/, "share"],
  [/\b(more|caret)\b/, "ellipsis-horizontal"]
];

function iconFor(button: HTMLElement): HeroIconName | undefined {
  const label = `${button.dataset.testid ?? ""} ${button.getAttribute("aria-label") ?? ""}`.toLowerCase();
  return actionIcons.find(([pattern]) => pattern.test(label))?.[1];
}

export function replaceXActionIcons(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('button, [role="button"]').forEach((button) => {
    if (button.closest("[data-bx-quick-actions], [data-bx-menu-item], [data-bx-profile-tool], [data-bx-ai-reply]")) return;
    const name = iconFor(button);
    const current = button.querySelector<SVGSVGElement>("svg");
    if (!name || !current || current.classList.contains("bx-x-icon")) return;
    const icon = heroIcon(name);
    icon.classList.add("bx-x-icon");
    current.replaceWith(icon);
  });
}

export function installXActionIcons(): () => void {
  const observer = new MutationObserver(() => replaceXActionIcons());
  observer.observe(document.body, { childList: true, subtree: true });
  replaceXActionIcons();
  return () => observer.disconnect();
}
