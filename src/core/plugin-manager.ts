import type { BetterXPlugin, PluginContext } from "./plugin";

type Status = "healthy" | "failed" | "stopped";

export class PluginManager {
  private plugins = new Map<string, BetterXPlugin>();
  private statuses = new Map<string, Status>();
  constructor(private readonly context: PluginContext) {}
  register(plugin: BetterXPlugin): void {
    if (this.plugins.has(plugin.id)) throw new Error(`Duplicate plugin: ${plugin.id}`);
    this.plugins.set(plugin.id, plugin);
    this.statuses.set(plugin.id, "stopped");
  }
  async startEnabledPlugins(): Promise<void> {
    const settings = await this.context.settings.get();
    for (const plugin of this.plugins.values()) {
      if (!(settings.features[plugin.id] ?? plugin.defaultEnabled)) continue;
      try { await plugin.start(this.context); this.statuses.set(plugin.id, "healthy"); }
      catch (error) { this.statuses.set(plugin.id, "failed"); this.context.logger.error(plugin.id, error); }
    }
  }
  async stopPlugin(id: string): Promise<void> { const plugin = this.plugins.get(id); if (plugin) { await plugin.stop(); this.statuses.set(id, "stopped"); } }
  health(): Record<string, Status> { return Object.fromEntries(this.statuses); }
}
