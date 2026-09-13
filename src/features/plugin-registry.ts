import type { BetterXPlugin, PluginContext } from "../core/plugin";
import { injectQuickActions } from "./quick-actions";
import { evaluateRules } from "./feed-rules/rules";
import type { ParsedPost } from "../x/types";
import { applyTimelineFilter } from "./timeline-filter/apply";
import { applyFocusMode } from "./focus-mode/apply";
import { attachReplyTool } from "./ai-reply/ui";
import { resolveCountry } from "./country-flags/resolver";
import { appendCountryBadge } from "./country-flags/ui";
import { isBookmarkRoute, bookmarkRecord } from "./bookmarks/capture";
import { startAIFeedFilter } from "./ai-feed-filter/plugin";
import { installOverflowMenu } from "./overflow-menu";
import { installProfileTools } from "./profile-tools";
import { renderRediscover } from "./rediscover/render";
import { filterNotification } from "./notification-filters/filter";
import { applyDefaultFeed } from "./default-feed/apply";
import { observeRoutes } from "../x/route-observer";
import { installXActionIcons } from "../x/icon-replacer";

function onPosts(context: PluginContext, handler: (post: ParsedPost) => void): () => void { return context.events.on("POST_DISCOVERED", (value) => { if (value) handler(value as ParsedPost); }); }

export function contentPlugins(): BetterXPlugin[] {
  return [
    { id: "x-action-icons", name: "X Action Icons", defaultEnabled: true, start() { installXActionIcons(); }, stop() {} },
    { id: "quick-actions", name: "Quick Actions", defaultEnabled: true, start(context) { return context.settings.get().then((settings) => { const stop = onPosts(context, (post) => injectQuickActions(post, context.x, settings.quickActions, context.ui.toast)); context.events.on("SETTINGS_CHANGED", () => undefined); void stop; }); }, stop() {} },
    { id: "feed-rules", name: "Local Feed Rules", defaultEnabled: true, start(context) { return context.settings.get().then((settings) => { onPosts(context, (post) => { const decision = evaluateRules(post, settings.feed.rules); if (decision.action === "hide") post.element.hidden = true; if (decision.action === "reduce") post.element.style.opacity = "0.55"; }); }); }, stop() {} },
    { id: "fx-revival", name: "FxTwitter Revival", defaultEnabled: true, start(context) { return context.settings.get().then((settings) => { if (!settings.features["fx-revival"]) return; onPosts(context, (post) => { if (!post.statusId || !/unavailable|suspended|failed to load|blocked/i.test(post.element.textContent ?? "")) return; void context.runtime.request({ type: "fx.status", statusId: post.statusId }).then((response: unknown) => { const result = response as { ok?: boolean; value?: { kind: string; post?: { text: string; author: { handle?: string } } } }; if (!result.ok || result.value?.kind !== "success" || !result.value.post) return; const card = document.createElement("div"); card.dataset.bxRecovered = "true"; card.className = "bx-recovered"; card.textContent = `Recovered by Better X · @${result.value.post.author.handle ?? "unknown"}: ${result.value.post.text}`; post.element.replaceChildren(card); }).catch(() => {}); }); }); }, stop() {} },
    { id: "timeline-filter", name: "Timeline Filters", defaultEnabled: false, start(context) { return context.settings.get().then((settings) => { onPosts(context, (post) => applyTimelineFilter(post, settings.timeline)); }); }, stop() {} },
    { id: "country-flags", name: "Country Flags", defaultEnabled: false, start(context) { const cache = new Map<string, ReturnType<typeof resolveCountry>>(); return context.settings.get().then((settings) => { if (!settings.features["country-flags"]) return; onPosts(context, (post) => { const handle = post.author.handle?.toLowerCase(); if (!handle) return; const cached = cache.get(handle); if (cached) { appendCountryBadge(post.element, cached); return; } void context.runtime.request({ type: "fx.profile", handle }).then((response: unknown) => { const result = response as { ok?: boolean; value?: { about_account?: { based_in?: string }; location?: string } }; if (!result.ok || !result.value) return; const country = resolveCountry(result.value, handle); cache.set(handle, country); appendCountryBadge(post.element, country); }).catch(() => {}); }); }); }, stop() {} },
    { id: "ai-feed-filter", name: "AI Feed Filter", defaultEnabled: false, start(context) { return context.settings.get().then((settings) => { if (settings.ai.enabled && settings.ai.feedInstruction) startAIFeedFilter(context, settings.ai.feedInstruction); }); }, stop() {} },
    { id: "ai-reply", name: "AI Reply", defaultEnabled: false, start(context) { return context.settings.get().then((settings) => { if (!settings.ai.enabled) return; const attach = () => { const composer = context.x.findComposer(); if (composer) attachReplyTool(composer, context.runtime, settings.ai.stylePrompt); }; const observer = new MutationObserver(attach); observer.observe(document.body, { childList: true, subtree: true }); attach(); }); }, stop() {} },
    { id: "rediscover", name: "Bookmark Rediscover", defaultEnabled: false, start(context) { return context.settings.get().then((settings) => { if (!settings.rediscover.enabled) return; onPosts(context, (post) => { if (isBookmarkRoute()) void context.runtime.request({ type: "db.write", store: "bookmarks", operation: { type: "put", value: bookmarkRecord(post) } }); }); if (!isBookmarkRoute()) void renderRediscover(context.runtime, settings.rediscover.sessionLimit); }); }, stop() {} },
    { id: "local-library", name: "Local Library", defaultEnabled: false, start(context) { return context.settings.get().then((settings) => { if (!settings.features["local-library"]) return; onPosts(context, (post) => { void context.runtime.request({ type: "db.write", store: "library_entries", operation: { type: "put", value: { id: post.statusId ?? post.identity.contentHash, text: post.text, handle: post.author.handle, url: post.url, encounteredAt: Date.now() } } }); }); }); }, stop() {} },
    { id: "smart-share", name: "Smart Share", defaultEnabled: true, start(context) { return context.settings.get().then(() => { installOverflowMenu(context, { share: true, media: false }); }); }, stop() {} },
    { id: "media-saver", name: "Media Saver", defaultEnabled: false, start(context) { return context.settings.get().then(() => { installOverflowMenu(context, { share: false, media: true }); }); }, stop() {} },
    { id: "user-notes", name: "Private User Notes", defaultEnabled: false, start(context) { return context.settings.get().then(() => { installProfileTools(context, { notes: true, timeMachine: false }); }); }, stop() {} },
    { id: "time-machine", name: "Profile Time Machine", defaultEnabled: false, start(context) { return context.settings.get().then(() => { installProfileTools(context, { notes: false, timeMachine: true }); }); }, stop() {} },
    { id: "notification-filters", name: "Notification Filters", defaultEnabled: false, start(context) { return context.settings.get().then((settings) => { onPosts(context, (post) => { if (/\/notifications/.test(location.pathname)) filterNotification(post, settings.feed.rules); }); }); }, stop() {} },
    { id: "focus-mode", name: "Focus Mode", defaultEnabled: false, start(context) { return context.settings.get().then((settings) => { applyFocusMode(settings.focus); }); }, stop() {} },
    { id: "default-feed", name: "Default Feed", defaultEnabled: true, start(context) { return context.settings.get().then((settings) => { applyDefaultFeed(settings.feed.defaultTab); observeRoutes(() => applyDefaultFeed(settings.feed.defaultTab)); }); }, stop() {} }
  ];
}
