// Historial de muestra para las gráficas, simulado y etiquetado como pide
// SISTEMA.md. Las semanas son promedios; "baseline" es la línea base.
// Las etiquetas (nombre, unidad, día, semana) son getters: se leen en el
// idioma activo al usarlas.
import type { DayPoint } from "@/components/premium/chart-14/charts-14";
import type { WeekPoint } from "@/components/premium/chart-17/charts-17";
import { SAMPLE_BASELINE } from "@/data/sample";
import { t, type MessageKey } from "@/i18n";

export type IndicatorKey = "bpm" | "spo2" | "hrv";

export type IndicatorHistory = {
  label: string;
  unit: string;
  baseline: number;
  days: DayPoint[];
  weeks: WeekPoint[];
};

/** Letra de cada día, de lunes a domingo. */
const DAYS: MessageKey[] = [
  "common.weekdays.mon",
  "common.weekdays.tue",
  "common.weekdays.wed",
  "common.weekdays.thu",
  "common.weekdays.fri",
  "common.weekdays.sat",
  "common.weekdays.sun",
];

const series = (
  label: () => string,
  unit: () => string,
  baseline: number,
  days: number[],
  weeks: number[],
): IndicatorHistory => ({
  get label() {
    return label();
  },
  get unit() {
    return unit();
  },
  baseline,
  days: days.map((value, i) => ({
    get day() {
      return t(DAYS[i]!);
    },
    value,
  })),
  weeks: weeks.map((value, i) => ({
    get week() {
      return t("common.weekShort", { n: i + 1 });
    },
    value,
    baseline,
  })),
});

export const HISTORY: Record<IndicatorKey, IndicatorHistory> = {
  bpm: series(
    () => t("data.history.restingPulse"),
    () => t("common.units.bpm"),
    SAMPLE_BASELINE.bpm.mean,
    [59, 61, 60, 63, 64, 66, 61],
    [60, 61, 62, 63],
  ),
  spo2: series(
    () => t("data.history.oxygen"),
    // Símbolo y sigla: iguales en todos los idiomas.
    () => "% SpO2",
    SAMPLE_BASELINE.spo2.mean,
    [97, 97, 96, 97, 97, 96, 97],
    [97, 97, 96.5, 96.8],
  ),
  hrv: series(
    () => t("data.history.recovery"),
    () => t("common.units.ms"),
    SAMPLE_BASELINE.hrv.mean,
    [51, 49, 47, 44, 42, 40, 52],
    [50, 48, 45, 46],
  ),
};
