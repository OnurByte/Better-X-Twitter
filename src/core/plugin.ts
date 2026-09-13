import type { BetterXSettings } from "./settings";

export interface EventBus { on(event: string, listener: (value: unknown) => void): () => void; emit(event: string, value?: unknown): void }
export interface SettingsStore { get(): Promise<BetterXSettings>; patch(patch: Partial<BetterXSettings>): Promise<BetterXSettings>; reset(section?: string): Promise<BetterXSettings> }
export interface BetterXDatabase { get<T>(store: string, key: IDBValidKey): Promise<T | undefined>; put<T>(store: string, value: T): Promise<void>; delete(store: string, key: IDBValidKey): Promise<void>; all<T>(store: string): Promise<T[]> }
export interface XMenuHandle { choose(label: string): Promise<boolean> }
export interface XDomAdapter { observePosts(cb: (post: import("../x/types").ParsedPost) => void): () => void; parsePost(article: HTMLElement): import("../x/types").ParsedPost | null; findComposer(): HTMLElement | null; openPostMenu(post: import("../x/types").ParsedPost): Promise<XMenuHandle> }
export interface RuntimeBridge { request<T>(request: import("./runtime-bridge").ExtensionRequest): Promise<T> }
export interface UiPrimitives { toast(message: string): void; popover(anchor: HTMLElement, content: HTMLElement): void }
export interface Logger { info(scope: string, message: string): void; error(scope: string, error: unknown): void }
export interface PluginContext { events: EventBus; settings: SettingsStore; db: BetterXDatabase; x: XDomAdapter; ui: UiPrimitives; runtime: RuntimeBridge; logger: Logger }
export interface BetterXPlugin { id: string; name: string; defaultEnabled: boolean; start(context: PluginContext): void | Promise<void>; stop(): void | Promise<void> }
