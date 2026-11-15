// Valores de los indicadores en el idioma activo. El oxígeno es un porcentaje
// ("98%"); el pulso y la HRV llevan su unidad ("72 bpm", "45 ms").
import type { MetricKey } from "@/data/lunitoDashboard";
import { formatNumber, localeTag, t } from "@/i18n";

const isSign = (type: string) => type === "percentSign" || type === "literal";

/** El número y lo que va después (la unidad, más chica en pantalla). Un
 *  indicador sin medir se ve como una raya, sin unidad. */
export function metricParts(
  key: MetricKey,
  value: number | null,
  unit: string,
): [number: string, suffix: string] {
  if (value === null) return ["–", ""];
  if (key !== "spo2")
    return [formatNumber(value, { maximumFractionDigits: 1 }), ` ${unit}`];
  const parts = new Intl.NumberFormat(localeTag(), {
    style: "percent",
    maximumFractionDigits: 1,
  }).formatToParts(value / 100);
  const join = (keep: boolean) =>
    parts
      .filter((part) => isSign(part.type) === keep)
      .map((part) => part.value)
      .join("");
  return [join(false), join(true)];
}

/** El valor completo en una cadena: "72 bpm", "98%", o "sin medir". */
export const metricText = (
  key: MetricKey,
  value: number | null,
  unit: string,
) =>
  value === null
    ? t("common.notMeasured")
    : metricParts(key, value, unit).join("");
