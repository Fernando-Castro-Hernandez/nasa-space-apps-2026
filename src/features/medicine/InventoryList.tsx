import { useState } from "react";
import { formatDate, formatNumber, t } from "@/i18n";
import {
  type InventoryAlert,
  inventoryAlerts,
  SAMPLE_INVENTORY,
  stockLevel,
} from "./inventory";

// Tono de cada aviso: el color siempre va con su palabra al lado.
const ALERT_LEVEL: Record<InventoryAlert, "warn" | "alert"> = {
  agotado: "alert",
  caducado: "alert",
  bajo: "warn",
  "por caducar": "warn",
};

const expiry = (iso: string) =>
  formatDate(new Date(`${iso}T12:00:00`), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export function InventoryList({ today: fixed }: { today?: Date }) {
  // Fecha fija por montaje: el render no debe depender del reloj.
  const [now] = useState(() => new Date());
  const today = fixed ?? now;
  return (
    <ul className="medicine-inventory">
      {SAMPLE_INVENTORY.map((item) => {
        const alerts = inventoryAlerts(item, today);
        const level = alerts[0] ? ALERT_LEVEL[alerts[0]] : "ok";
        return (
          <li key={item.id} data-level={level}>
            <div className="medicine-item-head">
              <strong>{item.name}</strong>
              <span>
                <b>{formatNumber(item.count)}</b>{" "}
                {t("medicine.inventory.of", {
                  capacity: formatNumber(item.capacity),
                  unit: item.unit,
                })}
              </span>
            </div>
            <div className="medicine-stock" aria-hidden="true">
              <span style={{ width: `${stockLevel(item) * 100}%` }} />
            </div>
            <div className="medicine-item-foot">
              <span>
                {t("medicine.inventory.expires", {
                  date: expiry(item.expires),
                })}
              </span>
              {alerts.map((a) => (
                <span
                  key={a}
                  className="medicine-alert"
                  data-level={ALERT_LEVEL[a]}
                >
                  {t(`medicine.inventory.alerts.${a}`)}
                </span>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
