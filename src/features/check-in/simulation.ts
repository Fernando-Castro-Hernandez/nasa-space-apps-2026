// Simulación del check-in para la demo: cuenta regresiva y lecturas del
// MAX30102 que se estabilizan. La lectura final es la muestra "Poco descanso".
import { SAMPLE_READINGS } from "@/data/sample";
import type { Reading } from "@/domain/vitals";

export const VOICE_SECONDS = 30;
export const SENSOR_SECONDS = 60;

export const FINAL_READING: Reading = SAMPLE_READINGS.find(
  (s) => s.name === "Poco descanso",
)!.reading;

/** Segundos restantes de una cuenta regresiva, nunca negativos. */
export const secondsLeft = (elapsed: number, total: number) =>
  Math.max(0, total - Math.floor(elapsed));

/** Pulso y SpO2 en vivo: oscilan al principio y convergen a la lectura final. */
export function liveVitals(elapsed: number) {
  const settle = Math.max(0, 1 - elapsed / 20);
  return {
    bpm: Math.round(FINAL_READING.bpm + Math.sin(elapsed * 1.7) * 6 * settle),
    spo2: Math.round(
      FINAL_READING.spo2 - Math.abs(Math.sin(elapsed)) * 2 * settle,
    ),
  };
}
