import type { AccountCountry } from "./resolver";

function flagEmoji(code: string): string {
  const normalized = code.toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? String.fromCodePoint(...Array.from(normalized, (letter) => 127397 + letter.charCodeAt(0))) : "";
}

export function renderCountryBadge(country: AccountCountry): HTMLElement {
  const badge = document.createElement("span");
  const title = country.source === "x-about-account" ? `${country.countryName ?? "Unknown"} · X account region` : `${country.countryName ?? "Unknown"} · estimated from profile location`;
  badge.className = "bx-country-flag";
  badge.dataset.countryCode = country.countryCode ?? "";
  badge.title = title;
  badge.setAttribute("aria-label", title);
  badge.textContent = flagEmoji(country.countryCode ?? "");
  return badge;
}

export function appendCountryBadge(container: HTMLElement, country: AccountCountry): void {
  if (!country.countryCode) return;
  const host = container.querySelector<HTMLElement>("[data-bx-quick-actions]") ?? container;
  const existing = host.querySelector<HTMLElement>(`.bx-country-flag[data-country-code="${country.countryCode}"]`);
  if (existing) return;
  host.querySelectorAll(".bx-country-flag").forEach((badge) => badge.remove());
  host.append(renderCountryBadge(country));
}
