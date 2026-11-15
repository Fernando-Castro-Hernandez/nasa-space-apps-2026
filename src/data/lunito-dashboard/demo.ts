// Fixtures de la referencia visual: no representan mediciones ni servicios.
import { DASHBOARD_BASELINE, EVOLUTION } from "@/data/dashboard";
import type { Baselines } from "@/domain/semaphore";
import type { CaseOutcome } from "@/features/crew/autonomy";
import type { DashboardMetric, MetricKey } from "./types";

export const DEMO_READING_TIME = "9:24";
export const DEMO_COMPANION_PAIR = {
  needsId: "mei",
  companionId: "omar",
  action: "Pregúntale cómo durmió",
};

// El 68 % de la referencia sale de 17 casos bien atendidos de 25 cerrados.
// Es una muestra visual; no modifica la meta operativa del motor existente.
export const DEMO_OUTCOMES: CaseOutcome[] = Array.from(
  { length: 25 },
  (_, i) => (i < 17 ? "resuelto a bordo" : "mal atendido"),
);

export const DEMO_BASELINES: Baselines = {
  bpm: { ...DASHBOARD_BASELINE.bpm, n: 14 },
  lnRmssd: { mean: Math.log(DASHBOARD_BASELINE.hrv.mean), sd: 0.17, n: 14 },
  spo2: { mean: DASHBOARD_BASELINE.spo2.mean, sd: 0.3, n: 14 },
  sleepHours: { mean: 8, sd: 0.5, n: 14 },
};

export const METRIC_KEYS: MetricKey[] = ["bpm", "hrv", "spo2"];

export const METRIC_COPY: Record<
  MetricKey,
  Pick<DashboardMetric, "label" | "tech" | "unit">
> = {
  bpm: { label: "Pulso", unit: "lpm" },
  hrv: { label: "Variabilidad cardíaca", tech: "HRV", unit: "ms" },
  spo2: { label: "Oxígeno en sangre", tech: "SpO₂", unit: "%" },
};

export const DEMO_SERIES = {
  ...EVOLUTION,
  bpm: { ...EVOLUTION.bpm, week: [71, 77, 74, 70, 71, 75, 72] },
};
