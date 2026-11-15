import { describe, expect, test } from "vitest";
import { motionFor } from "@/features/lunito/motion";
import type { Baseline, Reading } from "@/domain/vitals";

const base: Baseline = {
  bpm: { mean: 60, sd: 4 },
  hrv: { mean: 50, sd: 8 },
  spo2: { mean: 97 },
};
const r: Reading = { bpm: 60, spo2: 97, hrv: 50 };

describe("motionFor", () => {
  test("la pancita late al ritmo del pulso", () => {
    expect(
      motionFor({ ...r, bpm: 120 }, base, { mode: "live" }).beatInterval,
    ).toBe(0.5);
  });

  test("menos oxígeno apaga las branquias, nunca del todo", () => {
    const full = motionFor({ ...r, spo2: 100 }, base, { mode: "live" });
    const low = motionFor({ ...r, spo2: 85 }, base, { mode: "live" });
    expect(full.gillGlow).toBe(1);
    expect(low.gillGlow).toBeGreaterThan(0);
    expect(low.gillGlow).toBeLessThan(full.gillGlow);
  });

  test("HRV baja acorta y aplana la respiración", () => {
    const calm = motionFor({ ...r, hrv: 60 }, base, { mode: "live" });
    const tense = motionFor({ ...r, hrv: 25 }, base, { mode: "live" });
    expect(tense.breathPeriod).toBeLessThan(calm.breathPeriod);
    expect(tense.breathDepth).toBeLessThan(calm.breathDepth);
  });

  test("en reposo se mueve menos y con movimiento reducido no se mueve", () => {
    const live = motionFor(r, base, { mode: "live" });
    const rest = motionFor(r, base, { mode: "rest" });
    const still = motionFor(r, base, { mode: "rest", reducedMotion: true });
    expect(rest.beatAmplitude).toBeLessThan(live.beatAmplitude);
    expect(still.beatAmplitude).toBe(0);
    expect(still.breathDepth).toBe(0);
    expect(still.idle).toBe(0);
    expect(live.idle).toBe(1);
    expect(still.gillGlow).toBe(live.gillGlow);
  });
});
