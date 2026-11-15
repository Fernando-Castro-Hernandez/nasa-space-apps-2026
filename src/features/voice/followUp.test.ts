import { expect, test } from "vitest";
import { EMPTY_FIELDS } from "@/api/checkinFields";
import {
  localFields,
  mergeFields,
  nextFollowUp,
  parseScale,
  quickAnswer,
  type FollowUp,
} from "./followUp";
import { silenceDetector } from "./silence";

test("pregunta sueño, ánimo, estrés y síntomas; ánimo y estrés una segunda vez si no se entendió", () => {
  const asked = new Map<FollowUp, number>();
  const order: (FollowUp | null)[] = [];
  for (let i = 0; i < 7; i++) {
    const next = nextFollowUp(EMPTY_FIELDS, asked);
    order.push(next);
    if (next) asked.set(next, (asked.get(next) ?? 0) + 1);
  }
  expect(order).toEqual([
    "sleep",
    "mood",
    "mood",
    "stress",
    "stress",
    "symptoms",
    null,
  ]);
  const told = {
    ...EMPTY_FIELDS,
    sleepHours: 6,
    mood: 3,
    stress: 1,
    symptoms: ["mareo" as const],
  };
  expect(nextFollowUp(told, new Map())).toBeNull();
  expect(nextFollowUp({ ...told, sleepHours: null }, new Map())).toBe("sleep");
});

test("sin IA se entiende por palabras clave, en los dos idiomas", () => {
  expect(
    localFields(
      "I am feeling sad. My mood is 2 today. 5. My stressed anchorific like 5. I have a little headache.",
    ),
  ).toMatchObject({ mood: 2, stress: 5, symptoms: ["dolor_cabeza"] });
  expect(
    localFields(
      "Dormí 6 horas, mi ánimo es cuatro y el estrés 1, algo de mareo",
    ),
  ).toMatchObject({ sleepHours: 6, mood: 4, stress: 1, symptoms: ["mareo"] });
  expect(localFields("todo bien")).toEqual(EMPTY_FIELDS);
});

test("las respuestas cortas se entienden sin IA", () => {
  expect(quickAnswer("mood", "cuatro")?.mood).toBe(4);
  expect(quickAnswer("stress", "pretty calm")).toBeNull();
  expect(quickAnswer("sleep", "siete y media")).toBeNull();
  expect(quickAnswer("sleep", "slept 7.5 hours")?.sleepHours).toBe(7.5);
  expect(quickAnswer("sleep", "30")).toBeNull();
  expect(quickAnswer("symptoms", "No, nada")).toEqual(EMPTY_FIELDS);
  expect(quickAnswer("symptoms", "my head hurts")).toBeNull();
});

test("una frase larga no es una respuesta corta: la decide la IA", () => {
  // "Una" y "one" son artículos, no un 1.
  expect(quickAnswer("mood", "Tengo una energía increíble hoy")).toBeNull();
  expect(quickAnswer("mood", "I'm having one of those great days")).toBeNull();
  expect(
    quickAnswer("stress", "Tengo una reunión que me preocupa mucho"),
  ).toBeNull();
  expect(quickAnswer("mood", "tengo una duda")).toBeNull();
  expect(quickAnswer("mood", "un 4")?.mood).toBe(4);
  expect(quickAnswer("stress", "uno")?.stress).toBe(1);
  // Empezar con "no" no es decir "nada".
  expect(
    quickAnswer("symptoms", "No me siento bien, me duele la cabeza"),
  ).toBeNull();
  expect(
    quickAnswer("symptoms", "No, well, actually I have a headache"),
  ).toBeNull();
  expect(quickAnswer("symptoms", "No, mareo")).toBeNull();
  expect(quickAnswer("symptoms", "no")).toEqual(EMPTY_FIELDS);
  // Un número que no son horas de sueño.
  expect(quickAnswer("sleep", "Mal, me desperté 3 veces")).toBeNull();
  expect(quickAnswer("sleep", "I went to bed at 11")).toBeNull();
  expect(quickAnswer("sleep", "7")?.sleepHours).toBe(7);
  expect(quickAnswer("sleep", "como 6 horas")?.sleepHours).toBe(6);
  expect(quickAnswer("sleep", "6,5")?.sleepHours).toBe(6.5);
});

test("entiende un número suelto, en cifra o en palabra, en los dos idiomas", () => {
  expect(parseScale("4")).toBe(4);
  expect(parseScale("Four")).toBe(4);
  expect(parseScale("un cuatro, creo")).toBe(4);
  expect(parseScale("Cinco.")).toBe(5);
  expect(parseScale("pretty good")).toBeNull();
  expect(parseScale("entre dos y tres")).toBeNull();
  expect(parseScale("5. Like 5")).toBe(5);
  expect(parseScale("dormí 7 horas")).toBeNull();
});

test("mezclar suma lo nuevo sin borrar lo que ya se dijo", () => {
  const before = {
    ...EMPTY_FIELDS,
    sleepHours: 6,
    symptoms: ["mareo" as const],
  };
  const next = {
    ...EMPTY_FIELDS,
    mood: 4,
    symptoms: ["dolor_cabeza" as const],
  };
  expect(mergeFields(before, next)).toEqual({
    sleepHours: 6,
    sleepQuality: null,
    mood: 4,
    stress: null,
    symptoms: ["mareo", "dolor_cabeza"],
  });
});

test("corta tras un silencio solo si antes habló", () => {
  const quiet = silenceDetector(1000);
  expect(quiet(0, 0)).toBe(false);
  expect(quiet(0, 5000)).toBe(false); // nunca habló: no corta
  expect(quiet(0.4, 5200)).toBe(false);
  expect(quiet(0.02, 5400)).toBe(false);
  expect(quiet(0.02, 6300)).toBe(false);
  expect(quiet(0.02, 6400)).toBe(true);
  expect(quiet(0.4, 6600)).toBe(false); // volvió a hablar: reinicia
});
