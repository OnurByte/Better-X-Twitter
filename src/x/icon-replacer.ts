import { heroIcon, type HeroIconName } from "../ui/icons";

const actionIcons: Array<[RegExp, HeroIconName]> = [
  [/\b(reply|comment)\b/, "chat-bubble-left"],
  [/\b(repost|retweet)\b/, "arrow-path-rounded-square"],
  [/\b(unlike|like)\b/, "heart"],
  [/\b(remove bookmark|bookmark)\b/, "bookmark"],
  [/\b(share|copy link)\b/, "share"],
  [/\b(more|caret)\b/, "ellipsis-horizontal"],
  [/\b(unfollow|unsubscribe)\b/, "user-minus"],
  [/\b(follow|subscribe)\b/, "user-plus"],
  [/\b(home|timeline)\b/, "home"],
  [/\b(search|explore)\b/, "magnifying-glass"],
  [/\b(notification|alert)s?\b/, "bell"],
  [/\b(direct message|message)s?\b/, "envelope"],
  [/\b(community|communities|people)\b/, "user-group"],
  [/\b(list|lists)\b/, "queue-list"],
  [/\b(setting|settings|preference)s?\b/, "cog-6-tooth"],
  [/\b(job|jobs|hiring)\b/, "briefcase"],
  [/\b(premium|verified org(?:anization)?s?)\b/, "sparkles"],
  [/\b(menu|navigation)\b/, "bars-3"],
  [/\b(compose|write|post)\b/, "pencil"],
  [/\b(profile|account|me)\b/, "user"],
  [/\b(previous|back)\b/, "chevron-left"],
  [/\b(next|forward)\b/, "chevron-right"],
  [/\b(close|cancel)\b/, "x-mark"],
  [/\b(image|photo|media)\b/, "photo"],
  [/\b(play|pause|video)\b/, "play-pause"]
];

function iconFor(button: HTMLElement): HeroIconName | undefined {
  const label = `${button.dataset.testid ?? ""} ${button.getAttribute("aria-label") ?? ""}`.toLowerCase();
  return actionIcons.find(([pattern]) => pattern.test(label))?.[1];
}

export function replaceXActionIcons(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('a, button, [role="button"]').forEach((button) => {
    if (button.closest("[data-bx-quick-actions], [data-bx-menu-item], [data-bx-profile-tool], [data-bx-ai-reply]")) return;
    const name = iconFor(button);
    if (!name) return;
    const icons = Array.from(button.querySelectorAll<SVGSVGElement>("svg"));
    const current = icons.find((icon) => icon.dataset.bxIconName !== name) ?? icons[0];
    if (!current) return;
    const icon = heroIcon(name);
    icon.classList.add("bx-x-icon");
    icon.dataset.bxIconName = name;
    const extraIcons = icons.filter((candidate) => candidate !== current);
    if (current.dataset.bxIconName === name && current.innerHTML === icon.innerHTML) {
      extraIcons.forEach((candidate) => candidate.remove());
      return;
    }
    const previous = getComputedStyle(current);
    const defaultLinkColor = previous.color === "rgb(0, 0, 238)" || previous.color === "rgb(85, 26, 139)";
    icon.style.color = defaultLinkColor ? (getComputedStyle(document.body).backgroundColor === "rgb(0, 0, 0)" ? "rgb(231, 233, 234)" : "rgb(15, 20, 25)") : previous.color;
    if (parseFloat(previous.width) >= 12 && parseFloat(previous.width) <= 48) icon.style.width = previous.width;
    if (parseFloat(previous.height) >= 12 && parseFloat(previous.height) <= 48) icon.style.height = previous.height;
    current.replaceWith(icon);
    extraIcons.forEach((candidate) => candidate.remove());
  });
}

export function installXActionIcons(): () => void {
  let queued = false;
  const apply = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; replaceXActionIcons(); });
  };
  const observer = new MutationObserver(apply);
  observer.observe(document.body, { attributes: true, attributeFilter: ["aria-label", "data-testid", "d"], childList: true, subtree: true });
  replaceXActionIcons();
  return () => observer.disconnect();
}
