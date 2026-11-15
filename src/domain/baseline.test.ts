import { describe, expect, test } from "vitest";
import {
  baselineOf,
  isBaseline,
  lnRmssd,
  mean,
  MIN_DAYS,
  rmssd,
  sd,
} from "./baseline";

describe("mean y sd", () => {
  test("lista vacía o sin números válidos da null", () => {
    expect(mean([])).toBeNull();
    expect(sd([])).toBeNull();
    expect(mean([Number.NaN, Number.POSITIVE_INFINITY])).toBeNull();
  });

  test("sd es muestral (n − 1) y necesita dos valores", () => {
    expect(sd([5])).toBeNull();
    expect(sd([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 3);
  });
});

describe("rmssd", () => {
  test("calcula la raíz de las diferencias sucesivas al cuadrado", () => {
    // Diferencias: 20, −10, 30 → √((400 + 100 + 900) / 3)
    expect(rmssd([800, 820, 810, 840])).toBeCloseTo(Math.sqrt(1400 / 3), 6);
  });

  test("descarta artefactos fuera de 300–2000 ms", () => {
    expect(rmssd([800, 120, 820, 5000, 810, 840])).toBeCloseTo(
      Math.sqrt(1400 / 3),
      6,
    );
  });

  test("con menos de dos intervalos válidos no hay HRV", () => {
    expect(rmssd([])).toBeNull();
    expect(rmssd([800])).toBeNull();
    expect(rmssd([800, 100])).toBeNull();
  });

  test("ritmo perfectamente constante da RMSSD 0 y ln indefinido", () => {
    expect(rmssd([800, 800, 800])).toBe(0);
    expect(lnRmssd([800, 800, 800])).toBeNull();
  });

  test("ln RMSSD es el logaritmo natural", () => {
    expect(lnRmssd([800, 820, 810, 840])).toBeCloseTo(
      Math.log(Math.sqrt(1400 / 3)),
      6,
    );
  });
});

describe("baselineOf", () => {
  const week = [60, 62, 61, 59, 63, 60, 61];

  test("con 7 días calcula media y DE", () => {
    const b = baselineOf(week);
    expect(isBaseline(b)).toBe(true);
    if (!isBaseline(b)) return;
    expect(b.mean).toBeCloseTo(60.857, 3);
    expect(b.n).toBe(7);
  });

  test("con menos días es insuficiente", () => {
    expect(baselineOf(week.slice(0, 6))).toEqual({ insufficient: true, n: 6 });
  });

  test("el sueño alcanza con 6 noches", () => {
    expect(
      isBaseline(baselineOf([7, 6.5, 7.2, 6.8, 7, 6.9], MIN_DAYS.sleep)),
    ).toBe(true);
  });

  test("ignora valores no numéricos al contar días", () => {
    expect(baselineOf([...week.slice(0, 6), Number.NaN])).toEqual({
      insufficient: true,
      n: 6,
    });
  });

  test("en misiones largas exige 14 días", () => {
    expect(isBaseline(baselineOf(week, MIN_DAYS.longMission))).toBe(false);
  });
});
