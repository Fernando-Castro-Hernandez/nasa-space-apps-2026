// La lectura del día: una sola fuente para Inicio, Mi estado y lo que Lunito
// sabe al conversar. Si el perfil se midió hoy con la estación, es esa lectura;
// si no, la de muestra que elige el panel /demo. El estado, el motivo y la
// autonomía salen de las mismas reglas y cálculos que usa el resto de la app.
import { CREW, crewMember, ME, MISSION } from "@/data/crew";
import { DASHBOARD_BASELINE, DASHBOARD_READINGS } from "@/data/dashboard";
import { HAZARD_NAME, worst, type Hazard } from "@/domain/finding";
import { assessDay } from "@/domain/semaphore";
import { pulseRule, spo2Rule } from "@/domain/vitalRules";
import type { Reading } from "@/domain/vitals";
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
import {
  type SavedReading,
  useSensorReading,
} from "@/features/sensor/sensorReadingStore";
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
  /** La lectura real de hoy del perfil, si se midió con la estación. */
  sensorReading?: SavedReading | null;
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

/** Hora local en 24 h con dos cifras, como las demás horas de la misión. */
const clock = (ms: number) => {
  const date = new Date(ms);
  return [date.getHours(), date.getMinutes()]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
};

const wasRed = (finding: { status: string }) => finding.status === "rojo";

/** La lectura de la estación como la leen las reglas. Un rojo por pulso o
 *  SpO2 exige dos lecturas seguidas (FUENTES.md): queda confirmado solo si la
 *  medición anterior del día también lo daba, según las mismas reglas. */
function liveReading(live: SavedReading) {
  const before = live.previous;
  return {
    bpm: {
      value: live.bpm,
      confirmed:
        !!before &&
        wasRed(
          pulseRule(DEMO_BASELINES.bpm, [], {
            value: before.bpm,
            confirmed: true,
          }),
        ),
    },
    spo2: {
      value: live.spo2,
      confirmed:
        !!before &&
        wasRed(
          spo2Rule(DEMO_BASELINES.spo2, [], {
            value: before.spo2,
            confirmed: true,
          }),
        ),
    },
  };
}

export function buildLunitoDashboard({
  profileId = ME,
  readingIndex = 0,
  sensorReading = null,
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
  // Un escenario elegido en /demo (Precaución, Atención) manda sobre el
  // sensor: es el control explícito de quien presenta (HU-28).
  const live = scenario === 0 ? sensorReading : null;
  const sampleReading = DASHBOARD_READINGS[scenario]!.reading;
  // Sin intervalos entre latidos la estación no mide la HRV: hoy queda "sin
  // medir" y no se rellena con un valor de muestra.
  const hrvMissing = !!live && live.hrv === null;
  const reading: Reading = live
    ? {
        bpm: live.bpm,
        spo2: live.spo2,
        // Solo para el movimiento de Lunito cuando falta: su valor habitual.
        hrv: live.hrv ?? DASHBOARD_BASELINE.hrv.mean,
      }
    : sampleReading;
  const latest = live
    ? liveReading(live)
    : {
        bpm: { value: reading.bpm, confirmed: reading.confirmed ?? false },
        spo2: { value: reading.spo2, confirmed: reading.confirmed ?? false },
      };
  const metrics = METRIC_KEYS.map((key) => {
    const sample = DEMO_SERIES[key];
    const missing = key === "hrv" && hrvMissing;
    // Sin lectura de hoy, la semana se queda en los seis días anteriores.
    const week = missing ? sample.week.slice(0, 6) : [...sample.week];
    if (!missing) week[6] = reading[key];
    // Los escenarios alternativos simulan tres días, no una alerta por una
    // lectura aislada; el motor conserva sus reglas clínicas de tendencia.
    if (scenario > 0)
      week.splice(4, 3, ...Array.from({ length: 3 }, () => reading[key]));
    const domain: [number, number] = [sample.domain[0], sample.domain[1]];
    return {
      key,
      ...METRIC_COPY[key],
      value: missing ? null : reading[key],
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
    latest,
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
    source: live ? "sensor" : "demo",
    profile: { id: profile.id, name: profile.name, role: profile.role },
    reading: {
      ...reading,
      time: live ? clock(live.takenAt) : DEMO_READING_TIME,
    },
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
  const sensorReading = useSensorReading(profileId);
  const shared = useShared();
  const co2 = useCo2State();
  const emergency = useCase();
  return buildLunitoDashboard({
    profileId,
    readingIndex,
    sensorReading,
    shared,
    co2,
    awaitingEarth:
      !!emergency && !emergency.closedAt && emergency.orders.length === 0,
  });
}
