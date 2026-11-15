// Inventario del botiquín: datos simulados para la demo y la lógica pura de
// alertas. Los mínimos de stock son decisión de diseño, no reglas de salud.
import { t } from "@/i18n";

export type InventoryItem = {
  id: string;
  name: string;
  unit: string;
  count: number;
  /** Capacidad con la que se cargó el botiquín, para la barra. */
  capacity: number;
  /** Por debajo o igual a este número se avisa de faltante. */
  minimum: number;
  /** Fecha de caducidad en formato AAAA-MM-DD. */
  expires: string;
};

export type InventoryAlert = "agotado" | "bajo" | "caducado" | "por caducar";

const SOON_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export function inventoryAlerts(
  item: InventoryItem,
  today: Date,
): InventoryAlert[] {
  const alerts: InventoryAlert[] = [];
  if (item.count <= 0) alerts.push("agotado");
  else if (item.count <= item.minimum) alerts.push("bajo");
  const days = (Date.parse(item.expires) - today.getTime()) / DAY_MS;
  if (days < 0) alerts.push("caducado");
  else if (days <= SOON_DAYS) alerts.push("por caducar");
  return alerts;
}

/** Fracción de 0 a 1 para la barra de stock. */
export const stockLevel = (item: InventoryItem) =>
  Math.min(1, Math.max(0, item.count / item.capacity));

type ItemName = "paracetamol" | "ibuprofen" | "ors" | "bandages" | "oxygen";
type Unit = "tablets" | "sachets" | "rolls" | "cylinders";

// Nombre y unidad son getters: se leen en el idioma activo al usarlos.
const sample = (
  id: string,
  name: ItemName,
  unit: Unit,
  stock: Pick<InventoryItem, "count" | "capacity" | "minimum" | "expires">,
): InventoryItem => ({
  id,
  get name() {
    return t(`medicine.inventory.items.${name}`);
  },
  get unit() {
    return t(`medicine.inventory.units.${unit}`);
  },
  ...stock,
});

/** Inventario simulado (SISTEMA.md §11): nombres de la lista de la ISS. */
export const SAMPLE_INVENTORY: InventoryItem[] = [
  sample("paracetamol", "paracetamol", "tablets", {
    count: 38,
    capacity: 60,
    minimum: 12,
    expires: "2027-08-01",
  }),
  sample("ibuprofeno", "ibuprofen", "tablets", {
    count: 6,
    capacity: 40,
    minimum: 8,
    expires: "2027-03-15",
  }),
  sample("suero", "ors", "sachets", {
    count: 14,
    capacity: 20,
    minimum: 5,
    expires: "2026-12-01",
  }),
  sample("vendas", "bandages", "rolls", {
    count: 9,
    capacity: 10,
    minimum: 3,
    expires: "2029-01-01",
  }),
  sample("oxigeno", "oxygen", "cylinders", {
    count: 2,
    capacity: 2,
    minimum: 1,
    expires: "2028-06-01",
  }),
];
