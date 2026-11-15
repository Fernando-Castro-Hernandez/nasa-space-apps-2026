// Router mínimo sobre el History API, sin dependencias. Cloudflare sirve
// index.html en cualquier ruta (not_found_handling: single-page-application).
import { useSyncExternalStore } from "react";

const subscribe = (onChange: () => void) => {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
};

export const usePathname = () =>
  useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => "/",
  );

export function navigate(to: string) {
  if (to === window.location.pathname) return;
  window.history.pushState(null, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
}

/** Convierte los clics en enlaces internos en navegación sin recarga. */
export function interceptLinks() {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest("a");
    const href = a?.getAttribute("href");
    if (!a || !href?.startsWith("/") || a.target === "_blank") return;
    e.preventDefault();
    navigate(href);
  };
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}
