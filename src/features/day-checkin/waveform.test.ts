import { describe, expect, test } from "vitest";
import { BAR_COUNT, barHeights, rmsLevel, simulatedLevel } from "./waveform";

describe("barHeights", () => {
  test("da una barra por posición, entre 0 y 1", () => {
    const h = barHeights(0.8, 1.2);
    expect(h).toHaveLength(BAR_COUNT);
    for (const v of h) {
      expect(v).toBeGreaterThan(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  test("es simétrica, como en la referencia", () => {
    const h = barHeights(0.7, 2.4);
    expect(h).toEqual(h.toReversed());
  });

  test("el centro es más alto que los bordes", () => {
    const h = barHeights(1, 0.3);
    expect(h[Math.floor(BAR_COUNT / 2)]!).toBeGreaterThan(h[0]!);
  });

  test("en silencio las barras quedan bajas pero visibles", () => {
    const quiet = barHeights(0, 0);
    const loud = barHeights(1, 0);
    expect(Math.max(...quiet)).toBeLessThan(Math.max(...loud));
    expect(Math.min(...quiet)).toBeGreaterThan(0);
  });
});

describe("volumen", () => {
  test("el simulado siempre está entre 0 y 1", () => {
    for (let t = 0; t < 10; t += 0.37) {
      const v = simulatedLevel(t);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  test("el silencio es 0 y una señal fuerte satura en 1", () => {
    expect(rmsLevel(new Float32Array(64))).toBe(0);
    expect(rmsLevel(new Float32Array(64).fill(0.9))).toBe(1);
    expect(rmsLevel([])).toBe(0);
  });
});
