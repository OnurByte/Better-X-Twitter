export interface FocusSettings { bookmarksOnly: boolean; followingOnly: boolean }
export function shouldApplyFocus(post: { isBookmark: boolean; isFollowing: boolean }, settings: FocusSettings): boolean { return (!settings.bookmarksOnly || post.isBookmark) && (!settings.followingOnly || post.isFollowing); }
