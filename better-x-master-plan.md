# Better X Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Every feature must remain independently toggleable and testable.

**Goal:** Build a Chrome Manifest V3 extension that turns X into a more controllable client by restoring unavailable public posts through FxTwitter, adding immediate feed-control actions, improving reply composition with configurable AI, and adding local-first power-user features.

**Architecture:** Better X will use a modular plugin architecture. A small core owns DOM discovery, post identity, settings, storage, background networking and UI primitives. Features such as FxTwitter recovery, feed filtering, AI replies and bookmark resurfacing are isolated modules which consume those core interfaces instead of independently scraping X.

**Tech Stack:** TypeScript, Chrome Manifest V3, Vite, Vitest, Playwright, IndexedDB, `chrome.storage.local`, vanilla DOM/CSS or lightweight Preact only for complex settings UI.

**Spec:** `docs/specs/better-x.md`

---

## Global Constraints

- Chrome / Chromium first.
- Manifest V3.
- No backend required for normal extension functionality.
- Local-first storage.
- No analytics or telemetry by default.
- No modification of X actions without an explicit user click.
- No auto-reply, auto-like, auto-follow or engagement automation.
- AI features are opt-in.
- API keys must never enter the X page context.
- AI network calls happen only from the extension service worker.
- All core feed functionality must continue working when AI is disabled or unavailable.
- AI failures are fail-open, never hide content merely because the model timed out.
- Features which depend on unofficial X APIs must be clearly isolated behind adapters.
- X DOM selectors must exist in one compatibility layer rather than being duplicated across plugins.
- Do not claim an AI-generated reply is guaranteed to perform better in X ranking.
- FxTwitter recovery applies to publicly recoverable content. It must not imply that private or protected content can be bypassed.
- Remove any existing or planned **Explain this post** feature.
- The three requested quick actions must remain visually distinct and immediately reachable from every normal post:
  - Block post author
  - Not interested
  - Mute post author

---

## 1. Product Shape

Better X should not become a collection of random tweaks.

The product model is:

```text
X
↓
Better X Core
├── Recover
│   └── FxTwitter Revival
├── Control
│   ├── Quick Actions
│   ├── Local Feed Rules
│   ├── AI Feed Rules
│   └── Timeline Type Filters
├── Write
│   ├── AI Reply
│   └── Composer Tools
├── Remember
│   ├── Bookmark Rediscover
│   ├── User Notes
│   └── Local Library
└── Utilities
    ├── Smart Share
    ├── Profile Time Machine
    ├── Media Saver
    ├── Default Feed
    └── Momentum
```

The product identity should stay centered around four verbs:

```text
recover
control
write
remember
```

---

## 2. Feature Priority

| Priority | Feature |
|---|---|
| P0 | Better X core |
| P0 | X DOM compatibility adapter |
| P0 | Three post quick-action icons |
| P0 | FxTwitter Revival |
| P0 | Local Feed Rules |
| P0 | AI Feed Rules |
| P0 | AI Reply |
| P0 | Configurable AI reply prompt |
| P0 | Settings UI |
| P1 | Smart Share |
| P1 | Composer Rewrite / Translate |
| P1 | Bookmark Rediscover |
| P1 | Private User Notes |
| P1 | Country flag badges |
| P1 | Profile Time Machine |
| P1 | Original / Quote / Repost filters |
| P1 | Following-as-default |
| P1 | Media Saver |
| P2 | Local X Library |
| P2 | Momentum badges |
| P2 | Notification filters |
| P2 | Focus mode |
| Experimental | Slop indicator |
| Experimental | X private GraphQL archive sync |

---

## 3. Repository Structure

