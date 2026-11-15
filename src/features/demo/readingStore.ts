// Lectura de muestra que ve Inicio (Bien, Precaución o Atención), elegida
// desde /demo para mostrar cada estado sin sensor.
import { persistedStore } from "@/data/persisted";
import { DASHBOARD_READINGS } from "@/data/dashboard";

export const parseReading = (raw: string | null) => {
  const i = Number(raw);
  return Number.isInteger(i) && i >= 0 && i < DASHBOARD_READINGS.length ? i : 0;
};

const store = persistedStore<number>("nostos.reading", parseReading, String);

export const useReadingIndex = store.use;

export const setReadingIndex = (i: number) =>
  i === 0 ? store.clear() : store.set(i);
