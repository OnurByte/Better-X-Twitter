import { mapProfileLocation } from "./country";

export interface AccountCountry { handle: string; countryCode?: string; countryName?: string; source: "x-about-account" | "profile-location" | "unknown"; confidence: "high" | "estimated" | "unknown"; fetchedAt: number }
export function resolveCountry(profile: { about_account?: { based_in?: string | null }; location?: string | null }, handle: string, now = Date.now()): AccountCountry {
  const xRegion = profile.about_account?.based_in ? mapProfileLocation(profile.about_account.based_in) : undefined;
  if (xRegion) return { handle: handle.toLowerCase(), ...xRegion, source: "x-about-account", confidence: "high", fetchedAt: now };
  const location = profile.location ? mapProfileLocation(profile.location) : undefined;
  if (location) return { handle: handle.toLowerCase(), ...location, source: "profile-location", fetchedAt: now };
  return { handle: handle.toLowerCase(), source: "unknown", confidence: "unknown", fetchedAt: now };
}
