// Resumen SBAR del caso para el cirujano de vuelo (SISTEMA.md §7.5).
// Nunca es un diagnóstico: los signos vienen de un sensor de prototipo.
import type { IndicatorHistory } from "@/data/history";
import { type EmergencyCase, latestVitals } from "./caseLogic";
import { formatTime } from "./link";

export type Sbar = {
  situation: string;
  background: string;
  assessment: string;
  request: string;
};

/** Tendencia de los últimos 3 días contra la línea base, en palabras. */
export function trendNote(h: IndicatorHistory) {
  const last = h.days.slice(-3).map((d) => d.value);
  if (last.length === 0) return `${h.label}: sin datos recientes.`;
  const avg = last.reduce((a, b) => a + b, 0) / last.length;
  const diff = avg - h.baseline;
  if (Math.abs(diff) < 0.5) return `${h.label} en su normal los últimos días.`;
  return `${h.label} ${diff < 0 ? "bajo" : "sobre"} su normal los últimos días.`;
}

export function buildSbar(
  c: EmergencyCase,
  personName: string,
  history: IndicatorHistory[],
): Sbar {
  const notes = c.events.filter((e) => e.kind === "note").map((e) => e.text);
  const vitals = latestVitals(c);
  return {
    situation:
      `${personName}: ${c.what.toLowerCase()} a las ${formatTime(c.openedAt)}.` +
      (notes.length ? ` Última nota: ${notes[notes.length - 1]}.` : ""),
    background: [
      ...history.map(trendNote),
      "Sin medicamentos registrados hoy. Alergias: ninguna registrada.",
    ].join(" "),
    assessment:
      (vitals
        ? `${formatTime(vitals.at)} · ${vitals.text.replace("Signos con sensor: ", "")}.`
        : "Aún sin signos registrados.") +
      " Sensor de prototipo, no médico. El diagnóstico lo decide el cirujano.",
    request:
      c.orders.length === 0
        ? "Indicación sobre reposo, uso de oxígeno y siguiente medición."
        : `Indicaciones enviadas: ${c.orders.length}. Confirmar si se continúa.`,
  };
}
