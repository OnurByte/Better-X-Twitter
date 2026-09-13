import { defaults, migrateSettings, type BetterXSettings } from "./settings";
import type { SettingsStore } from "./plugin";

export class ChromeSettingsStore implements SettingsStore {
  async get(): Promise<BetterXSettings> { const result = await chrome.storage.local.get("betterXSettings"); return migrateSettings(result.betterXSettings); }
  async patch(patch: Partial<BetterXSettings>): Promise<BetterXSettings> { const next = { ...(await this.get()), ...patch }; await chrome.storage.local.set({ betterXSettings: next }); return migrateSettings(next); }
  async reset(section?: string): Promise<BetterXSettings> { const next = await this.get(); if (section && section in defaults) (next as unknown as Record<string, unknown>)[section] = structuredClone((defaults as unknown as Record<string, unknown>)[section]); else Object.assign(next, structuredClone(defaults)); await chrome.storage.local.set({ betterXSettings: next }); return next; }
}

export class RemoteSettingsStore implements SettingsStore {
  async get(): Promise<BetterXSettings> { const response = await chrome.runtime.sendMessage({ type: "settings.get" }) as { ok: boolean; value?: BetterXSettings }; return migrateSettings(response.ok ? response.value : defaults); }
  async patch(patch: Partial<BetterXSettings>): Promise<BetterXSettings> { const response = await chrome.runtime.sendMessage({ type: "settings.set", patch }); if (!response.ok) throw new Error(response.message ?? "Settings update failed"); return migrateSettings(response.value); }
  async reset(section?: string): Promise<BetterXSettings> { const response = await chrome.runtime.sendMessage({ type: "settings.reset", section }); if (!response.ok) throw new Error(response.message ?? "Settings reset failed"); return migrateSettings(response.value); }
}
