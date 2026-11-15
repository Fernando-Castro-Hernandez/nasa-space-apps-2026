// Fixtures de la referencia visual: no representan mediciones ni servicios.
// Los textos son getters: se leen en el idioma activo al usarlos.
import { DASHBOARD_BASELINE, EVOLUTION } from "@/data/dashboard";
import type { Baselines } from "@/domain/semaphore";
import { t } from "@/i18n";
import type { DashboardMetric, MetricKey } from "./types";

// Hora fija de la referencia visual: se lee igual en los dos idiomas, en 24 h
// con dos cifras como las demás horas de la misión ("06:45").
export const DEMO_READING_TIME = "09:24";
export const DEMO_COMPANION_PAIR = {
  needsId: "mei",
  companionId: "omar",
  get action() {
    return t("data.companion.askSleep");
  },
};

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
  bpm: {
    get label() {
      return t("common.metrics.bpm");
    },
    get unit() {
      return t("common.units.bpm");
    },
  },
  hrv: {
    get label() {
      return t("common.metrics.hrv");
    },
    tech: "HRV",
    get unit() {
      return t("common.units.ms");
    },
  },
  spo2: {
    get label() {
      return t("common.metrics.spo2");
    },
    tech: "SpO₂",
    get unit() {
      return t("common.units.percent");
    },
  },
};

export const DEMO_SERIES = {
  ...EVOLUTION,
  bpm: { ...EVOLUTION.bpm, week: [71, 77, 74, 70, 71, 75, 72] },
};
