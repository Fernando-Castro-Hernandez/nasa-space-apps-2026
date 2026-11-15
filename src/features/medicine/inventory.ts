// Inventario del botiquín: datos simulados para la demo y la lógica pura de
// alertas. Los mínimos de stock son decisión de diseño, no reglas de salud.

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

/** Inventario simulado (SISTEMA.md §11): nombres de la lista de la ISS. */
export const SAMPLE_INVENTORY: InventoryItem[] = [
  {
    id: "paracetamol",
    name: "Paracetamol 325 mg",
    unit: "tabletas",
    count: 38,
    capacity: 60,
    minimum: 12,
    expires: "2027-08-01",
  },
  {
    id: "ibuprofeno",
    name: "Ibuprofeno 400 mg",
    unit: "tabletas",
    count: 6,
    capacity: 40,
    minimum: 8,
    expires: "2027-03-15",
  },
  {
    id: "suero",
    name: "Sales de rehidratación oral",
    unit: "sobres",
    count: 14,
    capacity: 20,
    minimum: 5,
    expires: "2026-12-01",
  },
  {
    id: "vendas",
    name: "Vendas elásticas",
    unit: "rollos",
    count: 9,
    capacity: 10,
    minimum: 3,
    expires: "2029-01-01",
  },
  {
    id: "oxigeno",
    name: "Oxígeno portátil",
    unit: "cilindros",
    count: 2,
    capacity: 2,
    minimum: 1,
    expires: "2028-06-01",
  },
];
