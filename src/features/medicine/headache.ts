// Protocolo de dolor de cabeza (docs/FUENTES.md §3) como función pura.
// No diagnostica: ordena las preguntas del protocolo y devuelve a quién acudir
// y qué autocuidado es posible. Cada regla cita su fuente en FUENTES.md.
import type { Status } from "@/domain/vitals";

/** Banderas rojas de SNNOOP10 (Do et al., Neurology 2019). */
export const RED_FLAGS = [
  "¿Empezó de golpe o es el peor dolor de tu vida?",
  "¿Tienes debilidad, problemas para hablar, confusión o visión alterada?",
  "¿Tienes fiebre con rigidez de cuello?",
  "¿Te golpeaste la cabeza hace poco?",
  "¿Empeora al toser, hacer esfuerzo o cambiar de postura?",
  "¿Notaste un cambio nuevo en la visión?",
] as const;

export type HeadacheAnswers = {
  /** Una respuesta por bandera roja, en el orden de RED_FLAGS. */
  redFlags: boolean[];
  analgesicDaysThisMonth: number;
  fever: boolean;
  worseningOrOver10Days: boolean;
  /** Hígado, riñón, presión alta, corazón o asma. */
  chronicCondition: boolean;
  ulcerOrBleeding: boolean;
  ate: boolean;
  /** Tabletas de paracetamol de 500 mg tomadas en las últimas 24 h. */
  paracetamolTablets24h: number;
};

export type SpaceContext = {
  co2Avg7dMmHg: number;
  co2Avg1hMmHg: number;
  flightDay: number;
  nauseaOrCongestion: boolean;
};

export type HeadacheResult = {
  level: Status;
  /** Quién atiende: tú, el oficial médico o el cirujano de vuelo. */
  who: "autocuidado" | "oficial médico" | "cirujano de vuelo";
  reasons: string[];
  checkVentilation: boolean;
  spaceAdaptation: boolean;
  ibuprofen: "permitido" | "no";
  ibuprofenNeedsFood: boolean;
  /** Tabletas de 500 mg que aún caben en la referencia de venta libre. */
  paracetamolRemaining: number;
};

/** Referencia de venta libre (DailyMed), la más conservadora: FUENTES.md §3. */
export const OTC_PARACETAMOL_MAX_TABLETS_24H = 6;
// OCHMO-TB-004 (NASA-STD-3001 V2 6004).
const CO2_7D_LIMIT = 2.5;
const CO2_1H_LIMIT = 3;
// ICHD-3 8.2.3: analgésicos 15 días o más en el mes.
const OVERUSE_DAYS = 15;
// OCHMO-TB-033: adaptación al espacio en la primera semana.
const FIRST_WEEK = 7;

export function assessHeadache(
  a: HeadacheAnswers,
  ctx: SpaceContext,
): HeadacheResult {
  const checkVentilation =
    ctx.co2Avg7dMmHg > CO2_7D_LIMIT || ctx.co2Avg1hMmHg > CO2_1H_LIMIT;
  const spaceAdaptation = ctx.flightDay <= FIRST_WEEK && ctx.nauseaOrCongestion;
  const ibuprofenBlocked = a.chronicCondition || a.ulcerOrBleeding;
  const base = {
    checkVentilation,
    spaceAdaptation,
    ibuprofen: ibuprofenBlocked ? "no" : "permitido",
    ibuprofenNeedsFood: !ibuprofenBlocked && !a.ate,
    paracetamolRemaining: Math.max(
      0,
      OTC_PARACETAMOL_MAX_TABLETS_24H - a.paracetamolTablets24h,
    ),
  } as const;

  if (a.redFlags.some(Boolean)) {
    return {
      ...base,
      level: "rojo",
      who: "cirujano de vuelo",
      reasons: ["Respondiste sí a una pregunta de descarte."],
    };
  }

  const reasons = [
    a.analgesicDaysThisMonth >= OVERUSE_DAYS &&
      "Tomaste analgésicos 15 días o más este mes.",
    a.fever && "Tienes fiebre.",
    a.worseningOrOver10Days && "El dolor empeora o dura más de 10 días.",
    a.chronicCondition &&
      "Tienes una condición que impide el ibuprofeno; el oficial médico debe saberlo.",
  ].filter((r): r is string => typeof r === "string");

  if (reasons.length > 0) {
    return { ...base, level: "ambar", who: "oficial médico", reasons };
  }
  return { ...base, level: "verde", who: "autocuidado", reasons: [] };
}