```text
better-x/
├── manifest.json
├── package.json
├── vite.config.ts
├── tsconfig.json
│
├── src/
│   ├── core/
│   │   ├── bootstrap.ts
│   │   ├── plugin.ts
│   │   ├── plugin-manager.ts
│   │   ├── events.ts
│   │   ├── settings.ts
│   │   ├── permissions.ts
│   │   └── logger.ts
│   │
│   ├── x/
│   │   ├── dom-adapter.ts
│   │   ├── selectors.ts
│   │   ├── post-parser.ts
│   │   ├── post-identity.ts
│   │   ├── composer-adapter.ts
│   │   ├── menu-adapter.ts
│   │   ├── route-observer.ts
│   │   └── types.ts
│   │
│   ├── background/
│   │   ├── service-worker.ts
│   │   ├── fetch-proxy.ts
│   │   ├── ai-client.ts
│   │   ├── permissions.ts
│   │   └── downloads.ts
│   │
│   ├── storage/
│   │   ├── database.ts
│   │   ├── schema.ts
│   │   ├── settings-store.ts
│   │   └── migrations.ts
│   │
│   ├── ui/
│   │   ├── icons.ts
│   │   ├── toast.ts
│   │   ├── popover.ts
│   │   ├── shadow-panel.ts
│   │   └── theme.ts
│   │
│   ├── features/
│   │   ├── quick-actions/
│   │   ├── fx-revival/
│   │   ├── feed-rules/
│   │   ├── ai-feed-filter/
│   │   ├── ai-reply/
│   │   ├── composer-tools/
│   │   ├── smart-share/
│   │   ├── rediscover/
│   │   ├── user-notes/
│   │   ├── country-flags/
│   │   ├── timeline-filter/
│   │   ├── time-machine/
│   │   ├── media-saver/
│   │   ├── default-feed/
│   │   ├── local-library/
│   │   └── momentum/
│   │
│   └── options/
│       ├── index.html
│       ├── app.ts
│       └── sections/
│
└── tests/
    ├── unit/
    ├── fixtures/
    ├── integration/
    └── e2e/
```

---

## 4. Core Interfaces

### `BetterXPlugin`

```ts
export interface BetterXPlugin {
  id: string;
  name: string;
  defaultEnabled: boolean;

  start(context: PluginContext): void | Promise<void>;
  stop(): void | Promise<void>;
}
```

### `PostIdentity`

Do not identify a tweet merely by its DOM node.

```ts
export interface PostIdentity {
  statusId?: string;
  authorHandle?: string;
  contentHash: string;
  domRevision: number;
}
```

### `ParsedPost`

```ts
export interface ParsedPost {
  identity: PostIdentity;

  statusId?: string;
  url?: string;

  author: {
    handle?: string;
    displayName?: string;
  };

  text: string;

  type:
    | "original"
    | "reply"
    | "quote"
    | "repost"
    | "promoted";

  metrics?: {
    replies?: number;
    reposts?: number;
    likes?: number;
    views?: number;
  };

  createdAt?: Date;
  element: HTMLElement;
}
```

---

## 5. Storage Schema

Use `chrome.storage.local` for small configuration.

Use IndexedDB for collections.

```ts
interface BetterXSettings {
  version: number;

  features: Record<string, boolean>;

  quickActions: {
    block: boolean;
    notInterested: boolean;
    mute: boolean;
  };

  feed: {
    defaultTab: "for-you" | "following" | "remember";
    peekFiltered: boolean;
    showFilterReason: boolean;
  };

  ai: AISettings;

  rediscover: {
    enabled: boolean;
    source: Array<"bookmarks" | "likes">;
    intervalMinutes: number;
    sessionLimit: number;
  };
}
```

IndexedDB stores:

```text
posts
bookmarks
likes
rediscover_history
user_notes
feed_rule_cache
ai_verdict_cache
download_history
library_entries
account_country_cache
```

---

## 6. Task 1: Extension Foundation

**Files:**

```text
Create: manifest.json
Create: src/core/plugin.ts
Create: src/core/plugin-manager.ts
Create: src/core/bootstrap.ts
Create: src/background/service-worker.ts
Test: tests/unit/plugin-manager.test.ts
```

**Produces:**

```ts
registerPlugin(plugin: BetterXPlugin): void
startEnabledPlugins(): Promise<void>
stopPlugin(id: string): Promise<void>
```

- [ ] Write tests for plugin registration.
- [ ] Verify disabled modules do not execute.
- [ ] Implement plugin lifecycle.
- [ ] Add `chrome.storage.local` settings loading.
- [ ] Add content-script bootstrap.
- [ ] Add service worker.
- [ ] Run unit tests.
- [ ] Commit:

```bash
git commit -m "feat: add Better X extension core"
```

---

## 7. Task 2: X DOM Compatibility Layer

No feature may independently do:

```ts
document.querySelector('article[data-testid="tweet"]')
```

Instead:

```ts
xDom.observePosts(callback)
xDom.parsePost(article)
xDom.findComposer()
xDom.openPostMenu(post)
```

**Files:**

