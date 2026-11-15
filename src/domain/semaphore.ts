// Motor del semáforo (HU-12): junta las reglas de una persona en un día y da
// el estado por peligro (panel RIDGE), el general y el motivo principal.
// La IA no decide nada de esto: solo lo pone en palabras (C23).
import { baselineOf, type BaselineResult, MIN_DAYS } from "@/domain/baseline";
import {
  bySeverity,
  type Finding,
  type Hazard,
  HAZARD_NAME,
  worst,
} from "@/domain/finding";
import { distanceRule, type EarthLink } from "@/domain/distanceRule";
import { co2Rule, exerciseRule, radiationRule } from "@/domain/shipRules";
import {
  type Confirmable,
  hrvRule,
  pulseRule,
  reactionRule,
  sleepRule,
  spo2Rule,
} from "@/domain/vitalRules";
import type { Status } from "@/domain/vitals";

/** Series diarias tomadas antes del vuelo (en la demo, simuladas). */
export type Preflight = {
  lnRmssd?: number[];
  bpm?: number[];
  spo2?: number[];
  sleepHours?: number[];
  lapses?: number[];
};

export type Baselines = Partial<Record<keyof Preflight, BaselineResult>>;

export function baselinesFrom(pre: Preflight, longMission = false): Baselines {
  const min = longMission ? MIN_DAYS.longMission : MIN_DAYS.default;
  const minSleep = longMission ? MIN_DAYS.longMission : MIN_DAYS.sleep;
  const out: Baselines = {};
  for (const key of Object.keys(pre) as (keyof Preflight)[]) {
    out[key] = baselineOf(
      pre[key] ?? [],
      key === "sleepHours" ? minSleep : min,
    );
  }
  return out;
}

/** Lo que hay hoy de una persona. Cada dato es opcional: sin dato, no hay regla. */
export type DayInput = {
  baselines: Baselines;
  /** ln RMSSD de los últimos 7 días. */
  lnRmssdWeek?: number[];
  /** Pulso en reposo de los últimos 3 días. */
  bpmLast3?: number[];
  spo2Recent?: number[];
  sleepLast3?: number[];
  lapses?: number;
  /** Última lectura del sensor, para el rojo con confirmación. */
  latest?: { bpm?: Confirmable; spo2?: Confirmable };
  /** Enlace con Tierra: mueve la luz D (Distancia). */
  earth?: EarthLink;
  ship?: {
    co2OneHourMmhg?: number;
    doseMsv?: number;
    exerciseLast7Days?: number;
  };
};

export type DayAssessment = {
  findings: Finding[];
  byHazard: Record<Hazard, Status>;
  overall: Status;
  /** El hallazgo que explica el estado general, o null si todo está bien. */
  top: Finding | null;
};

const HAZARDS: Hazard[] = ["R", "I", "D", "G", "E"];

export function assessDay(d: DayInput): DayAssessment {
  const b = d.baselines;
  const findings: Finding[] = [];
  if (d.lnRmssdWeek) findings.push(hrvRule(b.lnRmssd, d.lnRmssdWeek));
  if (d.bpmLast3 || d.latest?.bpm)
    findings.push(pulseRule(b.bpm, d.bpmLast3 ?? [], d.latest?.bpm));
  if (d.spo2Recent || d.latest?.spo2)
    findings.push(spo2Rule(b.spo2, d.spo2Recent ?? [], d.latest?.spo2));
  if (d.sleepLast3) findings.push(sleepRule(b.sleepHours, d.sleepLast3));
  if (d.lapses !== undefined) findings.push(reactionRule(b.lapses, d.lapses));
  const ship = d.ship ?? {};
  if (ship.co2OneHourMmhg !== undefined)
    findings.push(co2Rule(ship.co2OneHourMmhg));
  if (ship.doseMsv !== undefined) findings.push(radiationRule(ship.doseMsv));
  if (ship.exerciseLast7Days !== undefined)
    findings.push(exerciseRule(ship.exerciseLast7Days));
  if (d.earth) findings.push(distanceRule(d.earth));
  return summarize(findings);
}

/** Estado por peligro y general. El estado se basa en las reglas, que ya
 *  usan tendencias de varios días; una lectura suelta solo cuenta para rojo. */
export function summarize(findings: Finding[]): DayAssessment {
  const byHazard = Object.fromEntries(
    HAZARDS.map((h) => [
      h,
      worst(findings.filter((f) => f.hazard === h).map((f) => f.status)),
    ]),
  ) as Record<Hazard, Status>;
  const sorted = [...findings].sort(bySeverity);
  const top = sorted[0] && sorted[0].status !== "verde" ? sorted[0] : null;
  return {
    findings,
    byHazard,
    overall: worst(findings.map((f) => f.status)),
    top,
  };
}

/** Motivo en una línea, con la letra del peligro: "G · Gravedad: …". La
 *  palabra del estado (Bien, Precaución, Atención) la pone la pantalla. */
export const reasonLine = (f: Finding) =>
  `${f.hazard} · ${HAZARD_NAME[f.hazard]}: ${f.reason}`;
