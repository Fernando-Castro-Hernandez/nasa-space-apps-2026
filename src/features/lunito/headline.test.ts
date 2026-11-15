import { describe, expect, test } from "vitest";
import { SAMPLE_BASELINE, SAMPLE_READINGS } from "@/data/sample";
import { assessVitals } from "@/domain/vitals";
import { headline } from "./headline";

const vitalsOf = (name: string) =>
  assessVitals(
    SAMPLE_READINGS.find((s) => s.name === name)!.reading,
    SAMPLE_BASELINE,
  );

describe("headline", () => {
  test("en verde dice que todo está en tu normal", () => {
    expect(headline(vitalsOf("Normal"))).toContain("Bien");
  });

  test("en ámbar nombra el indicador y su motivo", () => {
    const text = headline(vitalsOf("Poco descanso"));
    expect(text).toMatch(/^Precaución · /);
    // "Poco descanso": pulso 66 sobre la base (60 + 0.5·4) y HRV baja; el
    // pulso va primero en el orden de prioridad.
    expect(text).toContain("pulso: sobre tu normal");
  });

  test("un rojo tiene prioridad sobre un ámbar", () => {
    const text = headline(vitalsOf("Rojo confirmado"));
    expect(text).toMatch(/^Atención · oxígeno/);
  });
});
