import type { AccountCountry } from "./resolver";

const flagMarkup: Record<string, string> = {
  DE: '<rect width="24" height="16" fill="#ffce00"/><rect width="24" height="10.67" fill="#dd0000"/><rect width="24" height="5.33" fill="#000"/>',
  JP: '<rect width="24" height="16" fill="#fff"/><circle cx="12" cy="8" r="4.5" fill="#bc002d"/>',
  TR: '<rect width="24" height="16" fill="#e30a17"/><circle cx="9.2" cy="8" r="4.1" fill="#fff"/><circle cx="10.5" cy="8" r="3.25" fill="#e30a17"/><path fill="#fff" d="m14.1 4.8.92 2.27 2.44.13-1.88 1.56.58 2.38-2.06-1.28-2.06 1.28.58-2.38-1.88-1.56 2.44-.13.92-2.27Z"/>',
  US: '<rect width="24" height="16" fill="#fff"/><path fill="#b22234" d="M0 0h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0z"/><rect width="10.2" height="8.62" fill="#3c3b6e"/><path fill="#fff" d="M1.2 1.3h.7v.7h-.7zm2.1 0H4v.7h-.7zm2.1 0h.7v.7h-.7zm2.1 0h.7v.7h-.7zM2.25 3h.7v.7h-.7zm2.1 0h.7v.7h-.7zm2.1 0h.7v.7h-.7zm2.1 0h.7v.7h-.7zM1.2 4.7h.7v.7h-.7zm2.1 0H4v.7h-.7zm2.1 0h.7v.7h-.7zm2.1 0h.7v.7h-.7zM2.25 6.4h.7v.7h-.7zm2.1 0h.7v.7h-.7zm2.1 0h.7v.7h-.7zm2.1 0h.7v.7h-.7z"/>'
};

function renderCountryFlag(code: string): SVGSVGElement {
  const flag = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  flag.setAttribute("viewBox", "0 0 24 16");
  flag.setAttribute("aria-hidden", "true");
  flag.setAttribute("focusable", "false");
  flag.classList.add("bx-country-flag");
  flag.innerHTML = flagMarkup[code] ?? "";
  return flag;
}

export function renderCountryBadge(country: AccountCountry): HTMLElement {
  const badge = document.createElement("span");
  const title = country.source === "x-about-account" ? `${country.countryName ?? "Unknown"} · X account region` : `${country.countryName ?? "Unknown"} · estimated from profile location`;
  badge.className = "bx-country-badge";
  badge.dataset.countryCode = country.countryCode ?? "";
  badge.title = title;
  badge.setAttribute("aria-label", title);
  badge.append(renderCountryFlag(country.countryCode ?? ""));
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
