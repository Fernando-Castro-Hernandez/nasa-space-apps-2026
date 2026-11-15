// Datos simulados del dashboard de Inicio (referencias 2 y 3 de DISENO.md).
// Todo es de muestra, sin IA ni backend: la persona de la demo tiene una línea
// base propia para que 72 lpm, 45 ms y 98 % salgan "Bien", como en la
// referencia. Las lecturas se eligen desde el panel /demo.
import type { Baseline, Reading } from "@/domain/vitals";
import { t } from "@/i18n";

export const DASHBOARD_BASELINE: Baseline = {
  bpm: { mean: 72, sd: 5 },
  hrv: { mean: 46, sd: 8 },
  spo2: { mean: 98 },
};

export type DashboardReading = { name: string; reading: Reading };

/** Una por estado: Bien, Precaución y Atención. El nombre es la palabra del
 *  estado en el idioma activo. */
export const DASHBOARD_READINGS: DashboardReading[] = [
  {
    get name() {
      return t("common.status.verde");
    },
    reading: { bpm: 72, spo2: 98, hrv: 45 },
  },
  {
    get name() {
      return t("common.status.ambar");
    },
    reading: { bpm: 79, spo2: 97, hrv: 36 },
  },
  {
    get name() {
      return t("common.status.rojo");
    },
    reading: { bpm: 74, spo2: 90, hrv: 40, confirmed: true },
  },
];

export type EvolutionKey = "bpm" | "hrv" | "spo2";

type Series = {
  /** L a D de la semana en curso. */
  week: number[];
  /** Promedio de cada una de las últimas 4 semanas. */
  month: number[];
  /** Rango base del eje; se amplía si un valor se sale. */
  domain: [number, number];
};

export const EVOLUTION: Record<EvolutionKey, Series> = {
  bpm: {
    week: [71, 77, 74, 70, 70.5, 75, 72],
    month: [73, 72, 74, 72],
    domain: [65, 85],
  },
  hrv: {
    week: [40, 46, 42, 45, 42, 51, 45],
    month: [42, 44, 43, 45],
    domain: [30, 60],
  },
  spo2: {
    week: [97.8, 98.2, 97.6, 98, 97.8, 98.4, 98],
    month: [97.9, 98, 97.8, 98],
    domain: [96, 100],
  },
};