```text
Create: src/x/selectors.ts
Create: src/x/post-parser.ts
Create: src/x/post-identity.ts
Create: src/x/dom-adapter.ts
Create: src/x/route-observer.ts

Test: tests/unit/post-parser.test.ts
Test: tests/integration/dom-recycling.test.ts
```

Use a debounced `MutationObserver`.

Detect:

```text
new article
recycled article
footer replacement
route change
modal insertion
composer insertion
```

Tests must specifically simulate:

```text
tweet A rendered
same article reused for tweet B
Better X UI for tweet A removed
Better X recognizes B as a new post
```

---

## 8. Task 3: Three Quick Action Icons

Every normal post gets exactly three Better X quick controls near the upper-right post controls.

```text
[ block ] [ not interested ] [ mute ]
```

Do not bury them in a custom submenu.

### Block

Click:

```text
Block @username?
[Cancel] [Block]
```

Only after confirmation trigger X's native block flow.

### Not Interested

One click.

Attempt native:

```text
Not interested in this post
```

If X's action is temporarily unavailable:

```text
apply Better X local negative feedback
```

and optionally show:

```text
hidden locally
```

### Mute

Click:

```text
Mute @username?
```

Then execute native mute flow.

### Adapter

```ts
interface XMenuAdapter {
  blockAuthor(post: ParsedPost): Promise<ActionResult>;
  muteAuthor(post: ParsedPost): Promise<ActionResult>;
  markNotInterested(post: ParsedPost): Promise<ActionResult>;
}
```

Preference order:

```text
1. Stable X semantic/test IDs
2. Structural menu recognition
3. Localized label fallback
4. Better X local fallback where appropriate
```

Never hardcode one English menu string as the only implementation.

---

## 9. Task 4: FxTwitter Revival

This is one of the identity features of Better X.

### Detection

Detect unavailable cards such as:

```text
This post is unavailable
Account suspended
Post from an account you blocked
Content unavailable
Failed to load post
```

Extract `statusId` whenever possible.

### Recovery

```text
X unavailable card
        ↓
status ID
        ↓
background service worker
        ↓
FxTwitter lookup
        ↓
normalize response
        ↓
Better X revival card
```

### UI

```text
┌─────────────────────────────────┐
│ Recovered by Better X           │
│                                 │
│ @username                       │
│ original post text...           │
│                                 │
│ [image/video]                   │
│                                 │
│ Source: FxTwitter               │
│ Open source                     │
└─────────────────────────────────┘
```

Never make it visually indistinguishable from native X.

Recovered cards need a visible:

```text
Recovered
```

marker.

### Fallback order

```text
FxTwitter API
FxTwitter public representation
failure card
```

Later:

```text
optional VxTwitter fallback
```

### Cache

```ts
interface RecoveredPost {
  statusId: string;
  source: "fxtwitter" | "vxtwitter";
  fetchedAt: number;
  expiresAt: number;
  post: NormalizedPost;
}
```

Suggested cache:

```text
success: 6 hours
not found: 15 minutes
network error: no negative cache
```

---

## 10. Task 5: Local Feed Rules

Fast filtering must happen without AI.

### Rules

```ts
type FeedRule =
  | KeywordRule
  | UserRule
  | DomainRule
  | PostTypeRule;
```

Examples:

```text
hide keyword "giveaway"
hide domain example.com
reduce posts containing "agree?"
always show @username
hide reposts
hide promoted posts
```

### Evaluation

```ts
interface FeedDecision {
  action: "show" | "hide" | "reduce";
  reason?: string;
  ruleId?: string;
}
```

`reduce` means lower visual prominence rather than removing the post entirely.

### Filtered-card UI

If `peekFiltered` is enabled:

```text
Hidden by Better X
reason: engagement bait

[show]
```

---

## 11. Task 6: Natural-Language AI Feed Rules

Add a setting:

### “What do you not want to see?”

Example:

```text
hide obvious engagement bait and crypto giveaways
but keep technical posts about monero and cryptography
```

### Pipeline

Do not send every tweet to AI immediately.

```text
post
↓
local deterministic rules
↓
cached AI verdict?
↓
AI batch queue
↓
batch evaluation
↓
cache
↓
apply verdict
```

Better X behavior:

```text
show post normally
AI decision arrives
fade/hide only if verdict says hide
```

### Output schema

```ts
interface AIFeedVerdict {
  id: string;
  action: "show" | "hide" | "reduce";
  confidence: number;
  reason: string;
}
```

