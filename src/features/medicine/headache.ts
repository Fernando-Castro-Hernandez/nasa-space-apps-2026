// Protocolo de dolor de cabeza (docs/FUENTES.md §3) como función pura.
// No diagnostica: ordena las preguntas del protocolo y devuelve a quién acudir
// y qué autocuidado es posible. Cada regla cita su fuente en FUENTES.md.
import type { Status } from "@/domain/vitals";
import type { Co2State } from "@/features/demo/demoStore";
import { t } from "@/i18n";

/** Banderas rojas de SNNOOP10 (Do et al., Neurology 2019). Su pregunta, en
 *  el idioma activo, está en medicine.headache.redFlags (redFlagQuestion). */
export const RED_FLAGS = [
  "sudden",
  "neuro",
  "neck",
  "trauma",
  "strain",
  "vision",
] as const;
export type RedFlag = (typeof RED_FLAGS)[number];

export const redFlagQuestion = (flag: RedFlag) =>
  t(`medicine.headache.redFlags.${flag}`);

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

/**
 * Feed de la nave simulado para la demo (SISTEMA.md §11). El CO2 de una hora
 * sigue el evento del panel /demo con los mismos valores que la lectura del
 * día (lunitoDashboard.ts): 3.8 mmHg con el CO2 alto y 2 mmHg si no, así que
 * el aviso de ventilación solo sale cuando la demo lo tiene alto.
 */
export const cabinContext = (
  co2: Co2State,
  flightDay: number,
): SpaceContext => ({
  co2Avg7dMmHg: 2.1,
  co2Avg1hMmHg: co2 === "alto" ? 3.8 : 2,
  flightDay,
  nauseaOrCongestion: false,
});

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
      reasons: [t("medicine.headache.reasons.redFlag")],
    };
  }

  const reasons = [
    a.analgesicDaysThisMonth >= OVERUSE_DAYS &&
      t("medicine.headache.reasons.overuse"),
    a.fever && t("medicine.headache.reasons.fever"),
    a.worseningOrOver10Days && t("medicine.headache.reasons.worsening"),
    a.chronicCondition && t("medicine.headache.reasons.chronic"),
  ].filter((r): r is string => typeof r === "string");

  if (reasons.length > 0) {
    return { ...base, level: "ambar", who: "oficial médico", reasons };
  }
  return { ...base, level: "verde", who: "autocuidado", reasons: [] };
}
