const sidebarSelector = '[data-testid="sidebarColumn"]';

function shortcut(label: string, href: string, external = false): HTMLAnchorElement {
  const link = document.createElement("a");
  link.className = "bx-sidebar-link";
  link.href = href;
  link.textContent = label;
  if (external) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  return link;
}

export function replaceSidebar(root: HTMLElement, optionsUrl: string): void {
  if (root.querySelector("[data-bx-sidebar]")) return;
  const panel = document.createElement("aside");
  panel.dataset.bxSidebar = "true";
  panel.className = "bx-sidebar-card";
  panel.setAttribute("aria-label", "Better X shortcuts");

  const eyebrow = document.createElement("p");
  eyebrow.className = "bx-sidebar-eyebrow";
  eyebrow.textContent = "BETTER X / CONTROL";
  const title = document.createElement("h2");
  title.textContent = "Read your way.";
  const copy = document.createElement("p");
  copy.className = "bx-sidebar-copy";
  copy.textContent = "Local shortcuts for a quieter timeline.";
  const nav = document.createElement("nav");
  nav.className = "bx-sidebar-nav";
  nav.setAttribute("aria-label", "Better X shortcuts");
  nav.append(
    shortcut("Following", "/home?f=following"),
    shortcut("Bookmarks", "/i/bookmarks"),
    shortcut("Search", "/search"),
    shortcut("Settings ↗", optionsUrl, true)
  );
  panel.append(eyebrow, title, copy, nav);
  root.replaceChildren(panel);
}

export function installSidebarCleanup(): () => void {
  const apply = () => document.querySelectorAll<HTMLElement>(sidebarSelector).forEach((root) => replaceSidebar(root, chrome.runtime.getURL("options.html")));
  const observer = new MutationObserver(apply);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  apply();
  return () => observer.disconnect();
}
