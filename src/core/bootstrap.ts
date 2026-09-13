import { Events } from "./events";
import { RemoteSettingsStore } from "./settings-store";
import { logger } from "./logger";
import { runtime } from "./runtime-bridge";
import { IndexedDb } from "../storage/database";
import { DomAdapter } from "../x/dom-adapter";
import { ui } from "../ui/primitives";
import type { PluginContext } from "./plugin";

export function createContext(): PluginContext { return { events: new Events(), settings: new RemoteSettingsStore(), db: new IndexedDb(), x: new DomAdapter(), ui, runtime, logger }; }
