import "./styles.css";
import { defaults, migrateSettings, type BetterXSettings } from "../core/settings";

const app = document.querySelector<HTMLElement>("#app")!;

const featureMeta: Record<string, { label: string; description: string }> = {
  "quick-actions": { label: "Quick actions", description: "Block, mute, or dismiss from each post." },
  "sidebar-cleanup": { label: "Hide X sidebar", description: "Remove X's promotional sidebar from the timeline." },
  "fx-revival": { label: "FxTwitter revival", description: "Try to recover posts X fails to render." },
  "feed-rules": { label: "Local feed rules", description: "Hide or soften posts with local rules." },
  "ai-feed-filter": { label: "AI feed filter", description: "Classify posts through your configured provider." },
  "ai-reply": { label: "AI reply", description: "Generate an editable reply draft." },
  "composer-tools": { label: "Composer tools", description: "Keep writing aids close to the composer." },
  "smart-share": { label: "Smart share", description: "Copy an alternate link from a post menu." },
  rediscover: { label: "Bookmark rediscover", description: "Bring saved posts back into view." },
  "user-notes": { label: "Private user notes", description: "Keep local notes attached to profiles." },
  "country-flags": { label: "Country flags", description: "Show a region badge when public data supports it." },
  "timeline-filter": { label: "Timeline filter", description: "Choose which post types remain visible." },
  "time-machine": { label: "Profile time machine", description: "Search a profile within a date range." },
  "media-saver": { label: "Media saver", description: "Send direct media URLs to Chrome downloads." },
  "local-library": { label: "Local library", description: "Index posts encountered in this browser." },
  momentum: { label: "Momentum", description: "Keep a lightweight local reading rhythm." },
  "focus-mode": { label: "Focus mode", description: "Reduce visual noise while reading." },
  "notification-filters": { label: "Notification filters", description: "Reuse local rules on notifications." },
  "slop-indicator": { label: "Slop indicator", description: "Mark heuristic engagement-bait signals." },
  "archive-sync": { label: "Archive sync", description: "Reserved for a future explicit archive flow." }
};

function field<T extends HTMLElement>(id: string): T { return app.querySelector<T>(`#${id}`)!; }
function checked(id: string): boolean { return field<HTMLInputElement>(id).checked; }

function renderFeatureCards(settings: BetterXSettings): void {
  const root = field<HTMLElement>("features");
  for (const [id, enabled] of Object.entries(settings.features)) {
    const meta = featureMeta[id] ?? { label: id, description: "Optional Better X feature." };
    const label = document.createElement("label");
    label.className = "feature-card";
    label.innerHTML = `<span class="feature-toggle"><input type="checkbox" data-feature="${id}"><span class="toggle" aria-hidden="true"></span></span><span class="feature-copy"><strong>${meta.label}</strong><small>${meta.description}</small></span>`;
    label.querySelector<HTMLInputElement>("input")!.checked = enabled;
    root.append(label);
  }
}

