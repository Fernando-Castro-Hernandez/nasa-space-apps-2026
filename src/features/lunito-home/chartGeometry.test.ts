import { expect, test } from "vitest";
import { chartGeometry } from "./chartGeometry";

test("una lectura o una serie plana no produce coordenadas inválidas", () => {
  for (const values of [[72], [72, 72, 72]]) {
    const chart = chartGeometry(values, [72, 72]);
    expect(chart.points.map((point) => point.value)).toEqual(values);
    expect(
      chart.points.every(
        (point) => Number.isFinite(point.x) && Number.isFinite(point.y),
      ),
    ).toBe(true);
    expect(chart.line).not.toMatch(/NaN|Infinity/);
  }
});

test("el eje incluye lecturas fuera del rango base y conserva su orden temporal", () => {
  const chart = chartGeometry([60, 90, 72], [65, 85]);
  expect(chart.ticks).toEqual([90, 75, 60]);
  expect(chart.points.map((point) => point.value)).toEqual([60, 90, 72]);
  expect(chart.points[0]!.x).toBeLessThan(chart.points[1]!.x);
  expect(chart.points[1]!.x).toBeLessThan(chart.points[2]!.x);
  expect(chart.points[1]!.y).toBeLessThan(chart.points[0]!.y);
});
