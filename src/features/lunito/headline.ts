// Frase corta para el inicio: el estado general y el primer motivo que no está
// en verde. Así el astronauta entiende en una línea por qué Lunito está así.
import { STATUS_LABEL } from "@/domain/status";
import type { Vitals } from "@/domain/vitals";

const NAMES = {
  heart: "pulso",
  oxygen: "oxígeno",
  recovery: "recuperación",
} as const;

export function headline(v: Vitals): string {
  const order = ["oxygen", "heart", "recovery"] as const;
  const key =
    order.find((k) => v[k].status === "rojo") ??
    order.find((k) => v[k].status === "ambar");
  if (!key) return `${STATUS_LABEL.verde}: tus indicadores están en tu normal.`;
  return `${STATUS_LABEL[v.overall]} · ${NAMES[key]}: ${v[key].reason}`;
}
