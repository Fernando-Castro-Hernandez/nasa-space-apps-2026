// Base de shadcn/ui adaptada: se suscribe a matchMedia en vez de hacer
// setState dentro de un efecto. jsdom no tiene matchMedia; ahí es "no móvil".
import { useSyncExternalStore } from "react";

const QUERY = "(max-width: 767px)";

const subscribe = (onChange: () => void) => {
  if (typeof window.matchMedia !== "function") return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};

const getSnapshot = () =>
  typeof window.matchMedia === "function" && window.matchMedia(QUERY).matches;

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
