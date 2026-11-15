import { describe, expect, it } from "vitest";
import { sparkline } from "./sparkline";

describe("sparkline", () => {
  it("el valor más alto queda arriba (y menor) y el más bajo abajo", () => {
    const { points } = sparkline([10, 20], 15, 100, 30);
    const [first, second] = points
      .split(" ")
      .map((p) => Number(p.split(",")[1]));
    expect(second).toBeLessThan(first!);
  });

  it("la línea base queda entre los valores si está entre ellos", () => {
    const { points, baselineY } = sparkline([10, 20], 15, 100, 30);
    const ys = points.split(" ").map((p) => Number(p.split(",")[1]));
    expect(baselineY).toBeGreaterThan(Math.min(...ys));
    expect(baselineY).toBeLessThan(Math.max(...ys));
  });

  it("no se rompe con una serie plana ni con un solo punto", () => {
    expect(sparkline([5, 5, 5], 5).points).not.toContain("NaN");
    expect(sparkline([5], 5).points).not.toContain("NaN");
  });
});
