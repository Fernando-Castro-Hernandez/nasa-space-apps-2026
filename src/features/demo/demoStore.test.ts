import { beforeEach, describe, expect, it } from "vitest";
import { autonomy } from "@/features/crew/autonomy";
import { casesWithCo2, parseCo2State, setCo2State } from "./demoStore";

const ratio = (state: Parameters<typeof casesWithCo2>[0]) =>
  autonomy(casesWithCo2(state).map((c) => c.outcome)).ratio;

describe("demoStore", () => {
  beforeEach(() => window.localStorage.clear());

  it("un texto desconocido cuenta como CO2 normal", () => {
    expect(parseCo2State("alto")).toBe("alto");
    expect(parseCo2State("resuelto")).toBe("resuelto");
    expect(parseCo2State(null)).toBe("normal");
    expect(parseCo2State("otro")).toBe("normal");
  });

  it("guarda el estado y reiniciar lo borra", () => {
    setCo2State("alto");
    expect(window.localStorage.getItem("nostos.demo")).toBe("alto");
    setCo2State("normal");
    expect(window.localStorage.getItem("nostos.demo")).toBeNull();
  });
});

describe("casesWithCo2", () => {
  it("el caso abierto no cambia la autonomía y al resolverlo sube", () => {
    expect(ratio("alto")).toBe(ratio("normal"));
    expect(ratio("resuelto")).toBeGreaterThan(ratio("normal"));
  });
});
