import { fetchFxProfile, fetchFxStatus } from "./fx-client";
import { ChromeSettingsStore } from "../core/settings-store";
import { IndexedDb } from "../storage/database";
import { chooseMedia, type MediaCandidates } from "../features/media-saver/resolver";

const settings = new ChromeSettingsStore();
const db = new IndexedDb();

void chrome.storage.local.setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" });

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), timeoutMs));
  return Promise.race([promise, timeout]);
}

async function generate(request: { baseUrl: string; apiKey: string; model: string; temperature: number; timeoutMs: number; customHeaders?: Record<string, string>; messages: Array<{ role: string; content: string }> }): Promise<unknown> {
  const base = new URL(request.baseUrl);
  if (base.protocol !== "https:") throw new Error("AI endpoint must use HTTPS");
  if (!request.apiKey) throw new Error("AI is not configured");
  const endpoint = new URL("chat/completions", `${base.toString().replace(/\/$/, "")}/`).toString();
  const response = await withTimeout(fetch(endpoint, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${request.apiKey}`, ...request.customHeaders }, body: JSON.stringify({ model: request.model, temperature: request.temperature, messages: request.messages }) }), request.timeoutMs);
  if (!response.ok) throw new Error(`AI provider HTTP ${response.status}`);
  const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return body.choices?.[0]?.message?.content ?? "";
}

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  void (async () => {
    try {
      const request = message as Record<string, unknown>;
      switch (request.type) {
        case "settings.get": sendResponse({ ok: true, value: await settings.get() }); break;
        case "settings.set": sendResponse({ ok: true, value: await settings.patch(request.patch as never) }); break;
        case "settings.reset": sendResponse({ ok: true, value: await settings.reset(request.section as string | undefined) }); break;
        case "fx.status": sendResponse({ ok: true, value: await fetchFxStatus(String(request.statusId)) }); break;
        case "fx.profile": sendResponse({ ok: true, value: await fetchFxProfile(String(request.handle)) }); break;
        case "ai.generate": { const ai = (await settings.get()).ai; sendResponse({ ok: true, value: await generate({ ...ai, ...(request.request as object) } as never) }); break; }
        case "media.resolve": { const candidates = request.post as MediaCandidates; sendResponse({ ok: true, value: chooseMedia(candidates) }); break; }
        case "media.download": { if (!(await chrome.permissions.contains({ permissions: ["downloads"] }))) throw new Error("downloads permission required"); const media = request.media as { url?: string; filename?: string }; if (!media.url || !/^https?:/.test(media.url)) throw new Error("Invalid media URL"); sendResponse({ ok: true, value: await chrome.downloads.download({ url: media.url, filename: media.filename, saveAs: true }) }); break; }
        case "db.read": sendResponse({ ok: true, value: await db.all(String(request.store)) }); break;
        case "db.write": { const operation = request.operation as { type: "put" | "delete"; value?: unknown; key?: IDBValidKey }; if (operation.type === "put") await db.put(String(request.store), operation.value); else if (operation.type === "delete" && operation.key !== undefined) await db.delete(String(request.store), operation.key); else throw new Error("Invalid database operation"); sendResponse({ ok: true, value: true }); break; }
        default: sendResponse({ ok: false, code: "UNKNOWN_MESSAGE", message: "Unsupported request" });
      }
    } catch (error) { sendResponse({ ok: false, code: "REQUEST_FAILED", message: error instanceof Error ? error.message : "Request failed" }); }
  })();
  return true;
});
