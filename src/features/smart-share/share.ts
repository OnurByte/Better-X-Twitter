import { shareUrl } from "../utilities/urls";
export function copyShareLink(original: string, target: "original" | "fxtwitter" | "vxtwitter"): string { return shareUrl(original, target); }
