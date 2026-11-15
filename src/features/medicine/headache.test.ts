import { describe, expect, test } from "vitest";
import {
  assessHeadache,
  type HeadacheAnswers,
  RED_FLAGS,
  type SpaceContext,
} from "./headache";

const answers = (over: Partial<HeadacheAnswers> = {}): HeadacheAnswers => ({
  redFlags: RED_FLAGS.map(() => false),
  analgesicDaysThisMonth: 0,
  fever: false,
  worseningOrOver10Days: false,
  chronicCondition: false,
  ulcerOrBleeding: false,
  ate: true,
  paracetamolTablets24h: 0,
  ...over,
});

const ctx = (over: Partial<SpaceContext> = {}): SpaceContext => ({
  co2Avg7dMmHg: 2,
  co2Avg1hMmHg: 2,
  flightDay: 142,
  nauseaOrCongestion: false,
  ...over,
});

const flag = (i: number) => RED_FLAGS.map((_, j) => j === i);

describe("assessHeadache", () => {
  test("sin banderas ni condiciones es autocuidado verde", () => {
    const r = assessHeadache(answers(), ctx());
    expect(r.level).toBe("verde");
    expect(r.who).toBe("autocuidado");
    expect(r.reasons).toEqual([]);
  });

  test.each(RED_FLAGS.map((_, i) => i))(
    "la bandera roja %i lleva al cirujano de vuelo",
    (i) => {
      const r = assessHeadache(answers({ redFlags: flag(i) }), ctx());
      expect(r.level).toBe("rojo");
      expect(r.who).toBe("cirujano de vuelo");
    },
  );

  test("una bandera roja gana sobre las condiciones de ámbar", () => {
    const r = assessHeadache(
      answers({ redFlags: flag(2), fever: true, analgesicDaysThisMonth: 20 }),
      ctx(),
    );
    expect(r.level).toBe("rojo");
  });

  test("analgésicos 15 días o más en el mes es ámbar; 14 no", () => {
    expect(
      assessHeadache(answers({ analgesicDaysThisMonth: 15 }), ctx()).level,
    ).toBe("ambar");
    expect(
      assessHeadache(answers({ analgesicDaysThisMonth: 14 }), ctx()).level,
    ).toBe("verde");
  });

  test("fiebre sin banderas o dolor que empeora es ámbar con su motivo", () => {
    const fever = assessHeadache(answers({ fever: true }), ctx());
    expect(fever.who).toBe("oficial médico");
    expect(fever.reasons).toContain("Tienes fiebre.");
    const worse = assessHeadache(
      answers({ worseningOrOver10Days: true }),
      ctx(),
    );
    expect(worse.level).toBe("ambar");
  });

  test("hígado, riñón, presión, corazón o asma bloquean el ibuprofeno y avisan", () => {
    const r = assessHeadache(answers({ chronicCondition: true }), ctx());
    expect(r.ibuprofen).toBe("no");
    expect(r.level).toBe("ambar");
  });

  test("úlcera o sangrado bloquean el ibuprofeno sin volverlo ámbar", () => {
    const r = assessHeadache(answers({ ulcerOrBleeding: true }), ctx());
    expect(r.ibuprofen).toBe("no");
    expect(r.level).toBe("verde");
  });

  test("sin comer, el ibuprofeno pide comida antes", () => {
    expect(
      assessHeadache(answers({ ate: false }), ctx()).ibuprofenNeedsFood,
    ).toBe(true);
    expect(
      assessHeadache(answers({ ate: false, ulcerOrBleeding: true }), ctx())
        .ibuprofenNeedsFood,
    ).toBe(false);
  });

  test("el paracetamol restante sigue la referencia de 6 tabletas y no baja de 0", () => {
    expect(
      assessHeadache(answers({ paracetamolTablets24h: 2 }), ctx())
        .paracetamolRemaining,
    ).toBe(4);
    expect(
      assessHeadache(answers({ paracetamolTablets24h: 9 }), ctx())
        .paracetamolRemaining,
    ).toBe(0);
  });

  test("CO2 sobre 2.5 mmHg (7 días) o 3 mmHg (1 h) pide revisar la ventilación", () => {
    expect(assessHeadache(answers(), ctx()).checkVentilation).toBe(false);
    expect(
      assessHeadache(answers(), ctx({ co2Avg7dMmHg: 2.6 })).checkVentilation,
    ).toBe(true);
    expect(
      assessHeadache(answers(), ctx({ co2Avg1hMmHg: 3.1 })).checkVentilation,
    ).toBe(true);
  });

  test("primera semana con náusea o congestión sugiere adaptación al espacio", () => {
    expect(
      assessHeadache(answers(), ctx({ flightDay: 3, nauseaOrCongestion: true }))
        .spaceAdaptation,
    ).toBe(true);
    expect(
      assessHeadache(answers(), ctx({ flightDay: 8, nauseaOrCongestion: true }))
        .spaceAdaptation,
    ).toBe(false);
  });
});
