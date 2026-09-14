import type { PluginContext } from "../core/plugin";
import { observeRoutes } from "../x/route-observer";
import { heroIcon } from "../ui/icons";
import { applyAppearance } from "./appearance";

function replaceText(root: HTMLElement, value: string): void {
  const text = Array.from(root.querySelectorAll<HTMLElement>("*")).reverse().find((element) => element.children.length === 0 && Boolean(element.textContent?.trim()));
  if (text) text.textContent = value;
  else root.append(document.createTextNode(value));
}

function addSettingsEntry(primary: HTMLElement, apply: () => void): void {
  if (primary.querySelector('[data-bx-settings-entry="true"]')) return;
  const template = primary.querySelector<HTMLElement>('a[role="link"], a[href^="/settings/"]');
  const entry = template ? template.cloneNode(true) as HTMLAnchorElement : document.createElement("a");
  entry.dataset.bxSettingsEntry = "true";
  entry.setAttribute("href", "/settings/better-x");
  entry.setAttribute("role", "link");
  replaceText(entry, "Better X");
  entry.addEventListener("click", (event) => {
    event.preventDefault();
    history.pushState({}, "", "/settings/better-x");
    apply();
  });
  primary.append(entry);
}

function mountSettingsFrame(primary: HTMLElement): void {
  if (primary.querySelector('[data-bx-settings-frame="true"]')) return;
  const page = document.createElement("section");
  page.className = "bx-settings-page";
  page.dataset.bxEmbeddedSettings = "true";
  const header = document.createElement("header");
  header.className = "bx-settings-header";
  const back = document.createElement("button");
  back.type = "button";
  back.setAttribute("aria-label", "Back");
  back.append(heroIcon("chevron-left"));
  back.addEventListener("click", () => history.back());
  const title = document.createElement("strong");
  title.textContent = "Better X";
  header.append(back, title);
  const frame = document.createElement("iframe");
  frame.dataset.bxSettingsFrame = "true";
  frame.title = "Better X settings";
  frame.src = chrome.runtime.getURL("options.html?embedded=1");
  page.append(header, frame);
  primary.replaceChildren(page);
}

export function installEmbeddedSettings(_context: PluginContext): () => void {
  let queued = false;
  const reconcile = () => {
    const primary = document.querySelector<HTMLElement>('[data-testid="primaryColumn"], main[role="main"], main');
    if (!primary) return;
    if (location.pathname === "/settings/better-x") mountSettingsFrame(primary);
    else if (location.pathname === "/settings") addSettingsEntry(primary, reconcile);
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; reconcile(); });
  };
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true });
  const stopRoutes = observeRoutes(reconcile);
  const extensionOrigin = chrome.runtime.getURL("").replace(/\/$/, "");
  const onMessage = (event: MessageEvent) => {
    const appearance = (event.data as { type?: string; appearance?: { accentColor?: string; liquidGlass?: boolean; brandIcon?: string } })?.appearance;
    const frame = document.querySelector<HTMLIFrameElement>('[data-bx-settings-frame="true"]');
    if (event.origin !== extensionOrigin || event.source !== frame?.contentWindow || event.data?.type !== "better-x:appearance" || !appearance || !/^#[0-9a-f]{6}$/i.test(appearance.accentColor ?? "") || typeof appearance.liquidGlass !== "boolean" || !/^(bird|x)$/.test(appearance.brandIcon ?? "")) return;
    applyAppearance({ accentColor: appearance.accentColor!.toUpperCase(), liquidGlass: appearance.liquidGlass, brandIcon: appearance.brandIcon as "bird" | "x" });
  };
  addEventListener("message", onMessage);
  reconcile();
  return () => { observer.disconnect(); stopRoutes(); removeEventListener("message", onMessage); };
}
