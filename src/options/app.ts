import { defaults, migrateSettings } from "../core/settings";

const app = document.querySelector<HTMLElement>("#app")!;

async function render(): Promise<void> {
  const response = await chrome.runtime.sendMessage({ type: "settings.get" }) as { ok: boolean; value?: unknown };
  const settings = migrateSettings(response.ok ? response.value as never : defaults);
  app.innerHTML = `<h1>Better X</h1><section><h2>General</h2><div id="features"></div></section><section><h2>Quick actions</h2><label><input id="block" type="checkbox"> Block</label><label><input id="notInterested" type="checkbox"> Not interested</label><label><input id="mute" type="checkbox"> Mute</label></section><section><h2>Feed</h2><label>Home tab <select id="defaultTab"><option value="for-you">For You</option><option value="following">Following</option><option value="remember">Remember last selected</option></select></label><label><input id="peekFiltered" type="checkbox"> Show hidden post peek</label><label><input id="showFilterReason" type="checkbox"> Show filter reason</label></section><section><h2>AI</h2><label><input id="aiEnabled" type="checkbox"> Enable AI</label><label>Provider <select id="provider"><option value="openai-compatible">OpenAI-compatible</option><option value="openrouter">OpenRouter</option><option value="xai">xAI</option><option value="custom">Custom</option></select></label><label>Base URL <input id="baseUrl" type="url"></label><label>API key <input id="apiKey" type="password" autocomplete="off"></label><label>Model <input id="model"></label><label>Feed rule <textarea id="feedInstruction"></textarea></label><label>Reply style <textarea id="stylePrompt"></textarea></label></section><section><h2>Profiles</h2><label><input id="countryEnabled" type="checkbox"> Country flags</label><label><input id="preferXRegion" type="checkbox"> Prefer X account region</label><label><input id="profileFallback" type="checkbox"> Allow profile location fallback</label></section><section><h2>Privacy</h2><label><input id="privateNotes" type="checkbox"> Use private notes for AI context</label></section><button id="save">Save</button>`;
  const featureRoot = app.querySelector("#features")!;
  for (const [id, enabled] of Object.entries(settings.features)) { const label = document.createElement("label"); const input = document.createElement("input"); input.type = "checkbox"; input.dataset.feature = id; input.checked = enabled; label.append(input, ` ${id}`); featureRoot.append(label); }
  (app.querySelector("#provider") as HTMLSelectElement).value = settings.ai.provider;
  (app.querySelector("#baseUrl") as HTMLInputElement).value = settings.ai.baseUrl;
  (app.querySelector("#model") as HTMLInputElement).value = settings.ai.model;
  (app.querySelector("#feedInstruction") as HTMLTextAreaElement).value = settings.ai.feedInstruction;
  (app.querySelector("#apiKey") as HTMLInputElement).value = settings.ai.apiKey;
  (app.querySelector("#stylePrompt") as HTMLTextAreaElement).value = settings.ai.stylePrompt;
  (app.querySelector("#aiEnabled") as HTMLInputElement).checked = settings.ai.enabled;
  (app.querySelector("#block") as HTMLInputElement).checked = settings.quickActions.block;
  (app.querySelector("#notInterested") as HTMLInputElement).checked = settings.quickActions.notInterested;
  (app.querySelector("#mute") as HTMLInputElement).checked = settings.quickActions.mute;
  (app.querySelector("#defaultTab") as HTMLSelectElement).value = settings.feed.defaultTab;
  (app.querySelector("#peekFiltered") as HTMLInputElement).checked = settings.feed.peekFiltered;
  (app.querySelector("#showFilterReason") as HTMLInputElement).checked = settings.feed.showFilterReason;
  (app.querySelector("#countryEnabled") as HTMLInputElement).checked = settings.countryFlags.enabled;
  (app.querySelector("#preferXRegion") as HTMLInputElement).checked = settings.countryFlags.preferXRegion;
  (app.querySelector("#profileFallback") as HTMLInputElement).checked = settings.countryFlags.profileFallback;
  (app.querySelector("#privateNotes") as HTMLInputElement).checked = settings.ai.usePrivateNotesForAI;
  app.querySelector("#save")?.addEventListener("click", () => { const features = { ...settings.features }; featureRoot.querySelectorAll<HTMLInputElement>("input[data-feature]").forEach((input) => { features[input.dataset.feature!] = input.checked; }); const checked = (id: string) => (app.querySelector(`#${id}`) as HTMLInputElement).checked; void chrome.runtime.sendMessage({ type: "settings.set", patch: { features, quickActions: { block: checked("block"), notInterested: checked("notInterested"), mute: checked("mute") }, feed: { ...settings.feed, defaultTab: (app.querySelector("#defaultTab") as HTMLSelectElement).value, peekFiltered: checked("peekFiltered"), showFilterReason: checked("showFilterReason") }, countryFlags: { ...settings.countryFlags, enabled: checked("countryEnabled"), preferXRegion: checked("preferXRegion"), profileFallback: checked("profileFallback") }, ai: { ...settings.ai, enabled: checked("aiEnabled"), apiKey: (app.querySelector("#apiKey") as HTMLInputElement).value, usePrivateNotesForAI: checked("privateNotes"), provider: (app.querySelector("#provider") as HTMLSelectElement).value, baseUrl: (app.querySelector("#baseUrl") as HTMLInputElement).value, model: (app.querySelector("#model") as HTMLInputElement).value, feedInstruction: (app.querySelector("#feedInstruction") as HTMLTextAreaElement).value, stylePrompt: (app.querySelector("#stylePrompt") as HTMLTextAreaElement).value } } }); });
}

void render();
