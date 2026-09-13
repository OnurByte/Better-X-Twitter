import { describe, expect, it } from "vitest";
import { PluginManager } from "../../src/core/plugin-manager";
import { defaults, migrateSettings } from "../../src/core/settings";

describe("PluginManager", () => {
  it("starts only enabled plugins and isolates failures", async () => {
    const started: string[] = [];
    const manager = new PluginManager({ settings: { get: async () => ({ features: {} }) }, logger: { error: () => {} } } as never);
    manager.register({ id: "on", name: "On", defaultEnabled: true, start: () => { started.push("on"); }, stop: () => {} });
    manager.register({ id: "off", name: "Off", defaultEnabled: false, start: () => { started.push("off"); }, stop: () => {} });
    manager.register({ id: "bad", name: "Bad", defaultEnabled: true, start: () => { throw new Error("bad"); }, stop: () => {} });

    await manager.startEnabledPlugins();

    expect(started).toEqual(["on"]);
    expect(manager.health()).toEqual({ on: "healthy", off: "stopped", bad: "failed" });
  });
});

describe("settings", () => {
  it("migrates missing settings to safe defaults", () => {
    const result = migrateSettings({ version: 0, features: {} });
    expect(result.version).toBe(defaults.version);
    expect(result.features["quick-actions"]).toBe(true);
    expect(result.ai.enabled).toBe(false);
  });
});
