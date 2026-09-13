import type { AccountCountry } from "./resolver";
import { heroIcon } from "../../ui/icons";

export function renderCountryBadge(country: AccountCountry): HTMLElement {
  const badge = document.createElement("span");
  const title = country.source === "x-about-account" ? `${country.countryName ?? "Unknown"} · X account region` : `${country.countryName ?? "Unknown"} · estimated from profile location`;
  badge.className = "bx-country-badge";
  badge.dataset.countryCode = country.countryCode ?? "";
  badge.title = title;
  badge.setAttribute("aria-label", title);
  badge.append(heroIcon("flag"));
  const code = document.createElement("span");
  code.textContent = country.countryCode ?? "--";
  badge.append(code);
  return badge;
}

export function appendCountryBadge(container: HTMLElement, country: AccountCountry): void {
  if (!country.countryCode) return;
  const host = container.querySelector<HTMLElement>("[data-bx-quick-actions]") ?? container;
  const existing = host.querySelector<HTMLElement>(`.bx-country-badge[data-country-code="${country.countryCode}"]`);
  if (existing) return;
  host.querySelectorAll(".bx-country-badge").forEach((badge) => badge.remove());
  host.append(renderCountryBadge(country));
}
