import "./styles.css";
import { defaults, migrateSettings, type BetterXSettings } from "../core/settings";

const app = document.querySelector<HTMLElement>("#app")!;
const embedded = new URLSearchParams(location.search).get("embedded") === "1";
document.body.classList.toggle("embedded", embedded);

const featureMeta: Record<string, { label: string; description: string }> = {
  "quick-actions": { label: "Quick actions", description: "Block, mute, or dismiss from each post." },
  "sidebar-cleanup": { label: "Clean X chrome", description: "Remove the promotional sidebar and unwanted navigation." },
  "hide-grok": { label: "Hide Grok", description: "Remove Grok navigation and post actions." },
  "advanced-search": { label: "Advanced search", description: "Build native X searches without memorising operators." },
  "fx-revival": { label: "FxTwitter revival", description: "Recover public posts that X fails to render." },
  "feed-rules": { label: "Local feed rules", description: "Hide or soften posts using local rules." },
  "ai-feed-filter": { label: "AI feed filter", description: "Classify posts through your configured provider." },
  "ai-reply": { label: "AI reply", description: "Generate an editable reply draft." },
  "composer-tools": { label: "Composer tools", description: "Keep writing aids close to the composer." },
  "smart-share": { label: "Smart share", description: "Copy FxTwitter embeds from X menus." },
  rediscover: { label: "Bookmark rediscover", description: "Bring saved posts back into view." },
  "user-notes": { label: "Private user notes", description: "Keep local notes attached to profiles." },
  "country-flags": { label: "Country flags", description: "Show an inline flag when public region data supports it." },
  "timeline-filter": { label: "Timeline filter", description: "Choose which post types remain visible." },
  "time-machine": { label: "Profile time machine", description: "Search a profile within a date range." },
  "media-saver": { label: "Media saver", description: "Download post media from the native menu." },
  "local-library": { label: "Local library", description: "Index posts encountered in this browser." },
  momentum: { label: "Momentum", description: "Keep a lightweight local reading rhythm." },
  "focus-mode": { label: "Focus mode", description: "Reduce visual noise while reading." },
  "notification-filters": { label: "Notification filters", description: "Reuse local rules on notifications." },
  "slop-indicator": { label: "Slop indicator", description: "Mark heuristic engagement-bait signals." },
  "archive-sync": { label: "Archive sync", description: "Keep this experimental archive flow disabled unless needed." }
};

function field<T extends HTMLElement>(id: string): T { return app.querySelector<T>(`#${id}`)!; }
function checked(id: string): boolean { return field<HTMLInputElement>(id).checked; }
function toggleRow(id: string, label: string, description = ""): string { return `<label class="setting-row"><span class="setting-copy"><strong>${label}</strong>${description ? `<small>${description}</small>` : ""}</span><span class="switch"><input id="${id}" type="checkbox"><i aria-hidden="true"></i></span></label>`; }

function renderFeatures(settings: BetterXSettings): void {
  const root = field<HTMLElement>("features");
  for (const [id, enabled] of Object.entries(settings.features)) {
    const meta = featureMeta[id] ?? { label: id, description: "Optional Better X feature." };
    const row = document.createElement("label");
    row.className = "setting-row feature-row";
    row.innerHTML = `<span class="setting-copy"><strong>${meta.label}</strong><small>${meta.description}</small></span><span class="switch"><input type="checkbox" data-feature="${id}"><i aria-hidden="true"></i></span>`;
    row.querySelector<HTMLInputElement>("input")!.checked = enabled;
    root.append(row);
  }
}

