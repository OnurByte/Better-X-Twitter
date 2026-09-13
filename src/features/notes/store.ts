export interface UserNote { handle: string; note: string; tags: string[]; updatedAt: number }
export function normalizeNote(note: Omit<UserNote, "updatedAt">): UserNote { return { ...note, handle: note.handle.replace(/^@/, "").toLowerCase(), updatedAt: Date.now() }; }
