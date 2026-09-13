import { normalizeFxResponse, type FxResult } from "../features/fx-revival/normalizer";

export async function fetchFxStatus(statusId: string, fetcher: typeof fetch = fetch): Promise<FxResult> {
  if (!/^\d{2,20}$/.test(statusId)) throw new Error("Invalid status ID");
  const response = await fetcher(`https://api.fxtwitter.com/2/status/${statusId}`, { headers: { accept: "application/json" } });
  const text = await response.text();
  let body: unknown;
  try { body = JSON.parse(text); } catch { throw new Error("FxTwitter returned non-JSON"); }
  return normalizeFxResponse(body);
}

export async function fetchFxProfile(handle: string, fetcher: typeof fetch = fetch): Promise<unknown> {
  if (!/^[A-Za-z0-9_]{1,15}$/.test(handle)) throw new Error("Invalid handle");
  const response = await fetcher(`https://api.fxtwitter.com/2/profile/${encodeURIComponent(handle)}?about_account=1`, { headers: { accept: "application/json" } });
  const body = await response.json() as { code?: number; user?: unknown };
  if (body.code !== 200) throw new Error("FxTwitter profile request failed");
  return body.user;
}
