import { createContext } from "./core/bootstrap";
import { defaults } from "./core/settings";
import { PluginManager } from "./core/plugin-manager";
import { contentPlugins } from "./features/plugin-registry";

const context = createContext();

async function start(): Promise<void> {
  await context.settings.get().catch(() => defaults);
  const manager = new PluginManager(context);
  for (const plugin of contentPlugins()) manager.register(plugin);
  await manager.startEnabledPlugins();
  context.x.observePosts((post) => context.events.emit("POST_DISCOVERED", post));
}

void start();
