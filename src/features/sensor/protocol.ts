// Contrato de datos con la estación de check-in (HU-03): un ESP32-C3 con un
// MAX30102 que avisa por Bluetooth LE una vez por segundo. Los identificadores
// son los del firmware; si cambian allá, cambian aquí.
export const SENSOR_NAME = "ESP32C3-Salud";
export const SENSOR_SERVICE = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
export const SENSOR_CHARACTERISTIC = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

/** Lo que la estación dice en un segundo. */
export type SensorSample = {
  /** Pulso en lpm, o null si en ese segundo no hubo un valor válido. */
  bpm: number | null;
  /** SpO2 en %, o null si no hubo un valor válido. */
  spo2: number | null;
  /** Hay un dedo en el sensor. El formato de dos campos manda "0,0" tanto sin
   *  dedo como mientras la señal se asienta: ahí no se sabe y queda en false. */
  contact: boolean;
  /** Intervalos entre latidos de ese segundo, en ms. Solo llegan con el
   *  formato extendido; con ellos la app calcula la HRV (C1 de HISTORIAS.md). */
  intervals: number[];
};

// Límites de lo que el firmware puede medir (40–170 lpm, SpO2 de 70 a 100).
// Son filtros de formato para descartar basura, no umbrales de salud.
const BPM_RANGE = [30, 220] as const;
const SPO2_RANGE = [50, 100] as const;
const INTERVAL_RANGE = [300, 2000] as const;

const within = (value: number, [min, max]: readonly [number, number]) =>
  value >= min && value <= max;

/**
 * Lee un mensaje de la estación.
 *
 * - Formato actual: `"pulso,spo2"`, con `0` cuando no hay dato válido.
 * - Formato extendido (opcional): `"pulso,spo2,intervalo,intervalo…"`, y `-1`
 *   en vez de `0` cuando hay dedo pero el valor todavía no es confiable.
 *
 * Devuelve null si el mensaje no tiene esa forma.
 */
export function parseSample(text: string): SensorSample | null {
  const fields = text.replaceAll("\0", "").trim().split(",");
  if (fields.length < 2 || fields.some((field) => !/^-?\d+$/.test(field)))
    return null;
  const [bpm, spo2, ...rest] = fields.map(Number) as [
    number,
    number,
    ...number[],
  ];
  const sample = {
    bpm: within(bpm, BPM_RANGE) ? bpm : null,
    spo2: within(spo2, SPO2_RANGE) ? spo2 : null,
  };
  return {
    ...sample,
    contact:
      bpm === -1 || spo2 === -1 || sample.bpm !== null || sample.spo2 !== null,
    intervals: rest.filter((ms) => within(ms, INTERVAL_RANGE)),
  };
}
