export interface AISettings {
  enabled: boolean;
  provider: "openai-compatible" | "openrouter" | "xai" | "custom";
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  timeoutMs: number;
  customHeaders: Record<string, string>;
  feedInstruction: string;
  replyLanguage: "auto" | string;
  replyLength: number;
  algorithmAware: boolean;
  useThreadContext: boolean;
  usePrivateNotesForAI: boolean;
  stylePrompt: string;
}

export interface BetterXSettings {
  version: number;
  features: Record<string, boolean>;
  quickActions: { block: boolean; notInterested: boolean; mute: boolean };
  feed: {
    defaultTab: "for-you" | "following" | "remember";
    peekFiltered: boolean;
    showFilterReason: boolean;
    rules: import("../features/feed-rules/rules").FeedRule[];
  };
  ai: AISettings;
  rediscover: {
    enabled: boolean;
    source: Array<"bookmarks" | "likes">;
    intervalMinutes: number;
    sessionLimit: number;
  };
  countryFlags: {
    enabled: boolean;
    preferXRegion: boolean;
    profileFallback: boolean;
    showEstimated: boolean;
  };
  timeline: { originals: boolean; replies: boolean; quotes: boolean; reposts: boolean; promoted: boolean };
  focus: { bookmarksOnly: boolean; followingOnly: boolean; noMetrics: boolean; noTrending: boolean; noRecommendations: boolean; readingMode: boolean };
  sharing: { preferred: "original" | "fxtwitter" | "vxtwitter" };
}

export const defaults: BetterXSettings = {
  version: 1,
  features: {
    "quick-actions": true, "fx-revival": true, "feed-rules": true, "ai-feed-filter": false,
    "ai-reply": false, "composer-tools": false, "smart-share": true, "rediscover": false,
    "user-notes": false, "country-flags": false, "timeline-filter": false, "time-machine": false,
    "media-saver": false, "local-library": false, momentum: false, "focus-mode": false,
    "notification-filters": false, "slop-indicator": false, "archive-sync": false
  },
  quickActions: { block: true, notInterested: true, mute: true },
  feed: { defaultTab: "for-you", peekFiltered: true, showFilterReason: true, rules: [] },
  ai: { enabled: false, provider: "openai-compatible", baseUrl: "https://api.openai.com/v1", apiKey: "", model: "gpt-4o-mini", temperature: 0.7, timeoutMs: 20000, customHeaders: {}, feedInstruction: "", replyLanguage: "auto", replyLength: 280, algorithmAware: true, useThreadContext: true, usePrivateNotesForAI: false, stylePrompt: "" },
  rediscover: { enabled: false, source: ["bookmarks"], intervalMinutes: 30, sessionLimit: 3 },
  countryFlags: { enabled: false, preferXRegion: true, profileFallback: true, showEstimated: true },
  timeline: { originals: true, replies: true, quotes: true, reposts: true, promoted: true },
  focus: { bookmarksOnly: false, followingOnly: false, noMetrics: false, noTrending: false, noRecommendations: false, readingMode: false },
  sharing: { preferred: "original" }
};

export type SettingsPatch = Partial<BetterXSettings> & { features?: Record<string, boolean> };

export function migrateSettings(input: Partial<BetterXSettings> | null | undefined): BetterXSettings {
  const source = input ?? {};
  return {
    ...structuredClone(defaults),
    ...source,
    features: { ...defaults.features, ...(source.features ?? {}) },
    quickActions: { ...defaults.quickActions, ...(source.quickActions ?? {}) },
    feed: { ...defaults.feed, ...(source.feed ?? {}) },
    ai: { ...defaults.ai, ...(source.ai ?? {}) },
    rediscover: { ...defaults.rediscover, ...(source.rediscover ?? {}) },
    countryFlags: { ...defaults.countryFlags, ...(source.countryFlags ?? {}) },
    timeline: { ...defaults.timeline, ...(source.timeline ?? {}) },
    focus: { ...defaults.focus, ...(source.focus ?? {}) },
    sharing: { ...defaults.sharing, ...(source.sharing ?? {}) },
    version: defaults.version
  };
}
