import { describe, expect, test } from "vitest";
import { LAPSE_MS, summarize, waitMs } from "./reaction";

describe("waitMs", () => {
  test("espera entre 2 y 6 segundos", () => {
    expect(waitMs(0)).toBe(2000);
    expect(waitMs(1)).toBe(6000);
    expect(waitMs(0.5)).toBe(4000);
  });
});

describe("summarize", () => {
  test("calcula el promedio y cuenta los lapsos sobre 355 ms", () => {
    const s = summarize([250, 300, 400, 350, 500]);
    expect(s.count).toBe(5);
    expect(s.meanMs).toBe(360);
    expect(s.lapses).toBe(2);
  });

  test("355 ms exactos no es lapso", () => {
    expect(summarize([LAPSE_MS]).lapses).toBe(0);
  });

  test("ignora los toques adelantados y no falla sin datos", () => {
    expect(summarize([-1, 300]).count).toBe(1);
    expect(summarize([])).toEqual({ count: 0, meanMs: 0, lapses: 0 });
  });
});
