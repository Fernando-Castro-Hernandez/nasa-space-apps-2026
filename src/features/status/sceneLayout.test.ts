import { describe, expect, test } from "vitest";
import { anchorsFor, halfWidthFor, isNarrow } from "./sceneLayout";

// Proyección de un punto x (unidades) a px desde el centro del canvas.
const toPx = (x: number, width: number) =>
  (x / halfWidthFor(width)) * (width / 2);

describe("sceneLayout", () => {
  test("en celular usa anclas más cercanas al cuerpo", () => {
    expect(isNarrow(326)).toBe(true);
    expect(isNarrow(800)).toBe(false);
    expect(anchorsFor(326)[0]![0]).toBeLessThan(anchorsFor(800)[0]![0]);
  });

  test.each([326, 640, 900, 1200])(
    "con %i px el dato de la derecha cabe dentro del canvas",
    (width) => {
      const card = isNarrow(width) ? 108 : 195;
      const rightmost = Math.max(...anchorsFor(width).map((a) => a[0]));
      expect(toPx(rightmost, width) + card).toBeLessThanOrEqual(width / 2);
    },
  );

  test("en un canvas ancho, Lunito no se agranda sin límite", () => {
    expect(halfWidthFor(4000)).toBeGreaterThanOrEqual(1.7);
  });

  test("en un canvas muy angosto se aleja la cámara", () => {
    expect(halfWidthFor(200)).toBe(4);
  });
});
