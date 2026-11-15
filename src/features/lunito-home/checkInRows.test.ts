import { expect, test } from "vitest";
import { EMPTY_FIELDS } from "@/api/checkinFields";
import { checkInRows } from "./checkInRows";

const values = (fields: Parameters<typeof checkInRows>[0]) =>
  Object.fromEntries(checkInRows(fields).map((row) => [row.key, row.value]));

test("repite lo que la persona contó, con la palabra de cada escala", () => {
  expect(
    values({
      sleepHours: 5.5,
      sleepQuality: "mala",
      mood: 4,
      stress: 2,
      symptoms: ["dolor_cabeza", "mareo"],
    }),
  ).toEqual({
    sleep: "5.5 h · Mala",
    mood: "4 de 5 · bueno",
    stress: "2 de 5 · poco",
    symptoms: "Dolor de cabeza, Mareo",
  });
});

test("lo que no dijo queda sin dato, y sin síntomas lo dice", () => {
  expect(values({ ...EMPTY_FIELDS, mood: 1, stress: 5 })).toEqual({
    sleep: "Sin dato",
    mood: "1 de 5 · muy bajo",
    stress: "5 de 5 · mucho",
    symptoms: "Ninguno reportado",
  });
  expect(values({ ...EMPTY_FIELDS, sleepHours: 7 }).sleep).toBe("7 h");
  expect(values({ ...EMPTY_FIELDS, sleepQuality: "buena" }).sleep).toBe(
    "Buena",
  );
});
