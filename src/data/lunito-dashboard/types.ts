import type { CrewMember } from "@/data/crew";
import type { EvolutionKey } from "@/data/dashboard";
import type { Hazard } from "@/domain/finding";
import type { Status } from "@/domain/vitals";

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

export type LunitoDashboard = {
  source: "demo";
  capabilities: {
    backend: false;
    remoteEncouragement: false;
    liveSensor: false;
  };
  profile: Pick<CrewMember, "id" | "name" | "role">;
  reading: { bpm: number; hrv: number; spo2: number; time: string };
  status: Status;
  reason: string | null;
  metrics: DashboardMetric[];
  series: Record<MetricKey, DashboardSeries>;
  mission: {
    day: number;
    phase: string;
    delayMinutes: number;
    companion: DashboardCompanion | null;
    autonomy: number;
    target: number;
    ridge: DashboardHazard[];
  };
  isCommander: boolean;
};