### Fail behavior

```text
timeout -> show
invalid JSON -> show
provider error -> show
no API key -> disable AI layer only
```

---

## 12. Task 7: AI Provider Layer

Support provider abstraction.

```ts
interface AIProvider {
  id: string;

  generate(request: AIRequest): Promise<AIResponse>;
}
```

Initial support:

```text
OpenAI-compatible
OpenRouter
xAI-compatible
Custom endpoint
```

Configuration:

```text
API Base URL
API Key
Model
Temperature
Timeout
Custom headers
```

API key lives only in:

```text
chrome.storage.local
```

Never:

```text
window
localStorage
DOM
data attributes
page scripts
```

AI calls run from the service worker.

---

## 13. Task 8: AI Reply

Remove **Explain this post** completely.

Replace it with a composer-native action:

```text
AI Reply
```

### Context Builder

When user presses AI Reply collect:

```text
target post
quoted post
parent post if rendered
visible thread context
author handle
user's current draft
configured writing preferences
optional Better X user note
```

Do not scrape unrelated timeline content.

### Reply Workflow

```text
click AI Reply
↓
collect context
↓
construct algorithm-aware prompt
↓
LLM
↓
preview result
↓
insert into composer
↓
user edits
↓
user manually presses Reply
```

Never auto-submit.

---

## 14. X Algorithm Reply Profile

Add a built-in base prompt.

Do not market it as "gaming X".

The prompt goal is:

```text
relevant
specific
conversation-native
non-generic
human-sounding
context-aware
not spammy
not engagement bait
```

Base principles:

```text
respond directly to the post
add information, opinion or useful humor
avoid empty agreement
avoid unrelated links
avoid hashtag spam
avoid repetitive template language
avoid excessive call-to-action
do not fabricate facts
match the author's language
respect user-configured tone
prefer concise replies unless context demands more
```

### Prompt composition

```text
SYSTEM BASE
+
ALGORITHM PROFILE
+
USER STYLE PROMPT
+
RELATIONSHIP CONTEXT
+
THREAD CONTEXT
+
TARGET POST
+
CURRENT DRAFT
```

---

## 15. Fine-Tuning Prompt in Settings

The user must be able to edit the personality layer without changing code.

### Settings

```text
AI Reply
├── Provider
├── Model
├── Reply language
├── Length
├── Creativity
├── Algorithm-aware mode
├── Use thread context
├── Use private user notes
└── Custom style prompt
```

Custom prompt example:

```text
write like me

keep replies natural
avoid corporate wording
don't summarize the original post
no unnecessary hashtags
don't sound like customer support
use lowercase when appropriate
if the post is obviously joking reply like a human
```

Store:

```ts
interface ReplyProfile {
  id: string;
  name: string;
  prompt: string;
  language: "auto" | string;
  maxLength?: number;
}
```

Allow multiple profiles later:

```text
default
technical
shitpost
serious
english
turkish
```

---

## 16. Task 9: Composer Tools

AI Reply handles replies.

Composer Tools work on text the user has already written.

When text is selected show:

```text
┌────────────────────────────────┐
│ Rewrite  Shorter  Translate    │
│ Natural  Sharper  Custom       │
└────────────────────────────────┘
```

Implement source-change protection:

```ts
if (currentSelectedText !== originalSelectedText) {
  abortReplacement();
}
```

Actions:

```text
Rewrite
Make shorter
Make more natural
Make sharper
Translate
Fix grammar
Custom instruction
```

---

## 17. Task 10: Smart Share

Extend the native share experience.

Options:

```text
Copy original link
Copy FxTwitter link
Copy VxTwitter link
Copy Markdown
Copy quoted post
```

Better X should not rewrite the global clipboard without an explicit user action.

Allow a default:

```text
Preferred shared link:
[ Original ]
[ FxTwitter ]
[ VxTwitter ]
```

---

## 18. Task 11: Bookmark Rediscover

Capture bookmarks when the user visits their bookmark page.

Store them locally.

### Better X version

```text
From your bookmarks
Saved 142 days ago

[normal post card]
```

Settings:

```text
Rediscover: On / Off
Frequency: Rare / Normal / Frequent
Session limit
Sources:
[x] bookmarks
[ ] likes
```

Internal state:

```ts
interface RediscoverState {
  postId: string;
  lastShownAt?: number;
  showCount: number;
}
```

Retire entries after configurable repeated resurfacing.

