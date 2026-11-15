// La medición de 60 s del check-in (SISTEMA.md §7.1) y su regla de validez
// (HU-07), como funciones puras: cada mensaje de la estación es un segundo.
//
// Los números de aquí son parámetros de calibración del sensor, no umbrales
// de salud: deciden si una medición sirve, nunca qué significa.
import type { SensorSample } from "./protocol";

/** Duración de la medición. */
export const MEASURE_SECONDS = 60;
/** Una medición con menos segundos válidos no se guarda (HU-07). */
export const MIN_VALID_SECONDS = 30;
/** Salto de pulso entre dos segundos seguidos que cuenta como "se movió". */
export const MAX_BPM_JUMP = 25;
/** Intervalos entre latidos que hacen falta para calcular la HRV. */
export const MIN_INTERVALS = 30;
/** Un intervalo que cambia más que esto respecto al anterior es un latido
 *  perdido o un artefacto de movimiento, y no entra a la HRV. */
const MAX_INTERVAL_CHANGE = 0.2;

/** Por qué la medición volvió a empezar. */
export type MeasureNotice = "moved" | "short";

export type Measurement = {
  /** Segundos contados desde que llegó el primer valor válido. */
  seconds: number;
  valid: { bpm: number; spo2: number }[];
  intervals: number[];
  lastBpm: number | null;
  /** El aviso de la última vez que se reinició, hasta que vuelve la señal. */
  notice: MeasureNotice | null;
  done: boolean;
};

/** Resultado de una medición válida. */
export type SensorReading = {
  bpm: number;
  spo2: number;
  /** HRV (RMSSD, ms), o null si la estación no mandó intervalos suficientes. */
  hrv: number | null;
  validSeconds: number;
};

export const EMPTY_MEASUREMENT: Measurement = {
  seconds: 0,
  valid: [],
  intervals: [],
  lastBpm: null,
  notice: null,
  done: false,
};

const restart = (notice: MeasureNotice): Measurement => ({
  ...EMPTY_MEASUREMENT,
  notice,
});

/** Suma un segundo a la medición. El contador arranca con el primer valor
 *  válido y vuelve a cero si el dedo se va o el pulso salta. */
export function addSample(m: Measurement, s: SensorSample): Measurement {
  if (m.done) return m;
  const both = s.bpm !== null && s.spo2 !== null;
  // Antes de la primera señal no corre el tiempo: el sensor tarda unos 10 s
  // en dar valores después de poner el dedo.
  if (m.seconds === 0 && !both) return m;
  if (m.seconds > 0) {
    const lost = s.bpm === null && s.spo2 === null;
    const jumped =
      s.bpm !== null &&
      m.lastBpm !== null &&
      Math.abs(s.bpm - m.lastBpm) > MAX_BPM_JUMP;
    if (lost || jumped) return restart("moved");
  }
  const next: Measurement = {
    seconds: m.seconds + 1,
    valid: both ? [...m.valid, { bpm: s.bpm!, spo2: s.spo2! }] : m.valid,
    intervals: [...m.intervals, ...s.intervals],
    lastBpm: s.bpm ?? m.lastBpm,
    notice: null,
    done: false,
  };
  if (next.seconds < MEASURE_SECONDS) return next;
  return next.valid.length >= MIN_VALID_SECONDS
    ? { ...next, done: true }
    : restart("short");
}

const median = (values: number[]) => {
  const sorted = values.toSorted((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]!
    : (sorted[mid - 1]! + sorted[mid]!) / 2;
};

/** RMSSD en ms: la raíz de la media de los cuadrados de las diferencias entre
 *  intervalos seguidos. Null si no hay suficientes intervalos limpios. */
export function rmssd(intervals: number[]): number | null {
  const squares: number[] = [];
  for (let i = 1; i < intervals.length; i++) {
    const diff = intervals[i]! - intervals[i - 1]!;
    if (Math.abs(diff) <= MAX_INTERVAL_CHANGE * intervals[i - 1]!)
      squares.push(diff * diff);
  }
  if (squares.length < MIN_INTERVALS - 1) return null;
  return Math.sqrt(squares.reduce((sum, sq) => sum + sq, 0) / squares.length);
}

/** La lectura de una medición terminada: la mediana de los segundos válidos,
 *  que aguanta mejor un valor suelto que el promedio. Null si no terminó. */
export function readingOf(m: Measurement): SensorReading | null {
  if (!m.done) return null;
  const hrv = rmssd(m.intervals);
  return {
    bpm: Math.round(median(m.valid.map((v) => v.bpm))),
    spo2: Math.round(median(m.valid.map((v) => v.spo2))),
    hrv: hrv === null ? null : Math.round(hrv),
    validSeconds: m.valid.length,
  };
}
