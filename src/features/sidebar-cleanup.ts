const sidebarSelector = '[data-testid="sidebarColumn"]';
const bloatSelector = `${sidebarSelector}, [data-testid="UserFollowSuggestions"], footer, [aria-label="Who to follow"], [aria-label="Trending now"], [aria-label="What’s happening"], [aria-label="Today's News"]`;
const bloatHeading = /^(who to follow|you might like|trending now|what(?:'|’)s happening|today(?:'|’)s news|subscribe to premium)$/i;

export function hideSidebar(root: HTMLElement): void {
  root.hidden = true;
  root.dataset.bxSidebarHidden = "true";
  root.setAttribute("aria-hidden", "true");
}

export function hideSidebarBloat(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(bloatSelector).forEach(hideSidebar);
  root.querySelectorAll<HTMLElement>("section, [role='region']").forEach((block) => {
    const heading = block.querySelector<HTMLElement>("h1, h2, h3, h4, [role='heading']");
    if (heading && bloatHeading.test(heading.textContent?.trim() ?? "")) hideSidebar(block);
  });
}

export function installSidebarCleanup(): () => void {
  const apply = () => hideSidebarBloat();
  const observer = new MutationObserver(apply);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  apply();
  return () => observer.disconnect();
}