---

## 19. Task 12: Private User Notes

Profile page receives a private note button.

Example:

```text
@someuser

Private note:
good rust dev
met through musti

Tags:
[developer] [friend]
```

Schema:

```ts
interface UserNote {
  handle: string;
  note: string;
  tags: string[];
  updatedAt: number;
}
```

Optional display:

```text
@username · developer
```

inside feed cards.

Privacy rule:

```text
user notes must never enter AI context unless
"use private notes for AI context" is explicitly enabled
```

---

## 20. Task 13: Timeline Type Filters

Classify posts:

```text
original
reply
quote
repost
promoted
```

Settings:

```text
Show originals     ✓
Show replies       ✓
Show quotes        ✓
Show reposts       ✓
Show promoted      ✕
```

Use the shared `ParsedPost.type`.

Do not build a second parser.

---

## 20.5. Task 12.5: Country Flag Badge

Add a small country flag to the upper-right metadata area of each post, close to the author/action region without competing with the Block / Not Interested / Mute controls.

Example:

```text
@username                                      🇹🇷
post text...
```

### Source priority

Never present a guessed location as verified.

Use this order:

```text
1. X "About this Account" public country/region
2. Explicit public profile location mapped to a country
3. Unknown
```

The X account's private Country Setting must never be accessed or implied.

The preferred source is X's public **About this Account** country/region because X exposes it as public profile metadata when available. Treat it as an X-provided inferred account region, not as the user's physical real-time location.

### Confidence model

```ts
type CountrySource =
  | "x-about-account"
  | "profile-location"
  | "unknown";

interface AccountCountry {
  handle: string;
  countryCode?: string;
  countryName?: string;
  source: CountrySource;
  confidence: "high" | "estimated" | "unknown";
  fetchedAt: number;
}
```

Rules:

```text
X About this Account country
-> high confidence that this is the region X publicly associates with the account
-> still not a claim of current physical location

Profile location -> estimated
No reliable mapping -> unknown
```

Never infer a flag from free-form strings such as:

```text
internet
earth
somewhere
your walls
localhost
```

### UI

Default:

```text
🇹🇷
```

Hover:

```text
Türkiye
X account region
```

If derived only from profile location:

```text
🇹🇷
estimated from profile location
```

If unavailable:

```text
do not render a flag
```

Do not show a generic guessed flag merely to fill the space.

### Lazy resolution

Do not perform a network/profile lookup for every tweet immediately.

Pipeline:

```text
tweet discovered
↓
handle extracted
↓
country cache lookup
├── hit -> render flag
└── miss -> add handle to lazy lookup queue
              ↓
          resolve once
              ↓
          cache by handle
              ↓
          update all visible posts from that author
```

Deduplicate lookup requests by handle.

Suggested cache:

```text
successful X region: 7 days
profile-location estimate: 24 hours
unknown: 6 hours
```

### Storage

Add IndexedDB store:

```text
account_country_cache
```

Key:

```text
lowercase handle
```

Value:

```ts
interface AccountCountryCacheEntry extends AccountCountry {
  expiresAt: number;
}
```

### Country mapping

Ship a local ISO 3166 country/alias table for deterministic profile-location mapping.

Support obvious forms such as:

```text
Turkey
Türkiye
TR
Istanbul, Turkey
Berlin, Germany
Tokyo, Japan
```

Do not use an external geocoding API in V1.

Ambiguous locations such as:

```text
Georgia
Washington
Paris
London
```

must not be converted unless the country can be determined confidently from the string itself.

### Privacy

This feature only displays country/region information which is already public on X or explicitly written in the public profile location.

It must not:

```text
resolve IP addresses
fingerprint users
call IP geolocation services
infer current GPS location
store precise coordinates
claim the flag represents real-time physical location
```

### Settings

Add:

```text
Profiles
└── Country flags
    ├── Show country flags                 ✓
    ├── Prefer X account region            ✓
    ├── Allow profile-location fallback    ✓
    └── Show estimated indicator           ✓
```

### Tests

Create fixtures for:

```text
X country = Türkiye
X country = United States
profile location = Berlin, Germany
profile location = Istanbul
profile location = Georgia
profile location = internet
country unavailable
multiple posts from same handle
```

Verify:

```text
[ ] X public account region renders correct flag
[ ] profile fallback is marked estimated
[ ] ambiguous free-form locations do not create flags
[ ] same author causes only one lookup
[ ] cache updates every visible post from that author
[ ] no external geolocation service is called
[ ] feature can be disabled independently
```

