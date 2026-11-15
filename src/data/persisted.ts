// Store mínimo sobre localStorage para estado que se comparte entre pestañas
// (perfil activo, eventos de la demo, privacidad). Si localStorage no está
// disponible (modo privado, jsdom) se usa memoria.
// ponytail: solo este navegador; entre dispositivos llegará con HU-29 (D1).
import { useSyncExternalStore } from "react";

export function persistedStore<T>(
  key: string,
  parse: (raw: string | null) => T,
  serialize: (value: T) => string,
) {
  const listeners = new Set<() => void>();
  let memory: string | null = null;
  // useSyncExternalStore exige un snapshot estable mientras el texto no cambie.
  let cachedRaw: string | null | undefined;
  let cachedValue: T = parse(null);

  const readRaw = () => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memory;
    }
  };
  const get = () => {
    const raw = readRaw();
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedValue = parse(raw);
    }
    return cachedValue;
  };
  const write = (raw: string | null) => {
    memory = raw;
    try {
      if (raw === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, raw);
    } catch {
      // Sin almacenamiento: queda en memoria para esta pestaña.
    }
    listeners.forEach((l) => l());
  };
  const subscribe = (onChange: () => void) => {
    listeners.add(onChange);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) onChange();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener("storage", onStorage);
    };
  };

  return {
    get,
    set: (value: T) => write(serialize(value)),
    clear: () => write(null),
    use: () => useSyncExternalStore(subscribe, get, () => parse(null)),
  };
}
