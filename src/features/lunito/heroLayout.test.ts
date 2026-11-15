import { describe, expect, it } from "vitest";
import { layoutFor, NARROW, NARROW_BELOW, WIDE } from "./heroLayout";

describe("layoutFor", () => {
  it("usa la medida de celular en contenedores angostos", () => {
    expect(layoutFor(380)).toBe(NARROW);
    expect(layoutFor(NARROW_BELOW - 1)).toBe(NARROW);
  });

  it("usa la de tablet desde el umbral, y también si aún no se midió", () => {
    expect(layoutFor(NARROW_BELOW)).toBe(WIDE);
    expect(layoutFor(900)).toBe(WIDE);
    expect(layoutFor(0)).toBe(WIDE);
  });
});

describe("medidas", () => {
  it.each([
    ["tablet", WIDE],
    ["celular", NARROW],
  ])(
    "en %s, burbujas y Lunito caben en el espacio de la referencia",
    (_, l) => {
      const [w, h] = l.size;
      for (const b of Object.values(l.bubbles)) {
        expect(b.cx - b.d / 2).toBeGreaterThanOrEqual(0);
        expect(b.cx + b.d / 2).toBeLessThanOrEqual(w);
        expect(b.cy - b.d / 2).toBeGreaterThanOrEqual(0);
        expect(b.cy + b.d / 2).toBeLessThanOrEqual(h);
      }
      expect(l.lunito.left + l.lunito.width).toBeLessThanOrEqual(w);
    },
  );
});
