import { describe, expect, it } from "vitest";
import {
  domainFor,
  plotPoints,
  smoothPath,
  ticks,
  weekInfo,
} from "./chartMath";

describe("smoothPath", () => {
  it("una curva por tramo entre puntos", () => {
    const d = smoothPath([
      { x: 0, y: 10 },
      { x: 10, y: 20 },
      { x: 20, y: 5 },
    ]);
    expect(d.startsWith("M0,10")).toBe(true);
    expect(d.match(/C/g)).toHaveLength(2);
  });

  it("no se pasa de los datos: ningún punto de control sale del rango", () => {
    const pts = [
      { x: 0, y: 50 },
      { x: 10, y: 10 },
      { x: 20, y: 50 },
      { x: 30, y: 12 },
    ];
    const ys = (
      smoothPath(pts).match(/-?\d+(\.\d+)?,-?\d+(\.\d+)?/g) ?? []
    ).map((p) => Number(p.split(",")[1]));
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(10);
    expect(Math.max(...ys)).toBeLessThanOrEqual(50);
  });

  it("maneja cero y un solo punto", () => {
    expect(smoothPath([])).toBe("");
    expect(smoothPath([{ x: 3, y: 4 }])).toBe("M3,4");
  });
});

describe("domainFor / ticks", () => {
  it("mantiene el rango base si los valores caben", () => {
    expect(domainFor([70, 72], [65, 85])).toEqual([65, 85]);
  });

  it("amplía el eje si un valor se sale", () => {
    expect(domainFor([88.4, 72], [65, 85])).toEqual([65, 89]);
    expect(domainFor([60, 72], [65, 85])).toEqual([60, 85]);
  });

  it("da tres valores: mínimo, medio y máximo", () => {
    expect(ticks([65, 85])).toEqual([65, 75, 85]);
  });
});

describe("plotPoints", () => {
  it("el valor mayor queda arriba (y menor) y la semana ocupa todo el ancho", () => {
    const [a, b] = plotPoints([65, 85], [65, 85], { w: 100, h: 50, slots: 7 });
    expect(a).toEqual({ x: 0, y: 50 });
    expect(b!.y).toBe(0);
    expect(b!.x).toBeCloseTo(100 / 6);
  });
});

describe("weekInfo", () => {
  it("domingo 15 de noviembre de 2026: semana 9–15 y hoy es el día 7", () => {
    expect(weekInfo(new Date(2026, 10, 15))).toEqual({
      range: "9–15 de noviembre",
      todayIndex: 6,
    });
  });

  it("lunes es el día 1 de la semana", () => {
    expect(weekInfo(new Date(2026, 10, 9)).todayIndex).toBe(0);
  });

  it("una semana que cruza de mes nombra ambos meses", () => {
    expect(weekInfo(new Date(2026, 10, 30)).range).toBe(
      "30 de noviembre – 6 de diciembre",
    );
  });
});
