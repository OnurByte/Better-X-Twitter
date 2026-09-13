import { heroIcon } from "../ui/icons";

export interface AdvancedSearchValues {
  allWords: string;
  exactPhrase: string;
  anyWords: string;
  noneWords: string;
  from: string;
  to: string;
  mentioning: string;
  hashtags: string;
  language: string;
  since: string;
  until: string;
  minReplies: string;
  minLikes: string;
  minReposts: string;
  media: string;
  verified: boolean;
  following: boolean;
  replies: boolean;
  retweets: boolean;
}

function list(value: string): string[] {
  return value.split(/[\s,]+/).map((item) => item.trim()).filter(Boolean);
}

function phrase(value: string): string {
  const clean = value.trim().replaceAll('"', "");
  return clean ? (/[\s]/.test(clean) ? `"${clean}"` : clean) : "";
}

function users(value: string, operator: "from" | "to"): string[] {
  return list(value).map((item) => `${operator}:${item.replace(/^@/, "")}`);
}

export function buildAdvancedSearchQuery(values: AdvancedSearchValues): string {
  const parts = [
    values.allWords.trim(),
    values.exactPhrase.trim() ? `"${values.exactPhrase.trim().replaceAll('"', "")}"` : "",
    list(values.anyWords).length > 1 ? `(${list(values.anyWords).map(phrase).join(" OR ")})` : phrase(values.anyWords),
    list(values.noneWords).map((item) => `-${phrase(item)}`).join(" "),
    ...users(values.from, "from"),
    ...users(values.to, "to"),
    ...list(values.mentioning).map((item) => `@${item.replace(/^@/, "")}`),
    ...list(values.hashtags).map((item) => `#${item.replace(/^#/, "")}`),
    values.language.trim() ? `lang:${values.language.trim().toLowerCase()}` : "",
    values.media && values.media !== "any" ? `filter:${values.media}` : "",
    values.verified ? "filter:verified" : "",
    values.following ? "filter:follows" : "",
    values.replies ? "filter:replies" : "",
    values.retweets ? "filter:nativeretweets" : "",
    values.minReplies.trim() ? `min_replies:${values.minReplies.trim()}` : "",
    values.minLikes.trim() ? `min_faves:${values.minLikes.trim()}` : "",
    values.minReposts.trim() ? `min_retweets:${values.minReposts.trim()}` : "",
    values.since.trim() ? `since:${values.since.trim()}` : "",
    values.until.trim() ? `until:${values.until.trim()}` : ""
  ];
  return parts.filter(Boolean).join(" ");
}

export function buildAdvancedSearchUrl(query: string, origin = "https://x.com"): string {
  return `${origin.replace(/\/$/, "")}/search?q=${encodeURIComponent(query)}&src=typed_query`;
}

export function replaceExploreWithSearch(root: ParentNode = document): void {
  root.querySelectorAll<HTMLAnchorElement>('a[href="/explore"], a[href^="/explore?"], a[data-testid="AppTabBar_Explore_Link"], a[aria-label="Explore"]').forEach((link) => {
    link.setAttribute("href", "/search");
    link.setAttribute("aria-label", "Search");
    link.dataset.testid = "AppTabBar_Search_Link";
    const label = Array.from(link.querySelectorAll<HTMLElement>("span")).find((span) => span.textContent?.trim() === "Explore");
    if (label) label.textContent = "Search";
    else if (link.textContent?.trim() === "Explore") link.textContent = "Search";
  });
}

