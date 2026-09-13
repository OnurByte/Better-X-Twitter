export interface ReplyPromptInput { text: string; authorHandle?: string; draft?: string; style?: string; thread?: string; includePrivateNote: boolean; privateNote?: string }
export function buildReplyPrompt(input: ReplyPromptInput): string {
  const note = input.includePrivateNote && input.privateNote ? `\nPrivate relationship note:\n${input.privateNote}` : "";
  return ["You write one relevant, specific, human-sounding reply.", "Avoid empty agreement, spam, fabricated facts, and engagement bait.", "Do not submit the reply; return text for the user to edit.", input.style ? `Style:\n${input.style}` : "", input.thread ? `Thread:\n${input.thread}` : "", `Author: @${input.authorHandle ?? "unknown"}`, `Post:\n${input.text}`, input.draft ? `Current draft:\n${input.draft}` : "", note].filter(Boolean).join("\n\n");
}
