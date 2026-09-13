export class Events {
  private listeners = new Map<string, Set<(value: unknown) => void>>();
  on(event: string, listener: (value: unknown) => void): () => void { const set = this.listeners.get(event) ?? new Set(); set.add(listener); this.listeners.set(event, set); return () => set.delete(listener); }
  emit(event: string, value?: unknown): void { for (const listener of this.listeners.get(event) ?? []) listener(value); }
}
