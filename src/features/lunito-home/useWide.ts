import { useSyncExternalStore } from "react";

// Same breakpoint as reference.css. Unlike useIsMobile, it defaults to
// "not wide" when matchMedia is missing (jsdom), so tests keep the phone carousel.
const QUERY = "(min-width: 768px)";

const subscribe = (onChange: () => void) => {
  if (typeof window.matchMedia !== "function") return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};

const getSnapshot = () =>
  typeof window.matchMedia === "function" && window.matchMedia(QUERY).matches;

export function useWide() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
