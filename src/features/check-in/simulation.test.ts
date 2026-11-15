import { describe, expect, test } from "vitest";
import { liveVitals, secondsLeft } from "./simulation";

const target = { bpm: 72, spo2: 98 };

describe("secondsLeft", () => {
  test("cuenta hacia atrás y se detiene en cero", () => {
    expect(secondsLeft(0, 30)).toBe(30);
    expect(secondsLeft(12.7, 30)).toBe(18);
    expect(secondsLeft(45, 30)).toBe(0);
  });
});

describe("liveVitals", () => {
  test("después de estabilizarse da la lectura del día", () => {
    expect(liveVitals(30, target)).toEqual(target);
    expect(liveVitals(60, { bpm: 79, spo2: 97 })).toEqual({
      bpm: 79,
      spo2: 97,
    });
  });

  test("al principio oscila dentro de un rango creíble", () => {
    for (let t = 0; t < 20; t += 0.5) {
      const v = liveVitals(t, target);
      expect(Math.abs(v.bpm - target.bpm)).toBeLessThanOrEqual(6);
      expect(v.spo2).toBeLessThanOrEqual(target.spo2);
      expect(v.spo2).toBeGreaterThanOrEqual(target.spo2 - 2);
    }
  });

  test("el oxígeno nunca pasa de 100 %", () => {
    expect(liveVitals(0, { bpm: 60, spo2: 100 }).spo2).toBeLessThanOrEqual(100);
  });
});
