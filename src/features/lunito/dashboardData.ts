// Lo que muestra Inicio a partir de una lectura: nombres de estado de las
// referencias (Bien, Precaución, Atención), los tres indicadores y el motivo.
import type { Reading, Status, Vitals } from "@/domain/vitals";

export const STATUS_NAME: Record<Status, string> = {
  verde: "Bien",
  ambar: "Precaución",
  rojo: "Atención",
};

/** Qué significa cada estado, para el enlace "Qué significa". */
export const STATUS_MEANING: Record<Status, string> = {
  verde: "Tus indicadores están dentro de tu normal.",
  ambar: "Algún indicador se aleja de tu normal. Descansa y vuelve a medirte.",
  rojo: "Un indicador está fuera de rango. Avisa al oficial médico.",
};

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
      name: "Pulso",
      unit: "lpm",
      value: r.bpm,
      status: v.heart.status,
    },
    {
      key: "hrv",
      name: "Variabilidad cardíaca",
      tech: "HRV",
      unit: "ms",
      value: r.hrv,
      status: v.recovery.status,
    },
    {
      key: "spo2",
      name: "Oxígeno en sangre",
      tech: "SpO₂",
      unit: "%",
      value: r.spo2,
      status: v.oxygen.status,
    },
  ];
}

const ORDER = ["oxygen", "heart", "recovery"] as const;
const NAMES = {
  oxygen: "Oxígeno",
  heart: "Pulso",
  recovery: "Variabilidad",
} as const;

/** Primer motivo que no está Bien (el rojo primero), o null si todo está Bien. */
export function reasonFor(v: Vitals): string | null {
  const key =
    ORDER.find((k) => v[k].status === "rojo") ??
    ORDER.find((k) => v[k].status === "ambar");
  return key ? `${NAMES[key]}: ${v[key].reason}` : null;
}
