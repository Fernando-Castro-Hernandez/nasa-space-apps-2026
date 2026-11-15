// Cada burbuja de Inicio abre Mi estado en su indicador: /estado?m=hrv.
import type { MetricKey } from "@/data/lunitoDashboard";

const KEYS: MetricKey[] = ["bpm", "hrv", "spo2"];

/** El indicador que pide la dirección, o el pulso si no pide uno válido. */
export function initialMetric(search: string): MetricKey {
  const asked = new URLSearchParams(search).get("m");
  return KEYS.find((key) => key === asked) ?? "bpm";
}

/** Dirección de Mi estado abierta en `key`. */
export const statusHref = (key: MetricKey) => `/estado?m=${key}`;
