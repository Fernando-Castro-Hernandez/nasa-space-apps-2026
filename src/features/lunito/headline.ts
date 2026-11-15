// Frase corta del estado: el estado general y el primer motivo que no está
// Bien. Así el astronauta entiende en una línea por qué Lunito está así.
import { STATUS_LABEL } from "@/domain/status";
import type { Vitals } from "@/domain/vitals";
import { t } from "@/i18n";

export function headline(v: Vitals): string {
  const order = ["oxygen", "heart", "recovery"] as const;
  const key =
    order.find((k) => v[k].status === "rojo") ??
    order.find((k) => v[k].status === "ambar");
  if (!key) return t("home.headline.good", { status: STATUS_LABEL.verde });
  return t("home.headline.reason", {
    status: STATUS_LABEL[v.overall],
    indicator: t(`home.headline.${key}`),
    reason: v[key].reason,
  });
}
