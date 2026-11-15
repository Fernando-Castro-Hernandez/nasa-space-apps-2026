import { describe, expect, it } from "vitest";
import { DASHBOARD_BASELINE, DASHBOARD_READINGS } from "@/data/dashboard";
import { assessVitals } from "@/domain/vitals";
import { indicatorsFor, reasonFor, STATUS_NAME } from "./dashboardData";

const vitalsOf = (i: number) =>
  assessVitals(DASHBOARD_READINGS[i]!.reading, DASHBOARD_BASELINE);

describe("lecturas del dashboard", () => {
  it("la lectura de la referencia (72 lpm, 45 ms, 98 %) sale Bien", () => {
    expect(vitalsOf(0).overall).toBe("verde");
    expect(STATUS_NAME[vitalsOf(0).overall]).toBe("Bien");
  });

  it("cada lectura de muestra produce su estado: Bien, Precaución, Atención", () => {
    expect(DASHBOARD_READINGS.map((_, i) => vitalsOf(i).overall)).toEqual([
      "verde",
      "ambar",
      "rojo",
    ]);
  });
});

describe("indicatorsFor", () => {
  it("devuelve pulso, HRV y oxígeno con su valor y estado", () => {
    const list = indicatorsFor(DASHBOARD_READINGS[0]!.reading, vitalsOf(0));
    expect(list.map((i) => [i.key, i.value, i.status])).toEqual([
      ["bpm", 72, "verde"],
      ["hrv", 45, "verde"],
      ["spo2", 98, "verde"],
    ]);
  });

  it("cada indicador lleva el estado propio, no el general", () => {
    const list = indicatorsFor(DASHBOARD_READINGS[1]!.reading, vitalsOf(1));
    expect(list.find((i) => i.key === "spo2")!.status).toBe("verde");
    expect(list.find((i) => i.key === "bpm")!.status).toBe("ambar");
  });
});

describe("reasonFor", () => {
  it("no hay motivo si todo está Bien", () => {
    expect(reasonFor(vitalsOf(0))).toBeNull();
  });

  it("el rojo tiene prioridad y nombra el indicador", () => {
    expect(reasonFor(vitalsOf(2))).toMatch(/^Oxígeno:/);
  });
});
