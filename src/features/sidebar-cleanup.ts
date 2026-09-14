import { heroIcon, type HeroIconName } from "../ui/icons";

const sidebarSelector = '[data-testid="sidebarColumn"]';
const bloatSelector = `${sidebarSelector}, aside, [role="complementary"], [data-testid="UserFollowSuggestions"], footer, [aria-label="Who to follow"], [aria-label="Trending now"], [aria-label="What’s happening"], [aria-label="Today's News"]`;
const grokSelector = 'a[href^="/i/grok"], a[href^="/grok"], [data-testid*="grok" i], [aria-label*="Grok" i]';
const bloatHeading = /^(who to follow|you might like|trending now|what(?:'|’)s happening|today(?:'|’)s news|subscribe to premium)$/i;
const leftNavBloat = 'a[href*="/premium"], a[href*="/i/premium"], a[href*="/i/lists"], a[href*="/i/spaces/start"], a[aria-label="Create your Space"], a[aria-label="Creator Studio"], a[href*="creator-studio"], a[href*="creator_studio"], a[href*="studio.x.com"], a[aria-label="Ads"], a[href*="ads.x.com"], a[href*="/i/ads"], button[data-testid*="AppTabBar_More"], button[aria-label="More"]';

export function hideSidebar(root: HTMLElement): void {
  root.hidden = true;
  root.dataset.bxSidebarHidden = "true";
  root.setAttribute("aria-hidden", "true");
  root.style.setProperty("display", "none", "important");
}

export function hideGrok(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(grokSelector).forEach((element) => {
    element.dataset.bxGrokHidden = "true";
    element.setAttribute("aria-hidden", "true");
    element.style.setProperty("display", "none", "important");
  });
}

export function hideSidebarBloat(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(bloatSelector).forEach(hideSidebar);
  root.querySelectorAll<HTMLElement>("section, [role='region']").forEach((block) => {
    const heading = block.querySelector<HTMLElement>("h1, h2, h3, h4, [role='heading']");
    if (heading && bloatHeading.test(heading.textContent?.trim() ?? "")) hideSidebar(block);
  });
}

function hideLeftNavBloat(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>(leftNavBloat).forEach((item) => {
    item.hidden = true;
    item.setAttribute("aria-hidden", "true");
    item.style.setProperty("display", "none", "important");
  });
}

function navEntry(nav: HTMLElement, key: string, href: string, label: string, iconName: HeroIconName): HTMLElement {
  const template = nav.querySelector<HTMLElement>('a[href*="bookmarks"], a[href="/home"], a');
  const entry = template ? template.cloneNode(true) as HTMLElement : document.createElement("a");
  entry.hidden = false;
  entry.removeAttribute("aria-hidden");
  entry.style.removeProperty("display");
  entry.style.color = "inherit";
  entry.style.textDecoration = "none";
  entry.dataset.bxNavEntry = key;
  entry.setAttribute("href", href);
  entry.setAttribute("aria-label", label);
  entry.dataset.testid = `AppTabBar_${label}_Link`;
  const icon = heroIcon(iconName);
  icon.classList.add("bx-x-icon");
  entry.querySelector("svg")?.replaceWith(icon);
  const text = Array.from(entry.querySelectorAll<HTMLElement>("span")).reverse().find((span) => Boolean(span.textContent?.trim()));
  if (text) text.textContent = label;
  else entry.append(document.createTextNode(label));
  return entry;
}

export function reconcileLeftNavigation(root: ParentNode = document): void {
  hideLeftNavBloat(root);
  const nav = root.querySelector<HTMLElement>("nav");
  if (!nav) return;
  if (!nav.querySelector('[href="/i/communities"], [data-bx-nav-entry="communities"]')) {
    const communities = navEntry(nav, "communities", "/i/communities", "Communities", "user-group");
    const bookmarks = nav.querySelector<HTMLElement>('a[href*="bookmarks"]');
    bookmarks?.after(communities) ?? nav.append(communities);
  }
  if (!nav.querySelector('[href="/settings"], [data-bx-nav-entry="settings"]')) {
    const settings = navEntry(nav, "settings", "/settings", "Settings", "cog-6-tooth");
    const profile = nav.querySelector<HTMLElement>('a[aria-label="Profile"], a[data-testid*="Profile"]');
    profile?.before(settings) ?? nav.append(settings);
  }
}

export function installSidebarCleanup(): () => void {
  const root = document;
  const apply = () => { hideSidebarBloat(root); reconcileLeftNavigation(root); };
  const observer = new MutationObserver(apply);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  apply();
  return () => observer.disconnect();
}

export function installGrokCleanup(): () => void {
  const root = document;
  const apply = () => hideGrok(root);
  const observer = new MutationObserver(apply);
  observer.observe(root.documentElement, { childList: true, subtree: true });
  apply();
  return () => observer.disconnect();
}
