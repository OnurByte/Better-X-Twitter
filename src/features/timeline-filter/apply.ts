import { visibleForTimeline } from "./filter";
import type { ParsedPost } from "../../x/types";
export function applyTimelineFilter(post: ParsedPost, settings: { originals: boolean; replies: boolean; quotes: boolean; reposts: boolean; promoted: boolean }): void { post.element.hidden = !visibleForTimeline(post.type, settings); }
