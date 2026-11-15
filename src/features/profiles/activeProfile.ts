// Perfil activo (HU-01): sin contraseñas, como los perfiles de Netflix. Vive
// en localStorage; si no está disponible (modo privado, jsdom) queda en memoria.
// ponytail: solo este dispositivo; HU-29 lo compartirá entre dispositivos vía D1.
import { useSyncExternalStore } from "react";
import { CREW, ME } from "@/data/crew";

const KEY = "nostos.profile";
const listeners = new Set<() => void>();
let memory: string | null = null;

/** Un id guardado que ya no existe en la tripulación cae al perfil de la demo. */
export const resolveProfile = (raw: string | null) =>
  CREW.some((c) => c.id === raw) ? raw! : ME;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return memory;
  }
}

export function setActiveProfile(id: string) {
  if (!CREW.some((c) => c.id === id)) return;
  memory = id;
  try {
    window.localStorage.setItem(KEY, id);
  } catch {
    // Sin almacenamiento: queda en memoria para esta pestaña.
  }
  listeners.forEach((l) => l());
}

/** Vuelve al perfil de la demo (reinicio del panel /demo, HU-28). */
export function resetActiveProfile() {
  memory = null;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Sin almacenamiento: solo se limpia la memoria.
  }
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export const useActiveProfile = () =>
  useSyncExternalStore(
    subscribe,
    () => resolveProfile(readRaw()),
    () => ME,
  );
