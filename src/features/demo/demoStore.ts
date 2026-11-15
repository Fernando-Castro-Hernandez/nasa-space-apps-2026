// Eventos simulados de la demo (HU-28, SISTEMA.md §11). Vive en localStorage
// para que el panel /demo en un dispositivo mueva la app abierta en otro del
// mismo navegador; si no hay almacenamiento, queda en memoria.
// ponytail: solo este navegador; entre dispositivos llegará con HU-29.
import { useSyncExternalStore } from "react";

const KEY = "nostos.demo";
export const CO2_MODULE = "Módulo de laboratorio";
const listeners = new Set<() => void>();
let memory = false;

export const parseCo2Raised = (raw: string | null) => raw === "co2";

function read(): boolean {
  try {
    return parseCo2Raised(window.localStorage.getItem(KEY));
  } catch {
    return memory;
  }
}

export function setCo2Raised(raised: boolean) {
  memory = raised;
  try {
    if (raised) window.localStorage.setItem(KEY, "co2");
    else window.localStorage.removeItem(KEY);
  } catch {
    // Sin almacenamiento: queda en memoria para esta pestaña.
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

export const useCo2Raised = () =>
  useSyncExternalStore(subscribe, read, () => false);
