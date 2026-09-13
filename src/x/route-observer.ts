export function observeRoutes(callback: () => void): () => void {
  const notify = () => callback();
  const pushState = history.pushState;
  const replaceState = history.replaceState;
  history.pushState = function (...args) { const result = pushState.apply(this, args); notify(); return result; };
  history.replaceState = function (...args) { const result = replaceState.apply(this, args); notify(); return result; };
  addEventListener("popstate", notify);
  return () => { history.pushState = pushState; history.replaceState = replaceState; removeEventListener("popstate", notify); };
}