function render(settings: BetterXSettings): void {
  app.innerHTML = `
    <header class="hero"><div><p class="eyebrow">LOCAL READING LAYER / SETTINGS</p><h1>Better <span>X</span></h1><p class="hero-copy">A quieter control surface for the timeline you actually want to read.</p></div><div class="hero-mark" aria-hidden="true"><span>BX</span><i></i><i></i><i></i></div></header>
    <div class="save-bar"><p id="saveStatus" role="status">Changes stay in this browser.</p><button class="button button-primary" id="save" type="button">Save changes</button></div>
    <section class="panel"><div class="section-heading"><p class="eyebrow">CONTROL SURFACE</p><h2>Features</h2><p>Turn on only the layers you want. Refresh an open X tab after saving.</p></div><div class="feature-grid" id="features"></div></section>
    <div class="settings-grid">
      <section class="panel"><div class="section-heading"><p class="eyebrow">POST ACTIONS</p><h2>Quick actions</h2><p>Keep the common decisions beside each post.</p></div><div class="check-list"><label><input id="block" type="checkbox"><span><strong>Block</strong><small>Ask before opening X's block action.</small></span></label><label><input id="notInterested" type="checkbox"><span><strong>Not interested</strong><small>Hide locally if X has no matching menu action.</small></span></label><label><input id="mute" type="checkbox"><span><strong>Mute</strong><small>Ask before opening X's mute action.</small></span></label></div></section>
      <section class="panel"><div class="section-heading"><p class="eyebrow">HOME TIMELINE</p><h2>Feed behavior</h2><p>Set the starting view and your first local rule set.</p></div><label class="field-label" for="defaultTab">Home tab<select id="defaultTab"><option value="for-you">For You</option><option value="following">Following</option><option value="remember">Remember last selected</option></select></label><div class="check-list compact"><label><input id="peekFiltered" type="checkbox"><span><strong>Show hidden post peek</strong></span></label><label><input id="showFilterReason" type="checkbox"><span><strong>Show filter reason</strong></span></label></div><label class="field-label" for="keywordRules">Hide keywords<textarea id="keywordRules" rows="4" placeholder="one keyword per line"></textarea><small>One keyword per line. Matching posts are hidden locally.</small></label></section>
      <section class="panel panel-wide"><div class="section-heading"><p class="eyebrow">OPTIONAL PROVIDER</p><h2>AI workspace</h2><p>AI runs through the background worker. It never submits posts or replies for you.</p></div><div class="field-grid"><label class="switch-row"><input id="aiEnabled" type="checkbox"><span><strong>Enable AI features</strong><small>Requires a provider, model, and API key.</small></span></label><label class="field-label" for="provider">Provider<select id="provider"><option value="openai-compatible">OpenAI-compatible</option><option value="openrouter">OpenRouter</option><option value="xai">xAI</option><option value="custom">Custom</option></select></label><label class="field-label" for="baseUrl">Base URL<input id="baseUrl" type="url" spellcheck="false"></label><label class="field-label" for="apiKey">API key<input id="apiKey" type="password" autocomplete="off" spellcheck="false"></label><label class="field-label" for="model">Model<input id="model" spellcheck="false"></label><label class="field-label field-wide" for="feedInstruction">Feed instruction<textarea id="feedInstruction" rows="4" placeholder="Example: hide obvious engagement bait; fail open when uncertain."></textarea></label><label class="field-label field-wide" for="stylePrompt">Reply style<textarea id="stylePrompt" rows="3" placeholder="Example: concise, warm, specific."></textarea></label></div></section>
      <section class="panel"><div class="section-heading"><p class="eyebrow">PROFILE CONTEXT</p><h2>Profiles</h2><p>Use public profile signals only. Turn on Country flags above to show badges.</p></div><div class="check-list"><label><input id="preferXRegion" type="checkbox"><span><strong>Prefer X account region</strong></span></label><label><input id="profileFallback" type="checkbox"><span><strong>Allow profile location fallback</strong></span></label></div></section>
      <section class="panel"><div class="section-heading"><p class="eyebrow">LOCAL ONLY</p><h2>Privacy</h2><p>These notes remain in the extension's local database.</p></div><label class="switch-row"><input id="privateNotes" type="checkbox"><span><strong>Use private notes for AI context</strong><small>Only include a note when you explicitly use an AI feature.</small></span></label></section>
      <section class="panel panel-wide"><div class="section-heading"><p class="eyebrow">OPTIONAL DETAIL</p><h2>Reading modes</h2><p>These controls are intentionally conservative and fail open.</p></div><div class="field-grid"><div class="check-list compact"><label><input id="timelineOriginals" type="checkbox"><span><strong>Original posts</strong></span></label><label><input id="timelineReplies" type="checkbox"><span><strong>Replies</strong></span></label><label><input id="timelineQuotes" type="checkbox"><span><strong>Quotes</strong></span></label><label><input id="timelineReposts" type="checkbox"><span><strong>Reposts</strong></span></label><label><input id="timelinePromoted" type="checkbox"><span><strong>Promoted posts</strong></span></label></div><div class="check-list compact"><label><input id="focusNoMetrics" type="checkbox"><span><strong>Hide metrics</strong></span></label><label><input id="focusNoTrending" type="checkbox"><span><strong>Hide trending</strong></span></label><label><input id="focusNoRecommendations" type="checkbox"><span><strong>Hide recommendations</strong></span></label><label><input id="focusReading" type="checkbox"><span><strong>Reading mode</strong></span></label></div></div></section>
    </div>`;

  renderFeatureCards(settings);
  field<HTMLInputElement>("block").checked = settings.quickActions.block;
  field<HTMLInputElement>("notInterested").checked = settings.quickActions.notInterested;
  field<HTMLInputElement>("mute").checked = settings.quickActions.mute;
  field<HTMLSelectElement>("defaultTab").value = settings.feed.defaultTab;
  field<HTMLInputElement>("peekFiltered").checked = settings.feed.peekFiltered;
  field<HTMLInputElement>("showFilterReason").checked = settings.feed.showFilterReason;
  field<HTMLTextAreaElement>("keywordRules").value = settings.feed.rules.filter((rule) => rule.kind === "keyword").map((rule) => rule.value).join("\n");
  field<HTMLInputElement>("aiEnabled").checked = settings.ai.enabled;
  field<HTMLSelectElement>("provider").value = settings.ai.provider;
  field<HTMLInputElement>("baseUrl").value = settings.ai.baseUrl;
  field<HTMLInputElement>("apiKey").value = settings.ai.apiKey;
  field<HTMLInputElement>("model").value = settings.ai.model;
  field<HTMLTextAreaElement>("feedInstruction").value = settings.ai.feedInstruction;
  field<HTMLTextAreaElement>("stylePrompt").value = settings.ai.stylePrompt;
  field<HTMLInputElement>("preferXRegion").checked = settings.countryFlags.preferXRegion;
  field<HTMLInputElement>("profileFallback").checked = settings.countryFlags.profileFallback;
  field<HTMLInputElement>("privateNotes").checked = settings.ai.usePrivateNotesForAI;
  field<HTMLInputElement>("timelineOriginals").checked = settings.timeline.originals;
  field<HTMLInputElement>("timelineReplies").checked = settings.timeline.replies;
  field<HTMLInputElement>("timelineQuotes").checked = settings.timeline.quotes;
  field<HTMLInputElement>("timelineReposts").checked = settings.timeline.reposts;
  field<HTMLInputElement>("timelinePromoted").checked = settings.timeline.promoted;
  field<HTMLInputElement>("focusNoMetrics").checked = settings.focus.noMetrics;
  field<HTMLInputElement>("focusNoTrending").checked = settings.focus.noTrending;
  field<HTMLInputElement>("focusNoRecommendations").checked = settings.focus.noRecommendations;
  field<HTMLInputElement>("focusReading").checked = settings.focus.readingMode;

  field<HTMLButtonElement>("save").addEventListener("click", async () => {
    const button = field<HTMLButtonElement>("save");
    const status = field<HTMLElement>("saveStatus");
    button.disabled = true;
    status.textContent = "Saving…";
    const features = { ...settings.features };
    app.querySelectorAll<HTMLInputElement>("input[data-feature]").forEach((input) => { features[input.dataset.feature!] = input.checked; });
    const keywords = field<HTMLTextAreaElement>("keywordRules").value.split("\n").map((value) => value.trim()).filter(Boolean);
    const rules = [...settings.feed.rules.filter((rule) => rule.kind !== "keyword"), ...keywords.map((value, index) => ({ id: `keyword-${index}`, kind: "keyword" as const, value, action: "hide" as const, reason: `Hidden keyword: ${value}`, updatedAt: Date.now() }))];
    try {
      const response = await chrome.runtime.sendMessage({ type: "settings.set", patch: { features, quickActions: { block: checked("block"), notInterested: checked("notInterested"), mute: checked("mute") }, feed: { ...settings.feed, defaultTab: field<HTMLSelectElement>("defaultTab").value as BetterXSettings["feed"]["defaultTab"], peekFiltered: checked("peekFiltered"), showFilterReason: checked("showFilterReason"), rules }, countryFlags: { ...settings.countryFlags, enabled: features["country-flags"] ?? false, preferXRegion: checked("preferXRegion"), profileFallback: checked("profileFallback") }, timeline: { originals: checked("timelineOriginals"), replies: checked("timelineReplies"), quotes: checked("timelineQuotes"), reposts: checked("timelineReposts"), promoted: checked("timelinePromoted") }, focus: { ...settings.focus, noMetrics: checked("focusNoMetrics"), noTrending: checked("focusNoTrending"), noRecommendations: checked("focusNoRecommendations"), readingMode: checked("focusReading") }, ai: { ...settings.ai, enabled: checked("aiEnabled"), apiKey: field<HTMLInputElement>("apiKey").value, usePrivateNotesForAI: checked("privateNotes"), provider: field<HTMLSelectElement>("provider").value as BetterXSettings["ai"]["provider"], baseUrl: field<HTMLInputElement>("baseUrl").value, model: field<HTMLInputElement>("model").value, feedInstruction: field<HTMLTextAreaElement>("feedInstruction").value, stylePrompt: field<HTMLTextAreaElement>("stylePrompt").value } } });
      if (!response.ok) throw new Error(response.message ?? "Could not save settings");
      status.textContent = "Saved. Refresh your open X tabs to apply it.";
    } catch (error) { status.textContent = error instanceof Error ? error.message : "Could not save settings"; }
    finally { button.disabled = false; }
  });
}

async function start(): Promise<void> {
  try {
    const response = await chrome.runtime.sendMessage({ type: "settings.get" }) as { ok: boolean; value?: unknown };
    render(migrateSettings(response.ok ? response.value as Partial<BetterXSettings> : defaults));
  } catch (error) {
    app.innerHTML = `<section class="panel error-panel"><p class="eyebrow">SETTINGS UNAVAILABLE</p><h1>Better X</h1><p>${error instanceof Error ? error.message : "The extension worker is not responding."}</p></section>`;
  }
}

void start();
