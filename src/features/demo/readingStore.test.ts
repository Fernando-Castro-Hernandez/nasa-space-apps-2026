import { beforeEach, describe, expect, it } from "vitest";
import { parseReading, setReadingIndex } from "./readingStore";

describe("readingStore", () => {
  beforeEach(() => window.localStorage.clear());

  it("un valor inválido o fuera de rango cae a la primera lectura (Bien)", () => {
    expect(parseReading(null)).toBe(0);
    expect(parseReading("9")).toBe(0);
    expect(parseReading("-1")).toBe(0);
    expect(parseReading("abc")).toBe(0);
    expect(parseReading("1.5")).toBe(0);
  });

  it("acepta cada lectura de muestra", () => {
    expect(parseReading("1")).toBe(1);
    expect(parseReading("2")).toBe(2);
  });

  it("guarda la elegida y volver a Bien borra el valor", () => {
    setReadingIndex(2);
    expect(window.localStorage.getItem("nostos.reading")).toBe("2");
    setReadingIndex(0);
    expect(window.localStorage.getItem("nostos.reading")).toBeNull();
  });
});
