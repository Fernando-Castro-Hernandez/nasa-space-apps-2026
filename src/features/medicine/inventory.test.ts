import { describe, expect, test } from "vitest";
import { type InventoryItem, inventoryAlerts, stockLevel } from "./inventory";

const today = new Date("2026-11-14T12:00:00Z");
const item = (over: Partial<InventoryItem> = {}): InventoryItem => ({
  id: "x",
  name: "X",
  unit: "u",
  count: 10,
  capacity: 20,
  minimum: 3,
  expires: "2028-01-01",
  ...over,
});

describe("inventoryAlerts", () => {
  test("stock suficiente y lejos de caducar no avisa", () => {
    expect(inventoryAlerts(item(), today)).toEqual([]);
  });

  test("en el mínimo o debajo avisa de stock bajo", () => {
    expect(inventoryAlerts(item({ count: 3 }), today)).toEqual(["bajo"]);
    expect(inventoryAlerts(item({ count: 4 }), today)).toEqual([]);
  });

  test("sin unidades es agotado, no bajo", () => {
    expect(inventoryAlerts(item({ count: 0 }), today)).toEqual(["agotado"]);
  });

  test("caduca en 30 días o menos: por caducar; ya pasó: caducado", () => {
    expect(inventoryAlerts(item({ expires: "2026-12-10" }), today)).toEqual([
      "por caducar",
    ]);
    expect(inventoryAlerts(item({ expires: "2026-11-01" }), today)).toEqual([
      "caducado",
    ]);
  });

  test("puede tener alerta de stock y de caducidad a la vez", () => {
    expect(
      inventoryAlerts(item({ count: 1, expires: "2026-11-20" }), today),
    ).toEqual(["bajo", "por caducar"]);
  });
});

describe("stockLevel", () => {
  test("es la fracción de la capacidad, acotada entre 0 y 1", () => {
    expect(stockLevel(item({ count: 5, capacity: 20 }))).toBe(0.25);
    expect(stockLevel(item({ count: 30, capacity: 20 }))).toBe(1);
    expect(stockLevel(item({ count: -1 }))).toBe(0);
  });
});
