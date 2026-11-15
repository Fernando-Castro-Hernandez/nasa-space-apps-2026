// Caso abierto compartido entre la nave (/emergencia) y Tierra (/tierra).
// Vive en localStorage para que, en la demo, otra pestaña del mismo navegador
// se actualice en vivo con el evento "storage". Si localStorage no está
// disponible (modo privado, jsdom), se usa memoria.
import { useEffect, useState, useSyncExternalStore } from "react";
import type { EmergencyCase } from "./caseLogic";

const KEY = "nostos.case";
const listeners = new Set<() => void>();
let memory: string | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return memory;
  }
}

function writeRaw(raw: string | null) {
  memory = raw;
  try {
    if (raw === null) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, raw);
  } catch {
    // Sin almacenamiento: queda en memoria para esta pestaña.
  }
  listeners.forEach((l) => l());
}

// El snapshot debe ser estable mientras el texto guardado no cambie.
let cachedRaw: string | null = null;
let cachedCase: EmergencyCase | null = null;

function snapshot(): EmergencyCase | null {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedCase;
  cachedRaw = raw;
  try {
    cachedCase = raw ? (JSON.parse(raw) as EmergencyCase) : null;
  } catch {
    cachedCase = null;
  }
  return cachedCase;
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

export const useCase = () =>
  useSyncExternalStore(subscribe, snapshot, () => null);

export function saveCase(c: EmergencyCase | null) {
  writeRaw(c ? JSON.stringify(c) : null);
}

/** Aplica un cambio puro al caso guardado (si hay uno). */
export function updateCase(change: (c: EmergencyCase) => EmergencyCase) {
  const current = snapshot();
  if (current) saveCase(change(current));
}

/** Hora actual que se refresca cada segundo, para cuentas regresivas.
 *  Con `active` en false deja de contar (un caso cerrado ya no espera nada). */
export function useNow(active = true) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
}
