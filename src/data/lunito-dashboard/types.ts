import type { CrewMember } from "@/data/crew";
import type { EvolutionKey } from "@/data/dashboard";
import type { Hazard } from "@/domain/finding";
import type { Baseline, Reading, Status } from "@/domain/vitals";

export type MetricKey = EvolutionKey;
export type DashboardSeries = {
  week: number[];
  month: number[];
  domain: [number, number];
};
export type DashboardMetric = DashboardSeries & {
  key: MetricKey;
  label: string;
  tech?: string;
  unit: string;
  value: number;
  status: Status;
};
export type DashboardHazard = { key: Hazard; label: string; status: Status };
export type DashboardCompanion = { id: string; name: string; action: string };

/** Autonomía de la tripulación: casos bien atendidos (resueltos a bordo o
 *  escalados a tiempo) sobre casos cerrados. `ratio` va de 0 a 1. */
export type DashboardAutonomy = {
  ratio: number;
  wellHandled: number;
  closed: number;
};

export type LunitoDashboard = {
  source: "demo";
  profile: Pick<CrewMember, "id" | "name" | "role">;
  reading: Reading & { time: string };
  /** Línea base personal con la que las reglas leen la lectura. */
  baseline: Baseline;
  status: Status;
  reason: string | null;
  metrics: DashboardMetric[];
  series: Record<MetricKey, DashboardSeries>;
  mission: {
    day: number;
    phase: string;
    delayMinutes: number;
    companion: DashboardCompanion | null;
    autonomy: DashboardAutonomy;
    /** Meta de la fase, de 0 a 1. */
    target: number;
    ridge: DashboardHazard[];
  };
  isCommander: boolean;
};
