// Router mínimo sobre el History API, sin dependencias. Cloudflare sirve
// index.html en cualquier ruta (not_found_handling: single-page-application).
import { useSyncExternalStore } from "react";

// Ruta actual y la anterior, para que una pantalla pueda volver "a donde
// estabas" (Salir de Emergencia). null: la app se abrió en esta ruta.
let current = window.location.pathname;
let previous: string | null = null;

function track() {
  const now = window.location.pathname;
  if (now === current) return;
  previous = current;
  current = now;
}
window.addEventListener("popstate", track);

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

/** Ruta interna desde la que se llegó a la actual. */
export const previousPath = () => previous;

export function navigate(to: string) {
  if (to === window.location.pathname) return;
  window.history.pushState(null, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
}

/** Cambia la dirección sin dejar la anterior en el historial (redirecciones). */
export function redirect(to: string) {
  window.history.replaceState(null, "", to);
  // Una redirección no es un paso del recorrido: no cambia la ruta anterior.
  current = window.location.pathname;
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function onLinkClick(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element | null)?.closest("a");
  const href = a?.getAttribute("href");
  if (!a || !href?.startsWith("/") || a.target === "_blank") return;
  e.preventDefault();
  navigate(href);
}

/** Convierte los clics en enlaces internos en navegación sin recarga. */
export function interceptLinks() {
  document.addEventListener("click", onLinkClick);
  return () => document.removeEventListener("click", onLinkClick);
}
