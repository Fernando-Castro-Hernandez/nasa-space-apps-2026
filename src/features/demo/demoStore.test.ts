import { beforeEach, describe, expect, it } from "vitest";
import { parseCo2Raised, setCo2Raised } from "./demoStore";

describe("demoStore", () => {
  beforeEach(() => window.localStorage.clear());

  it("solo 'co2' cuenta como CO2 subido", () => {
    expect(parseCo2Raised("co2")).toBe(true);
    expect(parseCo2Raised(null)).toBe(false);
    expect(parseCo2Raised("otro")).toBe(false);
  });

  it("subir y reiniciar el CO2 se guarda y se borra", () => {
    setCo2Raised(true);
    expect(window.localStorage.getItem("nostos.demo")).toBe("co2");
    setCo2Raised(false);
    expect(window.localStorage.getItem("nostos.demo")).toBeNull();
  });
});
