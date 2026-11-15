// Datos de muestra para construir y demostrar el dashboard sin sensor.
// Línea base simulada y etiquetada, como pide SISTEMA.md para la demo.
// `id` identifica la muestra sin depender del idioma; `name` es un getter que
// se lee en el idioma activo.
import type { Baseline, Reading } from "@/domain/vitals";
import { t } from "@/i18n";

export const SAMPLE_BASELINE: Baseline = {
  bpm: { mean: 60, sd: 4 },
  hrv: { mean: 50, sd: 8 },
  spo2: { mean: 97 },
};

type Sample = { id: string; name: string; reading: Reading };

export const SAMPLE_READINGS: Sample[] = [
  {
    id: "normal",
    get name() {
      return t("data.samples.normal");
    },
    reading: { bpm: 61, spo2: 97, hrv: 52 },
  },
  {
    id: "low-rest",
    get name() {
      return t("data.samples.lowRest");
    },
    reading: { bpm: 66, spo2: 97, hrv: 38 },
  },
  {
    id: "low-oxygen",
    get name() {
      return t("data.samples.lowOxygen");
    },
    reading: { bpm: 72, spo2: 92, hrv: 44 },
  },
  {
    id: "confirmed-red",
    get name() {
      return t("data.samples.confirmedAlert");
    },
    reading: { bpm: 72, spo2: 90, hrv: 40, confirmed: true },
  },
];