const searchMarkup = `<section class="bx-search-page" data-bx-advanced-search><div class="bx-search-shell"><form class="bx-search-form"><div class="bx-search-main"><span class="bx-search-icon" aria-hidden="true"></span><input id="bx-search-all-words" name="allWords" type="search" autocomplete="off" aria-label="Search X" placeholder="Search posts, accounts, or topics"><button class="bx-search-submit" type="submit">Search</button></div><div class="bx-search-examples"><p>Try a search</p><button type="button" data-bx-search-example='("15 Temmuz" OR darbe OR coup) since:2016-07-15_15:00:00_UTC until:2016-07-15_21:00:00_UTC min_faves:1000'><span><strong>15 July 2016 · evening hits</strong><small>18:00–23:59 Turkey time · at least 1,000 likes</small></span><code>("15 Temmuz" OR darbe OR coup) min_faves:1000</code></button><button type="button" data-bx-search-example="from:NASA filter:images min_faves:500"><span><strong>Highly liked NASA images</strong><small>Images posted by NASA with at least 500 likes</small></span><code>from:NASA filter:images min_faves:500</code></button><button type="button" data-bx-search-example='("earthquake" OR "deprem") -spam lang:tr min_retweets:100'><span><strong>Earthquake discussion without spam</strong><small>Turkish posts with at least 100 reposts</small></span><code>("earthquake" OR "deprem") -spam lang:tr</code></button><button type="button" data-bx-search-example='"OpenAI" lang:en since:2025-01-01 until:2025-03-01'><span><strong>OpenAI posts from early 2025</strong><small>English posts matching the exact phrase in a date range</small></span><code>"OpenAI" lang:en since:2025-01-01</code></button></div><details class="bx-search-advanced"><summary>Advanced search options</summary><div class="bx-search-options"><fieldset><legend>Words</legend><label>This exact phrase<input name="exactPhrase" type="text" placeholder="state of the art"></label><label>Any of these words<input name="anyWords" type="text" placeholder="puppy kitten"></label><label>None of these words<input name="noneWords" type="text" placeholder="spam scam"></label></fieldset><fieldset><legend>Accounts and tags</legend><label>From these accounts<input name="from" type="text" placeholder="NASA, @SpaceX"></label><label>To these accounts<input name="to" type="text" placeholder="elonmusk"></label><label>Mentioning these accounts<input name="mentioning" type="text" placeholder="OpenAI, x"></label><label>These hashtags<input name="hashtags" type="text" placeholder="ai privacy"></label></fieldset><fieldset><legend>Filters</legend><label>Language<select name="language"><option value="">Any language</option><option value="en">English</option><option value="tr">Turkish</option><option value="de">German</option><option value="fr">French</option><option value="ja">Japanese</option></select></label><label>Media<select name="media"><option value="any">Any content</option><option value="images">Images</option><option value="videos">Videos</option><option value="media">Any media</option><option value="links">Links</option></select></label><label>Since<input name="since" type="date"></label><label>Until<input name="until" type="date"></label></fieldset><fieldset><legend>Engagement</legend><label>Minimum replies<input name="minReplies" type="number" min="0" inputmode="numeric"></label><label>Minimum likes<input name="minLikes" type="number" min="0" inputmode="numeric"></label><label>Minimum reposts<input name="minReposts" type="number" min="0" inputmode="numeric"></label><div class="bx-search-checks"><label><input name="verified" type="checkbox"> Verified accounts</label><label><input name="following" type="checkbox"> Accounts I follow</label><label><input name="replies" type="checkbox"> Replies</label><label><input name="retweets" type="checkbox"> Retweets</label></div></fieldset></div></details><output class="bx-search-preview" data-bx-search-query aria-live="polite">Your query will appear here.</output><div class="bx-search-actions"><button class="bx-search-submit bx-search-submit-bottom" type="submit">Search X</button><p data-bx-search-status role="status"></p></div></form></div></section>`;

function formValues(form: HTMLFormElement): AdvancedSearchValues {
  const value = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement).value;
  const checked = (name: string) => (form.elements.namedItem(name) as HTMLInputElement).checked;
  return { allWords: value("allWords"), exactPhrase: value("exactPhrase"), anyWords: value("anyWords"), noneWords: value("noneWords"), from: value("from"), to: value("to"), mentioning: value("mentioning"), hashtags: value("hashtags"), language: value("language"), since: value("since"), until: value("until"), minReplies: value("minReplies"), minLikes: value("minLikes"), minReposts: value("minReposts"), media: value("media"), verified: checked("verified"), following: checked("following"), replies: checked("replies"), retweets: checked("retweets") };
}

export function renderAdvancedSearch(root: HTMLElement): void {
  if (root.querySelector("[data-bx-advanced-search]")) return;
  root.replaceChildren();
  root.insertAdjacentHTML("afterbegin", searchMarkup);
  root.querySelector(".bx-search-icon")?.append(heroIcon("magnifying-glass"));
  const form = root.querySelector<HTMLFormElement>(".bx-search-form")!;
  const preview = root.querySelector<HTMLOutputElement>("[data-bx-search-query]")!;
  const status = root.querySelector<HTMLElement>("[data-bx-search-status]")!;
  const update = () => { preview.textContent = buildAdvancedSearchQuery(formValues(form)) || "Your query will appear here."; };
  form.querySelectorAll<HTMLButtonElement>("[data-bx-search-example]").forEach((button) => button.addEventListener("click", () => {
    form.elements.namedItem("allWords") && ((form.elements.namedItem("allWords") as HTMLInputElement).value = button.dataset.bxSearchExample ?? "");
    update();
    (form.elements.namedItem("allWords") as HTMLInputElement).focus();
  }));
  form.addEventListener("input", update);
  form.addEventListener("submit", (event) => { event.preventDefault(); const query = buildAdvancedSearchQuery(formValues(form)); if (!query) { status.textContent = "Add at least one search term or filter."; return; } location.href = buildAdvancedSearchUrl(query, location.origin); });
  update();
}

export function installAdvancedSearch(): () => void {
  const update = () => {
    replaceExploreWithSearch();
    if (location.pathname === "/explore") history.replaceState(null, "", "/search");
    const root = document.querySelector<HTMLElement>('[data-testid="primaryColumn"]');
    const editorRoute = location.pathname === "/search" && !new URLSearchParams(location.search).has("q");
    if (editorRoute && root) renderAdvancedSearch(root);
    if (!editorRoute) document.querySelector("[data-bx-advanced-search]")?.remove();
  };
  const observer = new MutationObserver(update);
  observer.observe(document.body, { childList: true, subtree: true });
  update();
  return () => observer.disconnect();
}
