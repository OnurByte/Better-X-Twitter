export interface MediaCandidates { rendered?: string; syndication?: string; fxtwitter?: string; vxtwitter?: string }
export function chooseMedia(candidates: MediaCandidates): string | undefined { return candidates.rendered ?? candidates.syndication ?? candidates.fxtwitter ?? candidates.vxtwitter; }