function render(settings: BetterXSettings): void {
  document.body.classList.toggle("liquid-glass", !embedded && settings.appearance.liquidGlass);
  document.documentElement.style.setProperty("--accent", settings.appearance.accentColor);
  const title = embedded ? '<p class="embedded-status" id="saveStatus" role="status">Changes save automatically.</p>' : '<header class="settings-title"><div><h1>Better X</h1><p>Control how X looks and behaves in this browser.</p></div><p id="saveStatus" role="status">Changes save automatically.</p></header>';
  app.innerHTML = `${title}
    <section class="settings-section"><div class="section-title"><h2>Appearance</h2></div><div class="settings-list">
      <div class="setting-row accent-row"><label class="setting-copy" for="accentColor"><strong>Accent color</strong><small>Used by Better X controls, focus rings, and glass edges.</small></label><div class="accent-controls"><input id="accentColor" type="color" aria-label="Custom accent color"><div class="accent-presets" aria-label="Accent presets">${["#1D9BF0", "#7856FF", "#F91880", "#00BA7C", "#FF7A00"].map((color) => `<button type="button" data-accent="${color}" style="--swatch:${color}" aria-label="Use ${color}"></button>`).join("")}</div></div></div>
      <label class="setting-row"><span class="setting-copy"><strong>Liquid glass</strong><small>Add translucency only to Better X surfaces.</small></span><span class="switch"><input id="liquidGlass" type="checkbox"><i aria-hidden="true"></i></span></label>
      <label class="setting-row"><span class="setting-copy"><strong>Brand icon</strong><small>Choose the mark shown at the top of X.</small></span><select id="brandIcon"><option value="bird">Twitter bird</option><option value="x">X</option></select></label>
    </div></section>
    <section class="settings-section"><div class="section-title"><h2>Features</h2></div><div class="settings-list" id="features"></div></section>
    <section class="settings-section"><div class="section-title"><h2>Post actions</h2></div><div class="settings-list">
      ${toggleRow("block", "Block", "Open X's block action directly.")}${toggleRow("notInterested", "Not interested", "Hide locally if X has no matching action.")}${toggleRow("mute", "Mute", "Open X's mute action directly.")}
      <label class="setting-row"><span class="setting-copy"><strong>Copied links</strong><small>Choose the domain used by Copy link.</small></span><select id="sharingPreferred"><option value="fxtwitter">FxTwitter embed</option><option value="original">Original X link</option><option value="vxtwitter">VxTwitter embed</option></select></label>
    </div></section>
    <section class="settings-section"><div class="section-title"><h2>Home timeline</h2></div><div class="settings-list fields">
      <label>Home tab<select id="defaultTab"><option value="for-you">For You</option><option value="following">Following</option><option value="remember">Remember last selected</option></select></label>
      ${toggleRow("peekFiltered", "Show hidden post peek")}${toggleRow("showFilterReason", "Show filter reason")}
      <label>Hide keywords<textarea id="keywordRules" rows="4" placeholder="one keyword per line"></textarea><small>One keyword per line. Matching posts are hidden locally.</small></label>
    </div></section>
    <section class="settings-section"><div class="section-title"><h2>AI provider</h2></div><div class="settings-list fields">
      ${toggleRow("aiEnabled", "Enable AI features", "Requires a provider, model, and API key.")}
      <label>Provider<select id="provider"><option value="openai-compatible">OpenAI-compatible</option><option value="openrouter">OpenRouter</option><option value="xai">xAI</option><option value="custom">Custom</option></select></label>
      <label>Base URL<input id="baseUrl" type="url" spellcheck="false"></label><label>API key<input id="apiKey" type="password" autocomplete="off" spellcheck="false"></label><label>Model<input id="model" type="text" spellcheck="false"></label>
      <label>Feed instruction<textarea id="feedInstruction" rows="4" placeholder="Hide obvious engagement bait; fail open when uncertain."></textarea></label><label>Reply style<textarea id="stylePrompt" rows="3" placeholder="Concise, warm, specific."></textarea></label>
      ${toggleRow("privateNotes", "Use private notes for AI context", "Only when you explicitly invoke an AI feature.")}
    </div></section>
    <section class="settings-section"><div class="section-title"><h2>Profiles and reading</h2></div><div class="settings-list">
      ${toggleRow("preferXRegion", "Prefer X account region")}${toggleRow("profileFallback", "Allow profile location fallback")}
      ${toggleRow("timelineOriginals", "Original posts")}${toggleRow("timelineReplies", "Replies")}${toggleRow("timelineQuotes", "Quotes")}${toggleRow("timelineReposts", "Reposts")}${toggleRow("timelinePromoted", "Promoted posts")}
      ${toggleRow("focusNoMetrics", "Hide metrics")}${toggleRow("focusNoTrending", "Hide trending")}${toggleRow("focusNoRecommendations", "Hide recommendations")}${toggleRow("focusReading", "Reading mode")}
    </div></section>`;

  renderFeatures(settings);
  field<HTMLInputElement>("accentColor").value = settings.appearance.accentColor;
  field<HTMLInputElement>("liquidGlass").checked = settings.appearance.liquidGlass;
  field<HTMLSelectElement>("brandIcon").value = settings.appearance.brandIcon;
  field<HTMLInputElement>("block").checked = settings.quickActions.block;
  field<HTMLInputElement>("notInterested").checked = settings.quickActions.notInterested;
  field<HTMLInputElement>("mute").checked = settings.quickActions.mute;
  field<HTMLSelectElement>("sharingPreferred").value = settings.sharing.preferred;
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

  let revision = 0;
  const save = async () => {
    const currentRevision = ++revision;
    const status = field<HTMLElement>("saveStatus");
    status.textContent = "Saving…";
    const features = { ...settings.features };
    app.querySelectorAll<HTMLInputElement>("input[data-feature]").forEach((input) => { features[input.dataset.feature!] = input.checked; });
    const keywords = field<HTMLTextAreaElement>("keywordRules").value.split("\n").map((value) => value.trim()).filter(Boolean);
    const rules = [...settings.feed.rules.filter((rule) => rule.kind !== "keyword"), ...keywords.map((value, index) => ({ id: `keyword-${index}`, kind: "keyword" as const, value, action: "hide" as const, reason: `Hidden keyword: ${value}`, updatedAt: Date.now() }))];
    const appearance = { accentColor: field<HTMLInputElement>("accentColor").value.toUpperCase(), liquidGlass: checked("liquidGlass"), brandIcon: field<HTMLSelectElement>("brandIcon").value as BetterXSettings["appearance"]["brandIcon"] };
    document.body.classList.toggle("liquid-glass", !embedded && appearance.liquidGlass);
    document.documentElement.style.setProperty("--accent", appearance.accentColor);
    try {
      const response = await chrome.runtime.sendMessage({ type: "settings.set", patch: { features, appearance, sharing: { preferred: field<HTMLSelectElement>("sharingPreferred").value as BetterXSettings["sharing"]["preferred"] }, quickActions: { block: checked("block"), notInterested: checked("notInterested"), mute: checked("mute") }, feed: { ...settings.feed, defaultTab: field<HTMLSelectElement>("defaultTab").value as BetterXSettings["feed"]["defaultTab"], peekFiltered: checked("peekFiltered"), showFilterReason: checked("showFilterReason"), rules }, countryFlags: { ...settings.countryFlags, enabled: features["country-flags"] ?? false, preferXRegion: checked("preferXRegion"), profileFallback: checked("profileFallback") }, timeline: { originals: checked("timelineOriginals"), replies: checked("timelineReplies"), quotes: checked("timelineQuotes"), reposts: checked("timelineReposts"), promoted: checked("timelinePromoted") }, focus: { ...settings.focus, noMetrics: checked("focusNoMetrics"), noTrending: checked("focusNoTrending"), noRecommendations: checked("focusNoRecommendations"), readingMode: checked("focusReading") }, ai: { ...settings.ai, enabled: checked("aiEnabled"), apiKey: field<HTMLInputElement>("apiKey").value, usePrivateNotesForAI: checked("privateNotes"), provider: field<HTMLSelectElement>("provider").value as BetterXSettings["ai"]["provider"], baseUrl: field<HTMLInputElement>("baseUrl").value, model: field<HTMLInputElement>("model").value, feedInstruction: field<HTMLTextAreaElement>("feedInstruction").value, stylePrompt: field<HTMLTextAreaElement>("stylePrompt").value } } }) as { ok: boolean; value?: BetterXSettings; message?: string };
      if (!response.ok) throw new Error(response.message ?? "Could not save settings");
      if (currentRevision === revision) status.textContent = "Saved · Reload X to apply feature changes.";
      if (embedded) window.parent.postMessage({ type: "better-x:appearance", appearance }, "*");
    } catch (error) { if (currentRevision === revision) status.textContent = error instanceof Error ? error.message : "Could not save settings"; }
  };
  app.addEventListener("change", () => void save());
  app.querySelectorAll<HTMLButtonElement>("[data-accent]").forEach((button) => button.addEventListener("click", () => {
    field<HTMLInputElement>("accentColor").value = button.dataset.accent!;
    field<HTMLInputElement>("accentColor").dispatchEvent(new Event("change", { bubbles: true }));
  }));
}

async function start(): Promise<void> {
  try {
    const response = await chrome.runtime.sendMessage({ type: "settings.get" }) as { ok: boolean; value?: unknown };
    render(migrateSettings(response.ok ? response.value as Partial<BetterXSettings> : defaults));
  } catch (error) {
    app.innerHTML = `<section class="settings-section error"><h1>Better X</h1><p>${error instanceof Error ? error.message : "The extension worker is not responding."}</p></section>`;
  }
}

void start();
