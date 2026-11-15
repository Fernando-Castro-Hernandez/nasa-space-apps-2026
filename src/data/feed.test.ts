import { describe, expect, it } from "vitest";
import { CREW } from "./crew";
import { exerciseTotal, FEED, FEED_DAYS, FEED_LABEL } from "./feed";

describe("FEED", () => {
  it("tiene 14 días para cada astronauta de la tripulación", () => {
    for (const c of CREW) expect(FEED[c.id]).toHaveLength(FEED_DAYS);
  });

  it("la dosis acumulada nunca baja", () => {
    for (const days of Object.values(FEED))
      days.forEach((d, i) => {
        if (i > 0) expect(d.doseMsv).toBeGreaterThan(days[i - 1]!.doseMsv);
      });
  });

  it("el ejercicio de la tripulación promedia ~600 min/semana (OCHMO-TB-031)", () => {
    const week = (id: string) =>
      FEED[id]!.reduce((s, d) => s + exerciseTotal(d), 0) / 2;
    expect(week("luis")).toBeGreaterThan(540);
    expect(week("luis")).toBeLessThan(660);
    expect(week("ana")).toBeLessThan(600);
  });

  it("el CO2 de muestra queda bajo el umbral de 2.5 mmHg", () => {
    for (const days of Object.values(FEED))
      for (const d of days) expect(d.co2Mmhg).toBeLessThan(2.5);
  });

  it("el dato se etiqueta como simulado", () => {
    expect(FEED_LABEL()).toBe("simulado");
  });
});
