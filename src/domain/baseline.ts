// Línea base personal y HRV (HU-11). Reglas y fuentes en docs/FUENTES.md §1:
// media y DE de los días previos al vuelo; con menos días no hay amarillo.

export type Baseline = { mean: number; sd: number; n: number };
export type BaselineResult = Baseline | { insufficient: true; n: number };

/** Días mínimos (FUENTES.md §1): 7 para HRV y pulso; 6 noches para el sueño
 *  autorreportado (Aili 2017). En misiones largas, 14. */
export const MIN_DAYS = { default: 7, sleep: 6, longMission: 14 } as const;

/** Intervalos entre latidos (ms) fuera de este rango son artefactos del
 *  sensor (equivalen a menos de 30 o más de 200 lpm) y se descartan. */
const RR_MIN = 300;
const RR_MAX = 2000;

const finite = (values: number[]) => values.filter((v) => Number.isFinite(v));

export function mean(values: number[]): number | null {
  const v = finite(values);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

/** Desviación estándar muestral (n − 1). */
export function sd(values: number[]): number | null {
  const v = finite(values);
  const m = mean(v);
  if (m === null || v.length < 2) return null;
  return Math.sqrt(v.reduce((a, x) => a + (x - m) ** 2, 0) / (v.length - 1));
}

/** RMSSD en ms a partir de intervalos entre latidos. Necesita al menos dos
 *  intervalos válidos seguidos; si no, null. */
export function rmssd(rr: number[]): number | null {
  const clean = finite(rr).filter((x) => x >= RR_MIN && x <= RR_MAX);
  if (clean.length < 2) return null;
  let sum = 0;
  for (let i = 1; i < clean.length; i++)
    sum += (clean[i]! - clean[i - 1]!) ** 2;
  return Math.sqrt(sum / (clean.length - 1));
}

/** ln RMSSD: la escala con la que FUENTES.md compara la HRV (Plews 2012). */
export function lnRmssd(rr: number[]): number | null {
  const r = rmssd(rr);
  return r && r > 0 ? Math.log(r) : null;
}

/** Línea base de una serie diaria. Con menos días que `minDays` devuelve
 *  "insuficiente" y el indicador no cambia el semáforo. */
export function baselineOf(
  values: number[],
  minDays: number = MIN_DAYS.default,
): BaselineResult {
  const v = finite(values);
  const m = mean(v);
  const s = sd(v);
  if (v.length < minDays || m === null || s === null) {
    return { insufficient: true, n: v.length };
  }
  return { mean: m, sd: s, n: v.length };
}

export const isBaseline = (b: BaselineResult | undefined): b is Baseline =>
  !!b && !("insufficient" in b);
