import { expect, test } from "vitest";
import {
  draftAnswers,
  emergencyHref,
  emptyDraft,
  nextStep,
  RESULT_STEP,
  stepProgress,
} from "./assistant";
import { RED_FLAGS } from "./headache";

test("cada paso cuenta cuántas preguntas faltan", () => {
  const d = emptyDraft();
  expect(stepProgress(d, 0)).toEqual({
    answered: 0,
    total: RED_FLAGS.length,
    done: false,
  });
  d.redFlags = d.redFlags.map((_, i) => (i < 3 ? false : undefined));
  expect(stepProgress(d, 0)).toMatchObject({ answered: 3, done: false });
  expect(stepProgress({ ...d, fever: false }, 1)).toEqual({
    answered: 1,
    total: 2,
    done: false,
  });
  expect(
    stepProgress(
      { ...d, chronicCondition: true, ulcerOrBleeding: false, ate: true },
      2,
    ).done,
  ).toBe(true);
});

test("los números no cuentan como pendientes: siempre muestran un valor", () => {
  const d = { ...emptyDraft(), fever: false, worseningOrOver10Days: true };
  expect(stepProgress(d, 1).done).toBe(true);
});

test("un sí en el descarte salta directo al resultado", () => {
  const d = emptyDraft();
  expect(nextStep(d, 0)).toBe(1);
  d.redFlags[2] = true;
  expect(nextStep(d, 0)).toBe(RESULT_STEP);
  expect(nextStep(emptyDraft(), RESULT_STEP)).toBe(RESULT_STEP);
});

test("las respuestas completas usan los valores de siempre en lo no respondido", () => {
  const answers = draftAnswers({ ...emptyDraft(), paracetamolTablets24h: 2 });
  expect(answers).toMatchObject({
    redFlags: RED_FLAGS.map(() => false),
    analgesicDaysThisMonth: 0,
    fever: false,
    ate: true,
    paracetamolTablets24h: 2,
  });
});

test("el enlace a Emergencia lleva a la persona activa", () => {
  expect(emergencyHref("ana")).toBe("/emergencia?quien=ana");
});