---

## 21. Task 14: Profile Time Machine

Add calendar icon to profile actions.

Click:

```text
Search posts by date

From: 2025-01-01
To:   2025-02-01

Type:
[x] posts
[ ] replies
[ ] media only

[Search]
```

Generate X advanced search query.

Example:

```text
from:username since:2025-01-01 until:2025-02-01
```

No API required.

---

## 22. Task 15: Default Feed

Setting:

```text
Home opens to:

For You
Following
Remember last selected
```

Implementation must react to SPA navigation rather than constantly redirecting the browser.

---

## 23. Task 16: Media Saver

Add to Better X post overflow menu:

```text
Download media
```

Do not add another permanent icon beside every post.

Capabilities:

```text
original-resolution image
all images from multi-image post
highest available MP4
GIF/video handling
download progress
```

Resolver order:

```text
direct rendered image
X syndication
FxTwitter
VxTwitter
```

---

## 24. Task 17: Local X Library

P2.

Build a local search layer over information the extension has already collected.

```text
Library
├── Bookmarks
├── Rediscovered
├── User notes
├── Saved posts
└── Downloaded media
```

Search:

```text
text
author
handle
URL
tag
date
```

Do not start V1 by crawling the user's entire account.

Only index material Better X naturally encounters.

Bulk GraphQL sync remains experimental.

---

## 25. Task 18: Momentum

P2.

Compute engagement velocity from visible data.

```ts
weighted =
  replies * replyWeight +
  reposts +
  likes;

velocity =
  weighted / ageHours;
```

Show subtle badge:

```text
↗ rising
```

or:

```text
4.2k/h
```

Important label:

```text
Momentum
```

Not:

```text
Algorithm score
Virality prediction
X ranking score
```

---

## 26. Task 19: Focus Mode

P2.

Modes:

```text
Normal
Bookmarks only
Following only
No metrics
No trending sidebar
No recommendations
Reading mode
```

Better X should expose granular switches instead of a single extreme mode.

---

## 27. Task 20: Slop Indicator

Experimental and disabled by default.

Do not call it:

```text
AI detector
```

Call it:

```text
Writing quality signal
Slop heuristic
```

Potential integration:

```text
Slop score > threshold
↓
optional "reduce" Feed Rule
```

Never auto-block an account based solely on heuristic scoring.

---

## 28. Settings UX

The extension toolbar popup should remain tiny.

```text
Better X
─────────────
✓ Recover
✓ Feed Control
✓ AI Reply
✓ Rediscover

[Open Settings]
```

Full settings page:

```text
General
Feed
Recovery
AI
Writing
Bookmarks
Profiles
Sharing
Media
Privacy
Experimental
```

Every major module gets:

```text
enabled
configuration
reset to defaults
```

---

## 29. Permissions Strategy

Initial manifest:

```text
storage
```

Host access:

```text
https://x.com/*
https://twitter.com/*
https://fxtwitter.com/*
```

Optional permissions requested only when needed:

```text
downloads
clipboardWrite
AI provider domains
VxTwitter
```

Do not request:

```text
<all_urls>
history
bookmarks browser permission
cookies
```

unless a later implementation has a demonstrated requirement.

---

## 30. UI Isolation

Persistent buttons inside tweets may be injected into X DOM.

Complex floating UI should use a body-level Shadow Root.

Examples:

```text
AI result preview
Feed rule editor
User note editor
Settings popovers
Recovery details
```

---

## 31. Performance Budget

The timeline observer must never trigger model calls or expensive parsing directly.

Pipeline:

```text
MutationObserver
↓
collect candidate articles
↓
requestAnimationFrame
↓
deduplicate by identity
↓
parse
↓
publish POST_DISCOVERED event
```

Targets:

```text
No network request for normal post discovery
No full-document rescans during each mutation
No AI call per tweet
No duplicate injection after React rerender
No polling when MutationObserver can be used
```

---

## 32. Testing Strategy

### Unit tests

Cover:

```text
post ID extraction
handle extraction
tweet type classification
content hashes
feed-rule matching
FxTwitter normalization
AI JSON parser
prompt builder
advanced-search generation
Momentum math
storage migrations
country source parsing
country alias mapping
```

### DOM fixtures

Create captured simplified fixtures for:

