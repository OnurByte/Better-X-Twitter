import type { PluginContext } from "../core/plugin";
import type { BetterXSettings } from "../core/settings";

type Appearance = BetterXSettings["appearance"];

const brandPaths: Record<Appearance["brandIcon"], string> = {
  bird: "M23.953 4.57a9.86 9.86 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723 9.99 9.99 0 0 1-3.169 1.21 4.92 4.92 0 0 0-8.384 4.482A13.98 13.98 0 0 1 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.9 4.9 0 0 1-2.228-.616v.06a4.926 4.926 0 0 0 3.946 4.827 4.964 4.964 0 0 1-2.212.084 4.935 4.935 0 0 0 4.604 3.417A9.875 9.875 0 0 1 0 19.54a13.94 13.94 0 0 0 7.548 2.212c9.057 0 14.01-7.503 14.01-14.01 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.59z",
  x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
};

function brandIcon(kind: Appearance["brandIcon"], source?: SVGSVGElement): SVGSVGElement {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  source?.getAttributeNames().forEach((name) => icon.setAttribute(name, source.getAttribute(name) ?? ""));
  if (!icon.hasAttribute("viewBox")) icon.setAttribute("viewBox", "0 0 24 24");
  if (!icon.hasAttribute("fill")) icon.setAttribute("fill", "currentColor");
  if (!icon.hasAttribute("aria-hidden")) icon.setAttribute("aria-hidden", "true");
  icon.dataset.bxBrandIcon = kind;
  icon.innerHTML = `<path d="${brandPaths[kind]}" />`;
  return icon;
}

export function applyAppearance(appearance: Appearance): void {
  document.documentElement.style.setProperty("--bx-accent", appearance.accentColor);
  document.documentElement.classList.toggle("bx-liquid-glass", appearance.liquidGlass);
  document.querySelectorAll<HTMLElement>('a[aria-label="X"], a[aria-label="Twitter"]').forEach((host) => {
    const current = host.querySelector<SVGSVGElement>("svg");
    const expected = brandIcon(appearance.brandIcon, current ?? undefined);
    if (!current || current.dataset.bxBrandIcon !== appearance.brandIcon || current.innerHTML !== expected.innerHTML) current?.replaceWith(expected);
  });
}

export async function installAppearance(context: PluginContext): Promise<() => void> {
  let appearance = (await context.settings.get()).appearance;
  const apply = () => applyAppearance(appearance);
  const onMessage = (message: unknown) => {
    const value = (message as { type?: string; appearance?: Appearance }).appearance;
    if ((message as { type?: string }).type !== "better-x:appearance" || !value) return;
    appearance = value;
    apply();
  };
  const observer = new MutationObserver(apply);
  observer.observe(document.body, { childList: true, subtree: true });
  chrome.runtime.onMessage.addListener(onMessage);
  apply();
  return () => { observer.disconnect(); chrome.runtime.onMessage.removeListener(onMessage); };
}
