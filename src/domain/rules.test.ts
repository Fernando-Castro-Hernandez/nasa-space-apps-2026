import { describe, expect, test } from "vitest";
import { baselineOf } from "./baseline";
import { finding } from "./finding";
import { co2Rule, exerciseRule, radiationRule } from "./shipRules";
import {
  hrvRule,
  pulseRule,
  reactionRule,
  sleepRule,
  spo2Rule,
} from "./vitalRules";

// Líneas base de muestra: 7 días previos al vuelo.
const bpmBase = baselineOf([58, 60, 62, 59, 61, 60, 60]); // media 60, DE ≈ 1.29
const hrvBase = baselineOf([3.9, 4.0, 3.95, 4.05, 4.0, 3.9, 4.1]);
const spo2Base = baselineOf([97, 98, 97, 97, 98, 97, 97]);
const sleepBase = baselineOf([7.5, 7.8, 7.2, 7.6, 7.4, 7.7, 7.5]);
const lapseBase = baselineOf([1, 2, 1, 1, 2, 1, 1]);
const short = baselineOf([60, 61]);

describe("regla de seguridad", () => {
  test("una regla sin fuente nunca da rojo", () => {
    const f = finding({
      id: "x",
      hazard: "I",
      status: "rojo",
      reason: "algo",
      source: null,
    });
    expect(f.status).toBe("ambar");
    expect(f.reason).toContain("pendiente de validar");
  });
});

describe("HRV (ln RMSSD)", () => {
  test("media de 7 días bajo base − 0.5 DE es amarillo con fuente", () => {
    const f = hrvRule(hrvBase, [3.7, 3.75, 3.8, 3.7, 3.8, 3.75, 3.7]);
    expect(f.status).toBe("ambar");
    expect(f.hazard).toBe("I");
    expect(f.source?.name).toContain("Plews");
  });

  test("con menos de 3 lecturas en la semana no cambia el semáforo", () => {
    const f = hrvRule(hrvBase, [3.0, 3.1]);
    expect(f.status).toBe("verde");
    expect(f.insufficient).toBe(true);
  });

  test("sin línea base suficiente: 'línea base insuficiente'", () => {
    const f = hrvRule(short, [3.0, 3.0, 3.0]);
    expect(f.reason).toBe("línea base insuficiente");
    expect(f.status).toBe("verde");
  });

  test("nunca da rojo, aunque la caída sea enorme", () => {
    expect(hrvRule(hrvBase, [1, 1, 1, 1, 1, 1, 1]).status).toBe("ambar");
  });
});

describe("pulso en reposo", () => {
  test("media de 3 días sobre base + 0.5 DE es amarillo", () => {
    expect(pulseRule(bpmBase, [62, 63, 62]).status).toBe("ambar");
    expect(pulseRule(bpmBase, [60, 60, 61]).status).toBe("verde");
  });

  test("una sola lectura alta no cambia la tendencia", () => {
    // La última (62) supera base + 0.5 DE, pero la media de 3 días (60) no.
    expect(pulseRule(bpmBase, [59, 59, 62]).status).toBe("verde");
  });

  test("≥ 131 confirmado es rojo; sin confirmar es 'lectura dudosa'", () => {
    expect(pulseRule(bpmBase, [], { value: 131, confirmed: true }).status).toBe(
      "rojo",
    );
    const d = pulseRule(bpmBase, [], { value: 140, confirmed: false });
    expect(d.status).toBe("ambar");
    expect(d.reason).toContain("repite");
  });

  test("≤ 40 solo es rojo si también está bajo la base", () => {
    // Base 39.4 ± 0.5: un 40 no está por debajo de base − 0.5 DE.
    const athlete = baselineOf([39, 40, 39, 40, 39, 40, 39]);
    expect(
      pulseRule(athlete, [], { value: 40, confirmed: true }).status,
    ).not.toBe("rojo");
    expect(pulseRule(bpmBase, [], { value: 38, confirmed: true }).status).toBe(
      "rojo",
    );
  });

  test("sin línea base, ≥ 131 igual es rojo (umbral absoluto de NEWS2)", () => {
    expect(pulseRule(short, [], { value: 135, confirmed: true }).status).toBe(
      "rojo",
    );
    expect(pulseRule(short, [], { value: 38, confirmed: true }).status).toBe(
      "verde",
    );
  });
});

describe("SpO2", () => {
  test("≤ 91 % confirmado es rojo; sin confirmar, repetir", () => {
    expect(spo2Rule(spo2Base, [], { value: 91, confirmed: true }).status).toBe(
      "rojo",
    );
    expect(spo2Rule(spo2Base, [], { value: 90, confirmed: false }).id).toBe(
      "spo2-doubtful",
    );
  });

  test("lecturas bajo 94 % o caída de 3 puntos son amarillo", () => {
    expect(spo2Rule(spo2Base, [97, 93]).status).toBe("ambar");
    expect(spo2Rule(spo2Base, [94, 94, 94]).status).toBe("ambar");
    expect(spo2Rule(spo2Base, [97, 96, 97]).status).toBe("verde");
  });

  test("la lectura de hoy bajo 94 % es amarillo aunque no haya historial", () => {
    const today = { value: 92, confirmed: false };
    expect(spo2Rule(spo2Base, [], today).status).toBe("ambar");
    expect(spo2Rule(spo2Base, [], { value: 97, confirmed: false }).status).toBe(
      "verde",
    );
  });
});

describe("sueño", () => {
  test("< 7 h y bajo la base es amarillo; < 7 h dentro de la base, no", () => {
    expect(sleepRule(sleepBase, [6, 6.2, 5.8]).status).toBe("ambar");
    const shortSleeper = baselineOf([6.5, 6.4, 6.6, 6.5, 6.6, 6.4, 6.5], 6);
    expect(sleepRule(shortSleeper, [6.5, 6.4, 6.5]).status).toBe("verde");
  });
});

describe("prueba de reacción", () => {
  test("lapsos sobre la base dan amarillo y avisan que el umbral está pendiente", () => {
    const f = reactionRule(lapseBase, 4);
    expect(f.status).toBe("ambar");
    expect(f.source).toBeNull();
    expect(f.reason).toContain("pendiente de validar");
  });
});

describe("reglas de la nave", () => {
  test("CO2: amarillo solo sobre 3 mmHg en 1 h", () => {
    expect(co2Rule(3).status).toBe("verde");
    expect(co2Rule(3.2).status).toBe("ambar");
  });

  test("radiación: rojo en 600 mSv; cerca es amarillo y pendiente", () => {
    expect(radiationRule(600).status).toBe("rojo");
    const near = radiationRule(560);
    expect(near.status).toBe("ambar");
    expect(near.source).toBeNull();
    expect(radiationRule(212).status).toBe("verde");
  });

  test("ejercicio: amarillo por debajo de 600 min por semana", () => {
    expect(exerciseRule(540).status).toBe("ambar");
    expect(exerciseRule(600).status).toBe("verde");
  });
});
