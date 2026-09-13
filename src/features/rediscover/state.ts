export interface RediscoverState { postId: string; lastShownAt?: number; showCount: number }
export function nextRediscover(states: RediscoverState[]): RediscoverState | undefined { return states.find((state) => state.showCount < 3); }
