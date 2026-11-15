// Lo que muestra el Inicio anterior (HomeScreen, sin ruta) a partir de una
// lectura: nombres de estado, los tres indicadores y el motivo. Los textos se
// leen en el idioma activo al usarse.
import { STATUS_LABEL } from "@/domain/status";
import type { Reading, Status, Vitals } from "@/domain/vitals";
import { t } from "@/i18n";

/** Palabra de cada estado (Bien, Precaución, Atención). */
export const STATUS_NAME: Record<Status, string> = STATUS_LABEL;

export type IndicatorView = {
  key: "bpm" | "hrv" | "spo2";
  name: string;
  /** Nombre técnico en pequeño bajo el nombre. */
  tech?: string;
  unit: string;
  value: number;
  status: Status;
};

export function indicatorsFor(r: Reading, v: Vitals): IndicatorView[] {
  return [
    {
      key: "bpm",
      name: t("common.metrics.bpm"),
      unit: t("common.units.bpm"),
      value: r.bpm,
      status: v.heart.status,
    },
    {
      key: "hrv",
      name: t("common.metrics.hrv"),
      tech: "HRV",
      unit: t("common.units.ms"),
      value: r.hrv,
      status: v.recovery.status,
    },
    {
      key: "spo2",
      name: t("common.metrics.spo2"),
      tech: "SpO₂",
      unit: t("common.units.percent"),
      value: r.spo2,
      status: v.oxygen.status,
    },
  ];
}

const ORDER = ["oxygen", "heart", "recovery"] as const;

/** Primer motivo que no está Bien (el rojo primero), o null si todo está Bien. */
export function reasonFor(v: Vitals): string | null {
  const key =
    ORDER.find((k) => v[k].status === "rojo") ??
    ORDER.find((k) => v[k].status === "ambar");
  return key
    ? t("home.short.line", {
        indicator: t(`home.short.${key}`),
        reason: v[key].reason,
      })
    : null;
}
