const sidebarSelector = '[data-testid="sidebarColumn"]';

export function hideSidebar(root: HTMLElement): void {
  root.hidden = true;
  root.dataset.bxSidebarHidden = "true";
  root.setAttribute("aria-hidden", "true");
}

export function installSidebarCleanup(): () => void {
  const apply = () => document.querySelectorAll<HTMLElement>(sidebarSelector).forEach(hideSidebar);
  const observer = new MutationObserver(apply);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  apply();
  return () => observer.disconnect();
}
