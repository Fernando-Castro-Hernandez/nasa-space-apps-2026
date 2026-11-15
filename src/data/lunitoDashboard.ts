// La lectura del día: una sola fuente para Inicio, Mi estado y lo que Lunito
// sabe al conversar. La lectura la elige el panel /demo; el estado, el motivo y
// la autonomía salen de las mismas reglas y cálculos que usa el resto de la app.
import { CREW, crewMember, ME, MISSION } from "@/data/crew";
import { DASHBOARD_BASELINE, DASHBOARD_READINGS } from "@/data/dashboard";
import { HAZARD_NAME, worst, type Hazard } from "@/domain/finding";
import { assessDay } from "@/domain/semaphore";
import { autonomy, PHASE_GOAL } from "@/features/crew/autonomy";
import { pickCompanion } from "@/features/crew/companion";
import {
  isCommander,
  publicCrew,
  type Shared,
  useShared,
} from "@/features/crew/privacy";
import {
  casesWithCo2,
  type Co2State,
  useCo2State,
} from "@/features/demo/demoStore";
import { useReadingIndex } from "@/features/demo/readingStore";
import { useCase } from "@/features/emergency/caseStore";
import { useActiveProfile } from "@/features/profiles/activeProfile";
import { formatNumber, t } from "@/i18n";
import {
  DEMO_BASELINES,
  DEMO_COMPANION_PAIR,
  DEMO_READING_TIME,
  DEMO_SERIES,
  METRIC_COPY,
  METRIC_KEYS,
} from "./lunito-dashboard/demo";
import type { LunitoDashboard, MetricKey } from "./lunito-dashboard/types";

export type {
  DashboardAutonomy,
  DashboardMetric,
  DashboardHazard,
  LunitoDashboard,
  MetricKey,
} from "./lunito-dashboard/types";

/** Un porcentaje de 0 a 1 en el idioma activo, sin decimales: "92%". Es el
 *  único redondeo de la autonomía. */
export const formatPercent = (ratio: number) =>
  formatNumber(ratio, { style: "percent", maximumFractionDigits: 0 });

type Options = {
  profileId?: string;
  readingIndex?: number;
  shared?: Shared;
  co2?: Co2State;
  awaitingEarth?: boolean;
};

const RULE_PREFIX: Record<MetricKey, string> = {
  bpm: "pulse-",
  hrv: "hrv-",
  spo2: "spo2-",
};
const HAZARDS: Hazard[] = ["R", "I", "D", "G", "E"];

export function buildLunitoDashboard({
  profileId = ME,
  readingIndex = 0,
  shared = {},
  co2 = "normal",
  awaitingEarth = false,
}: Options = {}): LunitoDashboard {
  const profile = CREW.find((m) => m.id === profileId) ?? crewMember(ME);
  const scenario =
    Number.isInteger(readingIndex) &&
    readingIndex >= 0 &&
    readingIndex < DASHBOARD_READINGS.length
      ? readingIndex
      : 0;
  const reading = DASHBOARD_READINGS[scenario]!.reading;
  const metrics = METRIC_KEYS.map((key) => {
    const sample = DEMO_SERIES[key];
    const week = [...sample.week];
    week[6] = reading[key];
    // Los escenarios alternativos simulan tres días, no una alerta por una
    // lectura aislada; el motor conserva sus reglas clínicas de tendencia.
    if (scenario > 0)
      week.splice(4, 3, ...Array.from({ length: 3 }, () => reading[key]));
    const domain: [number, number] = [sample.domain[0], sample.domain[1]];
    return {
      key,
      ...METRIC_COPY[key],
      value: reading[key],
      week,
      month: [...sample.month],
      domain,
    };
  });
  const series = { bpm: metrics[0]!, hrv: metrics[1]!, spo2: metrics[2]! };
  const assessment = assessDay({
    baselines: DEMO_BASELINES,
    bpmLast3: series.bpm.week.slice(-3),
    lnRmssdWeek: series.hrv.week.map(Math.log),
    spo2Recent: series.spo2.week.slice(-3),
    latest: {
      bpm: { value: reading.bpm, confirmed: reading.confirmed ?? false },
      spo2: { value: reading.spo2, confirmed: reading.confirmed ?? false },
    },
  });
  const missionAssessment = assessDay({
    baselines: DEMO_BASELINES,
    sleepLast3: [6, 6, 6],
    earth: { delayMinutes: MISSION.delayMinutes, linkUp: true, awaitingEarth },
    ship: {
      doseMsv: 56.8,
      exerciseLast7Days: 600,
      co2OneHourMmhg: co2 === "alto" ? 3.8 : 2,
    },
  });
  const canViewRidge = isCommander(profile);
  const visibleCrew = publicCrew(CREW, shared);
  const referenceIds = [
    DEMO_COMPANION_PAIR.needsId,
    DEMO_COMPANION_PAIR.companionId,
  ];
  const companion =
    referenceIds.includes(profile.id) &&
    referenceIds.every((id) => visibleCrew.some((member) => member.id === id))
      ? DEMO_COMPANION_PAIR
      : pickCompanion(visibleCrew);
  const paired =
    companion &&
    [companion.needsId, companion.companionId].includes(profile.id);
  const buddyId =
    companion &&
    (companion.needsId === profile.id
      ? companion.companionId
      : companion.needsId);
  // El mismo cálculo que la autonomía de Equipo (AutonomyCard).
  const { ratio, wellHandled, closed } = autonomy(
    casesWithCo2(co2).map((c) => c.outcome),
  );

  return {
    source: "demo",
    profile: { id: profile.id, name: profile.name, role: profile.role },
    reading: { ...reading, time: DEMO_READING_TIME },
    baseline: DASHBOARD_BASELINE,
    status: assessment.overall,
    reason: assessment.top?.reason ?? null,
    metrics: metrics.map((m) => ({
      ...m,
      status: worst(
        assessment.findings
          .filter((f) => f.id.startsWith(RULE_PREFIX[m.key]))
          .map((f) => f.status),
      ),
    })),
    series,
    mission: {
      ...MISSION,
      companion:
        paired && buddyId
          ? {
              id: buddyId,
              name: crewMember(buddyId).name,
              action: t("data.companion.shareCoffee"),
            }
          : null,
      autonomy: { ratio, wellHandled, closed },
      target: PHASE_GOAL,
      ridge: canViewRidge
        ? HAZARDS.map((key) => ({
            key,
            label: HAZARD_NAME[key],
            status: missionAssessment.byHazard[key],
          }))
        : [],
    },
    isCommander: canViewRidge,
  };
}

export function useLunitoDashboard(): LunitoDashboard {
  const profileId = useActiveProfile();
  const readingIndex = useReadingIndex();
  const shared = useShared();
  const co2 = useCo2State();
  const emergency = useCase();
  return buildLunitoDashboard({
    profileId,
    readingIndex,
    shared,
    co2,
    awaitingEarth:
      !!emergency && !emergency.closedAt && emergency.orders.length === 0,
  });
}
