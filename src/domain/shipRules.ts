// Reglas con datos de la nave (HU-12), textuales de FUENTES.md §2.
import { finding, PENDING, type Finding } from "@/domain/finding";
import { SOURCES } from "@/domain/sources";

/** Límite de dosis de la carrera (OCHMO, radiación). */
export const DOSE_LIMIT_MSV = 600;
/** "Cerca" del límite: el margen es una suposición, pendiente de validar. */
const DOSE_NEAR = 0.9;
/** Promedio de ejercicio de la ISS (OCHMO-TB-031). */
export const EXERCISE_MIN_WEEK = 600;
/** CO2: promedio de 1 h sobre 3 mmHg (OCHMO-TB-004). */
export const CO2_ONE_HOUR_MMHG = 3;

const ok = (
  id: string,
  hazard: Finding["hazard"],
  reason: string,
): Finding => ({
  id,
  hazard,
  status: "verde",
  reason,
  source: null,
});

/** CO2 de cabina: amarillo sobre 3 mmHg en 1 h. Sin rojo. Peligro E. */
export function co2Rule(oneHourMmhg: number) {
  if (oneHourMmhg > CO2_ONE_HOUR_MMHG) {
    return finding({
      id: "co2-high",
      hazard: "E",
      status: "ambar",
      reason: `CO2 de cabina en ${oneHourMmhg} mmHg (promedio de 1 h)`,
      source: SOURCES.ochmoCo2,
    });
  }
  return ok("co2-ok", "E", "aire de cabina normal");
}

/** Radiación: rojo al llegar a 600 mSv; amarillo cerca (margen pendiente de
 *  validar, así que nunca sube a rojo por el margen). Peligro R. */
export function radiationRule(doseMsv: number) {
  if (doseMsv >= DOSE_LIMIT_MSV) {
    return finding({
      id: "radiation-limit",
      hazard: "R",
      status: "rojo",
      reason: `dosis acumulada de ${doseMsv} mSv, en el límite de ${DOSE_LIMIT_MSV}`,
      source: SOURCES.ochmoRadiation,
    });
  }
  if (doseMsv >= DOSE_LIMIT_MSV * DOSE_NEAR) {
    return finding({
      id: "radiation-near",
      hazard: "R",
      status: "ambar",
      reason: `dosis acumulada cerca del límite de ${DOSE_LIMIT_MSV} mSv (margen ${PENDING})`,
      source: null,
    });
  }
  return ok("radiation-ok", "R", "dosis dentro del límite");
}

/** Ejercicio: amarillo por debajo de 600 min en los últimos 7 días. Sin rojo.
 *  Peligro G. */
export function exerciseRule(minutesLast7Days: number) {
  if (minutesLast7Days < EXERCISE_MIN_WEEK) {
    return finding({
      id: "exercise-low",
      hazard: "G",
      status: "ambar",
      reason: `${minutesLast7Days} de ${EXERCISE_MIN_WEEK} min de ejercicio esta semana`,
      source: SOURCES.ochmoExercise,
    });
  }
  return ok("exercise-ok", "G", "ejercicio al día");
}
