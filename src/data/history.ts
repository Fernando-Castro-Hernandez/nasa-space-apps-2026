// Historial de muestra para las gráficas, simulado y etiquetado como pide
// SISTEMA.md. Las semanas son promedios; "baseline" es la línea base.
import type { DayPoint } from "@/components/premium/chart-14/charts-14";
import type { WeekPoint } from "@/components/premium/chart-17/charts-17";
import { SAMPLE_BASELINE } from "@/data/sample";

export type IndicatorKey = "bpm" | "spo2" | "hrv";

export type IndicatorHistory = {
  label: string;
  unit: string;
  baseline: number;
  days: DayPoint[];
  weeks: WeekPoint[];
};

const DAYS = ["L", "M", "X", "J", "V", "S", "D"];
const WEEKS = ["Sem 1", "Sem 2", "Sem 3", "Sem 4"];

const series = (
  label: string,
  unit: string,
  baseline: number,
  days: number[],
  weeks: number[],
): IndicatorHistory => ({
  label,
  unit,
  baseline,
  days: days.map((value, i) => ({ day: DAYS[i]!, value })),
  weeks: weeks.map((value, i) => ({ week: WEEKS[i]!, value, baseline })),
});

export const HISTORY: Record<IndicatorKey, IndicatorHistory> = {
  bpm: series(
    "Pulso en reposo",
    "lpm",
    SAMPLE_BASELINE.bpm.mean,
    [59, 61, 60, 63, 64, 66, 61],
    [60, 61, 62, 63],
  ),
  spo2: series(
    "Oxígeno",
    "% SpO2",
    SAMPLE_BASELINE.spo2.mean,
    [97, 97, 96, 97, 97, 96, 97],
    [97, 97, 96.5, 96.8],
  ),
  hrv: series(
    "Recuperación (HRV)",
    "ms",
    SAMPLE_BASELINE.hrv.mean,
    [51, 49, 47, 44, 42, 40, 52],
    [50, 48, 45, 46],
  ),
};
