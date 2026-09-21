export interface WorkspaceRouter {
  push(href: string): void;
}

function browserIsOffline() {
  if (typeof window === "undefined") return false;
  return !window.navigator.onLine || document.documentElement.dataset.poolamkooNetwork === "offline";
}

export function navigateWorkspace(router: WorkspaceRouter, href: string) {
  if (browserIsOffline()) {
    const target = new URL(href, window.location.origin);
    if (target.origin === window.location.origin) {
      window.location.href = target.href;
      return;
    }
  }
  router.push(href);
}
