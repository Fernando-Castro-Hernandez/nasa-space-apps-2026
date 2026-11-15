import { useState } from "react";
import { STATUS_TOKEN } from "@/domain/status";
import {
  type InventoryAlert,
  inventoryAlerts,
  SAMPLE_INVENTORY,
  stockLevel,
} from "./inventory";

const ALERT_STYLE: Record<InventoryAlert, string> = {
  agotado: STATUS_TOKEN.rojo,
  caducado: STATUS_TOKEN.rojo,
  bajo: STATUS_TOKEN.ambar,
  "por caducar": STATUS_TOKEN.ambar,
};

const fmtDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export function InventoryList({ today: fixed }: { today?: Date }) {
  // Fecha fija por montaje: el render no debe depender del reloj.
  const [now] = useState(() => new Date());
  const today = fixed ?? now;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Inventario simulado para la demo.
      </p>
      <ul className="flex flex-col gap-3">
        {SAMPLE_INVENTORY.map((item) => {
          const alerts = inventoryAlerts(item, today);
          const color = alerts[0] ? ALERT_STYLE[alerts[0]] : STATUS_TOKEN.verde;
          return (
            <li
              key={item.id}
              className="flex flex-col gap-2 rounded-xl border bg-card p-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium">{item.name}</span>
                <span className="text-sm">
                  <strong>{item.count}</strong>{" "}
                  <span className="text-muted-foreground">
                    de {item.capacity} {item.unit}
                  </span>
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${stockLevel(item) * 100}%`,
                    background: color,
                  }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>Caduca: {fmtDate(item.expires)}</span>
                {alerts.map((a) => (
                  <span
                    key={a}
                    className="rounded-full border px-2 py-0.5 font-semibold"
                    style={{
                      color: ALERT_STYLE[a],
                      borderColor: ALERT_STYLE[a],
                    }}
                  >
                    {a === "bajo"
                      ? "Stock bajo"
                      : a[0]!.toUpperCase() + a.slice(1)}
                  </span>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