```text
normal post
reply
quote
repost
promoted post
unavailable post
suspended account post
media post
thread
composer
profile
menu
```

### Integration tests

Simulate:

```text
infinite scroll
article node recycling
React removing Better X buttons
route changes
menu recreation
light/dim/dark theme changes
```

### E2E

Playwright on a deterministic local X fixture.

Critical scenarios:

```text
quick actions injected once
recycled post gets correct controls
FxTwitter recovery replaces placeholder
local feed rule hides correct tweet
AI timeout keeps tweet visible
AI reply inserts but does not submit
composer edit during AI request prevents overwrite
country flag lookup deduplicates per author
settings survive reload
```

---

## 33. Failure Boundaries

Each plugin fails independently.

Example:

```text
FxTwitter offline
```

must not break:

```text
Quick Actions
AI Reply
Feed Rules
Rediscover
```

Every plugin entrypoint:

```ts
try {
  await plugin.start(context);
} catch (error) {
  context.logger.error(plugin.id, error);
  context.health.markFailed(plugin.id);
}
```

Add optional diagnostics page:

```text
DOM adapter       healthy
FxTwitter         healthy
AI provider       disabled
IndexedDB         healthy
X selectors       7/7 matched
```

---

## 34. Release Phases

### Phase 0: Core

Ship nothing until:

```text
MV3 boots
settings work
plugin lifecycle works
X SPA navigation works
post identity survives DOM recycling
```

### Phase 1: Better X MVP

Ship:

```text
Quick Actions
FxTwitter Revival
Local Feed Rules
AI Reply
AI settings
Smart Share
Default Feed
```

This already creates a coherent extension.

### Phase 2: Personal X

Add:

```text
Natural-language Feed Rules
Composer Tools
User Notes
Country Flag Badges
Bookmark Rediscover
Timeline filters
Profile Time Machine
Media Saver
```

### Phase 3: Local Intelligence

Add:

```text
Local Library
Momentum
Focus Mode
Notification filters
```

### Phase 4: Experimental

Consider:

```text
Likes/bookmark bulk GraphQL sync
dynamic GraphQL query discovery
slop heuristics
advanced ranking research integrations
```

---

## 35. Features Explicitly Not in MVP

Do not scope-creep into:

```text
auto replies
auto posting
auto likes
auto follow/unfollow
mass blocking
account farming
analytics dashboard
cloud accounts
server-side sync
Better X social network
Electron desktop client
mobile client
X branding replacement
GIF favorites
emoji picker replacement
themes marketplace
```

---

## 36. Definition of Done for V1

V1 is done only when all of these are true:

```text
[ ] Every normal tweet gets Block / Not Interested / Mute controls
[ ] Buttons survive X infinite scrolling and DOM recycling
[ ] Block requires confirmation
[ ] Native X actions are used where possible
[ ] Unavailable public tweets can attempt FxTwitter recovery
[ ] Recovered content is clearly labelled
[ ] Feed can be filtered locally
[ ] AI feed filtering can be completely disabled
[ ] AI errors never make the feed disappear
[ ] AI Reply exists inside reply workflow
[ ] AI Reply never submits automatically
[ ] User can edit the reply fine-tuning prompt
[ ] AI keys stay outside the X page context
[ ] Explain this post does not exist
[ ] Smart Share supports FxTwitter
[ ] Country flag badges use only public or explicit profile-derived data
[ ] Estimated country is never presented as verified
[ ] All modules can be toggled independently
[ ] Light, Dim and Lights Out themes work
[ ] Settings survive reload
[ ] Unit tests pass
[ ] DOM integration tests pass
[ ] E2E smoke suite passes
```

---

## 37. Recommended Implementation Order

```text
1. Core
2. X DOM Adapter
3. Post Identity
4. Quick Actions
5. FxTwitter Revival
6. Settings
7. Local Feed Rules
8. AI Provider Layer
9. AI Reply
10. Smart Share
11. AI Feed Rules
12. Composer Tools
13. User Notes
14. Country Flag Badges
15. Bookmark Rediscover
16. Timeline Filters
17. Time Machine
18. Media Saver
19. Local Library
20. Momentum
21. Experimental modules
```

The first milestone to implement should be:

```text
Core
+
DOM Adapter
+
Quick Actions
+
FxTwitter Revival
```

Once those four are stable, almost every other Better X feature becomes a normal plugin instead of another pile of X-specific DOM hacks.
