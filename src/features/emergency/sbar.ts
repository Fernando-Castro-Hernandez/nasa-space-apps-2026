// Resumen SBAR del caso para el cirujano de vuelo (SISTEMA.md §7.5).
// Nunca es un diagnóstico: los signos vienen de un sensor de prototipo.
// Se arma al mostrarlo, en el idioma activo, con una frase por clave.
import type { IndicatorHistory } from "@/data/history";
import { formatNumber, t } from "@/i18n";
import {
  type EmergencyCase,
  eventText,
  latestVitals,
  vitalsOf,
  whatCode,
} from "./caseLogic";
import { formatTime } from "./link";

export type Sbar = {
  situation: string;
  background: string;
  assessment: string;
  request: string;
};

/** Tendencia de los últimos 3 días contra la línea base, en palabras. */
export function trendNote(h: IndicatorHistory) {
  const label = h.label;
  const last = h.days.slice(-3).map((d) => d.value);
  if (last.length === 0) return t("ground.sbar.trend.none", { label });
  const avg = last.reduce((a, b) => a + b, 0) / last.length;
  const diff = avg - h.baseline;
  if (Math.abs(diff) < 0.5) return t("ground.sbar.trend.usual", { label });
  return t(diff < 0 ? "ground.sbar.trend.below" : "ground.sbar.trend.above", {
    label,
  });
}

/** Quién y qué pasó, a qué hora: una frase por cada opción de "¿Qué pasó?". */
function situation(c: EmergencyCase, name: string) {
  const time = formatTime(c.openedAt);
  const code = whatCode(c.what);
  return code
    ? t(`ground.sbar.situation.${code}`, { name, time })
    : t("ground.sbar.situation.custom", { name, what: c.what, time });
}

function assessment(c: EmergencyCase) {
  const event = latestVitals(c);
  const vitals = event && vitalsOf(event);
  return vitals
    ? t("ground.sbar.vitals", {
        time: formatTime(event.at),
        bpm: formatNumber(vitals.bpm),
        spo2: formatNumber(vitals.spo2),
      })
    : t("ground.sbar.noVitals");
}

export function buildSbar(
  c: EmergencyCase,
  personName: string,
  history: IndicatorHistory[],
): Sbar {
  const lastNote = c.events.findLast((e) => e.kind === "note");
  return {
    situation: [
      situation(c, personName),
      ...(lastNote
        ? [t("ground.sbar.lastNote", { note: eventText(lastNote) })]
        : []),
    ].join(" "),
    background: [...history.map(trendNote), t("ground.sbar.meds")].join(" "),
    assessment: `${assessment(c)} ${t("ground.sbar.prototype")}`,
    request:
      c.orders.length === 0
        ? t("ground.sbar.requestFirst")
        : t("ground.sbar.requestSent", { count: c.orders.length }),
  };
}
