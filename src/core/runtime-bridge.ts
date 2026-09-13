export type ExtensionRequest =
  | { type: "settings.get" }
  | { type: "settings.set"; patch: unknown }
  | { type: "settings.reset"; section?: string }
  | { type: "fx.status"; statusId: string }
  | { type: "fx.profile"; handle: string }
  | { type: "ai.generate"; request: unknown }
  | { type: "media.resolve"; post: unknown }
  | { type: "media.download"; media: unknown }
  | { type: "db.read"; store: string; query?: unknown }
  | { type: "db.write"; store: string; operation: { type: "put" | "delete"; value?: unknown; key?: IDBValidKey } };

export const runtime = { request<T>(request: ExtensionRequest): Promise<T> { return chrome.runtime.sendMessage(request) as Promise<T>; } };
