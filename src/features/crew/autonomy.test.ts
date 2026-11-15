import { describe, expect, test } from "vitest";
import {
  autonomy,
  byHazard,
  SAMPLE_CASES,
  SAMPLE_HAZARD_CASES,
} from "./autonomy";

describe("autonomy", () => {
  test("resolver a bordo y escalar bien cuentan igual", () => {
    expect(autonomy(["resuelto a bordo", "escalado correctamente"])).toEqual({
      wellHandled: 2,
      closed: 2,
      ratio: 1,
    });
  });

  test("un caso mal atendido baja la autonomía", () => {
    const a = autonomy(["resuelto a bordo", "mal atendido"]);
    expect(a.ratio).toBe(0.5);
  });

  test("los casos abiertos no cuentan todavía", () => {
    expect(autonomy(["resuelto a bordo", "abierto"]).closed).toBe(1);
  });

  test("sin casos cerrados la autonomía es completa", () => {
    expect(autonomy([]).ratio).toBe(1);
    expect(autonomy(["abierto"]).ratio).toBe(1);
  });

  test("la muestra de la demo es 11 de 12", () => {
    const a = autonomy(SAMPLE_CASES);
    expect(a.wellHandled).toBe(11);
    expect(a.closed).toBe(12);
  });
});

describe("byHazard", () => {
  test("E: 4 de 4 en la muestra de la demo", () => {
    const e = byHazard(SAMPLE_HAZARD_CASES).find((h) => h.hazard === "E");
    expect(e).toMatchObject({ wellHandled: 4, closed: 4 });
  });

  test("un rojo escalado cuenta como bien atendido y nunca resta", () => {
    const d = byHazard(SAMPLE_HAZARD_CASES).find((h) => h.hazard === "D");
    expect(d).toMatchObject({ wellHandled: 1, closed: 1, ratio: 1 });
  });

  test("omite los peligros sin casos cerrados", () => {
    expect(byHazard([{ hazard: "R", outcome: "abierto" }])).toEqual([]);
  });
});
