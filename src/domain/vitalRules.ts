// Reglas de signos vitales del semáforo (HU-12), textuales de FUENTES.md §2.
// Se evalúan por tendencia de varios días; el rojo sale de una lectura y
// exige confirmación con una segunda lectura de 60 s (NEWS2).
import { type BaselineResult, isBaseline, mean } from "@/domain/baseline";
import { finding, type Finding, PENDING } from "@/domain/finding";
import { SOURCES } from "@/domain/sources";

/** Desviación mínima que cuenta como cambio: 0.5 DE (Plews 2012). */
const SD_FACTOR = 0.5;
/** La media semanal de HRV necesita al menos 3 lecturas válidas (Plews 2014). */
const MIN_HRV_READINGS = 3;

export type Confirmable = { value: number; confirmed: boolean };

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

const insufficient = (id: string, hazard: Finding["hazard"]): Finding => ({
  ...ok(`${id}-insufficient`, hazard, "línea base insuficiente"),
  insufficient: true,
});

/** HRV: media de 7 días de ln RMSSD por debajo de base − 0.5 DE → amarillo.
 *  Sin rojo: FUENTES.md lo marca pendiente de validar. Peligro I. */
export function hrvRule(base: BaselineResult | undefined, week: number[]) {
  if (!isBaseline(base)) return insufficient("hrv", "I");
  const valid = week.filter(Number.isFinite);
  if (valid.length < MIN_HRV_READINGS) {
    return {
      ...insufficient("hrv", "I"),
      reason: "pocas lecturas esta semana",
    };
  }
  if (mean(valid)! < base.mean - SD_FACTOR * base.sd) {
    return finding({
      id: "hrv-low",
      hazard: "I",
      status: "ambar",
      reason: "recuperación (HRV) bajo tu normal en la media de 7 días",
      source: SOURCES.plews2012,
    });
  }
  return ok("hrv-ok", "I", "recuperación en tu normal");
}

/** Pulso en reposo. Rojo: ≥ 131, o ≤ 40 y bajo base − 0.5 DE, confirmado.
 *  Amarillo: media de 3 días sobre base + 0.5 DE. Peligro G. */
export function pulseRule(
  base: BaselineResult | undefined,
  last3: number[],
  latest?: Confirmable,
) {
  if (latest) {
    const lowAlarm =
      isBaseline(base) &&
      latest.value <= 40 &&
      latest.value < base.mean - SD_FACTOR * base.sd;
    if (latest.value >= 131 || lowAlarm) {
      return finding(
        latest.confirmed
          ? {
              id: "pulse-red",
              hazard: "G",
              status: "rojo",
              reason: `pulso de ${latest.value} lpm fuera de rango`,
              source: SOURCES.news2,
            }
          : doubtful("pulse", "G"),
      );
    }
  }
  if (!isBaseline(base)) return insufficient("pulse", "G");
  const m = mean(last3);
  if (m !== null && m > base.mean + SD_FACTOR * base.sd) {
    return finding({
      id: "pulse-high",
      hazard: "G",
      status: "ambar",
      reason: "pulso en reposo sobre tu normal en la media de 3 días",
      source: SOURCES.plews2012,
    });
  }
  return ok("pulse-ok", "G", "pulso en tu normal");
}

/** SpO2. Rojo: ≤ 91 % confirmado. Amarillo: lecturas < 94 % o caída
 *  sostenida de 3 puntos o más contra la base. Peligro E. */
export function spo2Rule(
  base: BaselineResult | undefined,
  recent: number[],
  latest?: Confirmable,
) {
  if (latest && latest.value <= 91) {
    return finding(
      latest.confirmed
        ? {
            id: "spo2-red",
            hazard: "E",
            status: "rojo",
            reason: `oxígeno en ${latest.value} %`,
            source: SOURCES.news2,
          }
        : doubtful("spo2", "E"),
    );
  }
  const below94 = recent.some((v) => v < 94);
  const m = mean(recent);
  const drop = isBaseline(base) && m !== null && base.mean - m >= 3;
  if (below94 || drop) {
    return finding({
      id: "spo2-low",
      hazard: "E",
      status: "ambar",
      reason: below94 ? "oxígeno bajo 94 %" : "oxígeno 3 puntos bajo tu normal",
      source: SOURCES.bts2017,
    });
  }
  return ok("spo2-ok", "E", "oxígeno en tu normal");
}

/** Sueño: media de 3 noches < 7 h y bajo base − 0.5 DE. Sin rojo. Peligro I. */
export function sleepRule(base: BaselineResult | undefined, last3: number[]) {
  if (!isBaseline(base)) return insufficient("sleep", "I");
  const m = mean(last3);
  if (m !== null && m < 7 && m < base.mean - SD_FACTOR * base.sd) {
    return finding({
      id: "sleep-low",
      hazard: "I",
      status: "ambar",
      reason: `dormiste ${m.toFixed(1)} h en promedio las últimas 3 noches`,
      source: SOURCES.aasm2015,
    });
  }
  return ok("sleep-ok", "I", "sueño en tu normal");
}

/** Prueba de reacción: lapsos sobre base + 0.5 DE. El umbral está pendiente
 *  de validar, así que como mucho da amarillo. Peligro I. */
export function reactionRule(base: BaselineResult | undefined, lapses: number) {
  if (!isBaseline(base)) return insufficient("reaction", "I");
  if (lapses > base.mean + SD_FACTOR * base.sd) {
    return finding({
      id: "reaction-lapses",
      hazard: "I",
      status: "ambar",
      reason: `más lapsos de atención que tu normal (umbral ${PENDING})`,
      source: null,
    });
  }
  return ok("reaction-ok", "I", "atención en tu normal");
}

function doubtful(id: string, hazard: Finding["hazard"]): Finding {
  return {
    id: `${id}-doubtful`,
    hazard,
    status: "ambar",
    reason: "lectura dudosa, repite la medición",
    source: SOURCES.nhsRepeat,
  };
}
