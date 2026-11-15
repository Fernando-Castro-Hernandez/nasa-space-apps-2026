import { describe, expect, test } from "vitest";
import { FINAL_READING, liveVitals, secondsLeft } from "./simulation";

describe("secondsLeft", () => {
  test("cuenta hacia atrás y se detiene en cero", () => {
    expect(secondsLeft(0, 30)).toBe(30);
    expect(secondsLeft(12.7, 30)).toBe(18);
    expect(secondsLeft(45, 30)).toBe(0);
  });
});

describe("liveVitals", () => {
  test("después de estabilizarse da la lectura final", () => {
    expect(liveVitals(30)).toEqual({
      bpm: FINAL_READING.bpm,
      spo2: FINAL_READING.spo2,
    });
  });

  test("al principio oscila dentro de un rango creíble", () => {
    for (let t = 0; t < 20; t += 0.5) {
      const v = liveVitals(t);
      expect(Math.abs(v.bpm - FINAL_READING.bpm)).toBeLessThanOrEqual(6);
      expect(v.spo2).toBeLessThanOrEqual(FINAL_READING.spo2);
      expect(v.spo2).toBeGreaterThanOrEqual(FINAL_READING.spo2 - 2);
    }
  });
});
