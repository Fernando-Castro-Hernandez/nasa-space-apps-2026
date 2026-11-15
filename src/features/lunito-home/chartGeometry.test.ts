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

test("la línea base entra en el eje aunque quede fuera del rango", () => {
  const chart = chartGeometry([70, 72], [70, 75], 60);
  expect(chart.ticks.at(-1)).toBe(60);
  expect(chart.baselineY).toBe(235);
  expect(chartGeometry([70, 72], [65, 85]).baselineY).toBeNull();
});

test("cada punto se puede tocar en toda su columna", () => {
  expect(chartGeometry([1, 2, 3, 4, 5, 6, 7], [0, 10]).column).toBeCloseTo(
    418 / 6,
  );
  expect(chartGeometry([1], [0, 10]).column).toBe(418);
});

test("el eje incluye lecturas fuera del rango base y conserva su orden temporal", () => {
  const chart = chartGeometry([60, 90, 72], [65, 85]);
  expect(chart.ticks).toEqual([90, 75, 60]);
  expect(chart.points.map((point) => point.value)).toEqual([60, 90, 72]);
  expect(chart.points[0]!.x).toBeLessThan(chart.points[1]!.x);
  expect(chart.points[1]!.x).toBeLessThan(chart.points[2]!.x);
  expect(chart.points[1]!.y).toBeLessThan(chart.points[0]!.y);
});

test("con menos lecturas que lugares, la línea termina antes y no se estira", () => {
  const full = chartGeometry([1, 2, 3, 4, 5, 6, 7], [0, 10]);
  const short = chartGeometry([1, 2, 3, 4, 5, 6], [0, 10], undefined, 7);
  // Los seis días medidos quedan en el mismo lugar que en la semana completa.
  expect(short.points.map((point) => point.x)).toEqual(
    full.points.slice(0, 6).map((point) => point.x),
  );
  expect(short.column).toBeCloseTo(full.column);
});

test("el relleno baja desde el último punto medido", () => {
  const short = chartGeometry([1, 2, 3, 4, 5, 6], [0, 10], undefined, 7);
  expect(short.area).toContain(`L${short.points.at(-1)!.x},235 L42,235 Z`);
  // Con la semana completa, eso es el borde derecho de siempre.
  expect(chartGeometry([1, 2, 3, 4, 5, 6, 7], [0, 10]).area).toContain(
    "L460,235 L42,235 Z",
  );
});
