import { describe, expect, test } from "vitest";
import {
  applyGesture,
  envelope,
  GESTURE_DURATION,
  LUNITO_GESTURES,
} from "./gestures";
import { neutralRig } from "./rig";

const at = (gesture: (typeof LUNITO_GESTURES)[number], fraction: number) =>
  applyGesture(gesture, GESTURE_DURATION[gesture] * fraction, 1, neutralRig());

describe("gestos", () => {
  test.each(LUNITO_GESTURES)(
    "%s no cambia nada antes de empezar ni después de terminar",
    (gesture) => {
      expect(at(gesture, -0.1)).toEqual(neutralRig());
      expect(at(gesture, 0)).toEqual(neutralRig());
      expect(at(gesture, 1)).toEqual(neutralRig());
      expect(at(gesture, 1.5)).toEqual(neutralRig());
    },
  );

  test.each(LUNITO_GESTURES)(
    "%s entra y sale sin saltos (a 60 cuadros por segundo)",
    (gesture) => {
      const step = 1 / (60 * GESTURE_DURATION[gesture]);
      let previous = at(gesture, 0);
      for (let p = step; p <= 1 + step; p += step) {
        const current = at(gesture, p);
        expect(Math.abs(current.armLRaise - previous.armLRaise)).toBeLessThan(
          0.08,
        );
        expect(Math.abs(current.lift - previous.lift)).toBeLessThan(0.02);
        expect(Math.abs(current.happy - previous.happy)).toBeLessThan(0.15);
        previous = current;
      }
    },
  );

  test("saludar sube la mano y la agita", () => {
    const raises = [0.35, 0.45, 0.55].map((p) => at("wave", p).armLRaise);
    expect(Math.min(...raises)).toBeGreaterThan(0.4);
    expect(Math.max(...raises) - Math.min(...raises)).toBeGreaterThan(0.05);
  });

  test("asentir inclina hacia adelante", () => {
    expect(at("nod", 0.15).pitch).toBeGreaterThan(0.05);
  });

  test.each(LUNITO_GESTURES)(
    "%s usa los ojos felices completos o nada",
    (gesture) => {
      // A mitad del gesto (envolvente en 1) los ojos están en su valor.
      expect([0, 1]).toContain(at(gesture, 0.5).happy);
    },
  );

  test("festejar se agacha, salta y pone los ojos felices", () => {
    expect(at("cheer", 0.15).stretch).toBeLessThan(0);
    expect(at("cheer", 0.47).lift).toBeGreaterThan(0.1);
    expect(at("cheer", 0.5).happy).toBeGreaterThan(0.9);
  });

  test("la risita cierra los ojos de gusto", () => {
    expect(at("giggle", 0.5).happy).toBeGreaterThan(0.9);
  });

  test("un gesto lleva la parte hacia su posición, no la suma dos veces", () => {
    const raised = { ...neutralRig(), armLRaise: 0.62 };
    const waved = applyGesture("wave", GESTURE_DURATION.wave / 2, 1, raised);
    expect(waved.armLRaise).toBeLessThan(0.8);
  });

  test("con la mitad de peso llega a la mitad", () => {
    const half = applyGesture("cheer", GESTURE_DURATION.cheer / 2, 0.5, {
      ...neutralRig(),
    });
    expect(half.armLRaise).toBeCloseTo(at("cheer", 0.5).armLRaise / 2);
  });

  test("la envolvente va de 0 a 1 y de vuelta a 0", () => {
    expect(envelope(0)).toBe(0);
    expect(envelope(0.5)).toBe(1);
    expect(envelope(1)).toBe(0);
  });
});
