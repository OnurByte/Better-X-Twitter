import type { AccountCountry } from "./resolver";
import { flagForCountry } from "./country";

export function renderCountryBadge(country: AccountCountry): HTMLElement { const badge = document.createElement("span"); badge.className = "bx-country-badge"; badge.textContent = country.countryCode ? flagForCountry(country.countryCode) : ""; badge.title = country.source === "x-about-account" ? `${country.countryName ?? "Unknown"} · X account region` : `${country.countryName ?? "Unknown"} · estimated from profile location`; badge.setAttribute("aria-label", badge.title); return badge; }
