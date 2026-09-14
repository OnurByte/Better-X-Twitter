export function shareUrl(original: string, target: "original" | "fxtwitter" | "vxtwitter"): string {
  if (target === "original") return original;
  try {
    const url = new URL(original);
    if (!/^(?:www\.)?(?:x|twitter)\.com$/i.test(url.hostname)) return original;
    url.protocol = "https:";
    url.hostname = `${target}.com`;
    url.port = "";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch { return original; }
}
export function buildSearchUrl(handle: string, from: string, until: string): string { const query = `from:${handle.replace(/^@/, "")} since:${from} until:${until}`; return `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query`; }
