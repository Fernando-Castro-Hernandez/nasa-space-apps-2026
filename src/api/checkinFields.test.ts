import { expect, test } from "vitest";
import { EMPTY_FIELDS, fieldsComplete, parseFields } from "./checkinFields";

test("acepta una respuesta completa y la deja en el orden de la lista", () => {
  expect(
    parseFields({
      sleepHours: 5.2,
      sleepQuality: "mala",
      mood: 2,
      stress: 4,
      symptoms: ["dolor_cabeza", "mareo"],
    }),
  ).toEqual({
    sleepHours: 5,
    sleepQuality: "mala",
    mood: 2,
    stress: 4,
    symptoms: ["mareo", "dolor_cabeza"],
  });
});

test("lo que la persona no dijo queda en null, no se inventa", () => {
  expect(parseFields({ symptoms: [] })).toEqual(EMPTY_FIELDS);
  expect(
    parseFields({
      sleepHours: null,
      sleepQuality: null,
      mood: null,
      stress: null,
      symptoms: [],
    }),
  ).toEqual(EMPTY_FIELDS);
});

test("rechaza valores fuera de rango o de la lista cerrada", () => {
  const ok = { sleepHours: 7, sleepQuality: "buena", mood: 4, stress: 2 };
  expect(parseFields({ ...ok, sleepHours: 30, symptoms: [] })).toBeNull();
  expect(parseFields({ ...ok, mood: 6, symptoms: [] })).toBeNull();
  expect(parseFields({ ...ok, stress: 2.5, symptoms: [] })).toBeNull();
  expect(
    parseFields({ ...ok, sleepQuality: "pésima", symptoms: [] }),
  ).toBeNull();
  expect(parseFields({ ...ok, symptoms: ["migraña"] })).toBeNull();
  expect(parseFields({ ...ok, symptoms: "mareo" })).toBeNull();
});

test("rechaza lo que no es un objeto", () => {
  expect(parseFields(null)).toBeNull();
  expect(parseFields("{}")).toBeNull();
  expect(parseFields([])).toBeNull();
});

test("no deja pasar campos extra: no hay dónde escribir un diagnóstico", () => {
  const fields = parseFields({
    mood: 3,
    stress: 3,
    symptoms: [],
    diagnosis: "migraña",
    recommendation: "toma ibuprofeno",
  });
  expect(Object.keys(fields!).toSorted()).toEqual([
    "mood",
    "sleepHours",
    "sleepQuality",
    "stress",
    "symptoms",
  ]);
});

test("la bitácora está completa solo con ánimo y estrés", () => {
  expect(fieldsComplete(EMPTY_FIELDS)).toBe(false);
  expect(fieldsComplete({ ...EMPTY_FIELDS, mood: 3 })).toBe(false);
  expect(fieldsComplete({ ...EMPTY_FIELDS, mood: 3, stress: 1 })).toBe(true);
});
