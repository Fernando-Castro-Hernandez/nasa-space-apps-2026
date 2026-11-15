import { describe, expect, test } from "vitest";
import { assessVitals, type Baseline, type Reading } from "@/domain/vitals";

const base: Baseline = {
  bpm: { mean: 60, sd: 4 },
  hrv: { mean: 50, sd: 8 },
  spo2: { mean: 97 },
};

const normal: Reading = { bpm: 62, spo2: 97, hrv: 52 };

describe("assessVitals", () => {
  test("una lectura en la línea base es verde", () => {
    const v = assessVitals(normal, base);
    expect(v.overall).toBe("verde");
    expect(v.heart.status).toBe("verde");
    expect(v.oxygen.status).toBe("verde");
    expect(v.recovery.status).toBe("verde");
  });

  test("pulso sobre la base + 0.5 DE es ámbar", () => {
    expect(assessVitals({ ...normal, bpm: 63 }, base).heart.status).toBe(
      "ambar",
    );
  });

  test("SpO2 bajo 94 % o 3 puntos bajo la base es ámbar", () => {
    expect(assessVitals({ ...normal, spo2: 93 }, base).oxygen.status).toBe(
      "ambar",
    );
    expect(assessVitals({ ...normal, spo2: 94 }, base).oxygen.status).toBe(
      "ambar",
    );
  });

  test("HRV bajo la base − 0.5 DE es ámbar y nunca rojo", () => {
    expect(assessVitals({ ...normal, hrv: 45 }, base).recovery.status).toBe(
      "ambar",
    );
    expect(assessVitals({ ...normal, hrv: 5 }, base).recovery.status).toBe(
      "ambar",
    );
  });

  test("un rojo sin confirmar pide repetir la lectura", () => {
    const v = assessVitals({ ...normal, spo2: 90 }, base);
    expect(v.oxygen.status).toBe("ambar");
    expect(v.oxygen.reason).toContain("repite");
  });

  test("un rojo confirmado es rojo y domina el estado general", () => {
    const v = assessVitals({ ...normal, bpm: 131, confirmed: true }, base);
    expect(v.heart.status).toBe("rojo");
    expect(v.overall).toBe("rojo");
  });

  test("pulso ≤ 40 solo es rojo si también está bajo la base", () => {
    const athlete: Baseline = { ...base, bpm: { mean: 40, sd: 3 } };
    const ok = assessVitals({ ...normal, bpm: 40, confirmed: true }, athlete);
    expect(ok.heart.status).toBe("verde");
    const low = assessVitals({ ...normal, bpm: 38, confirmed: true }, base);
    expect(low.heart.status).toBe("rojo");
  });
});
