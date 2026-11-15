// Eventos ambientales en la tripulación (HU-13): si el aire de un módulo está
// mal y varias personas tienen dolor de cabeza el mismo día, es un evento del
// ambiente (E), no varios casos médicos. La instrucción es revisar ventilación.
import type { Hazard, Source } from "@/domain/finding";
import { CO2_ONE_HOUR_MMHG } from "@/domain/shipRules";
import { SOURCES } from "@/domain/sources";
import type { Status } from "@/domain/vitals";

export type ModuleAir = { module: string; co2OneHourMmhg: number };
export type HeadacheReport = { crewId: string; day: string };

export type EnvironmentalEvent = {
  hazard: "E";
  module: string;
  co2OneHourMmhg: number;
  affected: string[];
  instruction: string;
  source: Source;
};

/** "Dos o más tripulantes" es una regla de diseño, no clínica (HU-13). */
export const MIN_AFFECTED = 2;

export function environmentalEvent(
  air: ModuleAir[],
  headaches: HeadacheReport[],
  day: string,
): EnvironmentalEvent | null {
  const affected = [
    ...new Set(headaches.filter((h) => h.day === day).map((h) => h.crewId)),
  ];
  if (affected.length < MIN_AFFECTED) return null;
  const worstAir = air
    .filter((m) => m.co2OneHourMmhg > CO2_ONE_HOUR_MMHG)
    .sort((a, b) => b.co2OneHourMmhg - a.co2OneHourMmhg)[0];
  if (!worstAir) return null;
  return {
    hazard: "E",
    module: worstAir.module,
    co2OneHourMmhg: worstAir.co2OneHourMmhg,
    affected,
    instruction: `Revisar la ventilación del ${worstAir.module}`,
    source: SOURCES.ochmoCo2,
  };
}

/** La luz E del panel RIDGE: amarilla mientras el evento esté abierto; al
 *  resolverlo vuelve a verde (y cuenta para la autonomía). */
export function withEnvironmentalEvent(
  byHazard: Record<Hazard, Status>,
  event: EnvironmentalEvent | null,
  resolved: boolean,
): Record<Hazard, Status> {
  if (!event || resolved || byHazard.E === "rojo") return byHazard;
  return { ...byHazard, E: "ambar" };
}
