// Datos de muestra para construir y demostrar el dashboard sin sensor.
// Línea base simulada y etiquetada, como pide SISTEMA.md para la demo.
import type { Baseline, Reading } from "@/domain/vitals";

export const SAMPLE_BASELINE: Baseline = {
  bpm: { mean: 60, sd: 4 },
  hrv: { mean: 50, sd: 8 },
  spo2: { mean: 97 },
};

export const SAMPLE_READINGS: { name: string; reading: Reading }[] = [
  { name: "Normal", reading: { bpm: 61, spo2: 97, hrv: 52 } },
  { name: "Poco descanso", reading: { bpm: 66, spo2: 97, hrv: 38 } },
  { name: "Oxígeno bajo", reading: { bpm: 72, spo2: 92, hrv: 44 } },
  {
    name: "Rojo confirmado",
    reading: { bpm: 72, spo2: 90, hrv: 40, confirmed: true },
  },
];
