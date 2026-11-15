import { beforeEach, expect, test } from "vitest";
import {
  clearSensorReading,
  parseReadings,
  readingOfDay,
  resetSensorReadings,
  saveSensorReading,
} from "./sensorReadingStore";

const READING = { bpm: 72, spo2: 98, hrv: null, validSeconds: 58 };
const NOW = new Date(2026, 10, 15, 9, 24);

const stored = () =>
  parseReadings(window.localStorage.getItem("nostos.sensor-reading"));

beforeEach(resetSensorReadings);

test("guarda la lectura del perfil con su día y su hora", () => {
  saveSensorReading("ana", READING, NOW);
  expect(stored().ana).toEqual({
    ...READING,
    day: "2026-11-15",
    takenAt: NOW.getTime(),
  });
  expect(stored().luis).toBeUndefined();
});

test("una segunda lectura del mismo día recuerda la anterior", () => {
  saveSensorReading("ana", { ...READING, spo2: 90 }, NOW);
  saveSensorReading("ana", { ...READING, spo2: 89 }, NOW);
  expect(stored().ana).toMatchObject({
    spo2: 89,
    previous: { bpm: 72, spo2: 90 },
  });
});

test("la lectura de ayer no cuenta como la de hoy ni como la anterior", () => {
  saveSensorReading("ana", READING, new Date(2026, 10, 14, 22, 0));
  expect(readingOfDay(stored(), "ana", "2026-11-15")).toBeNull();
  saveSensorReading("ana", READING, NOW);
  expect(stored().ana?.previous).toBeUndefined();
});

test("quitar la lectura de un perfil deja las de los demás", () => {
  saveSensorReading("ana", READING, NOW);
  saveSensorReading("luis", READING, NOW);
  clearSensorReading("ana");
  expect(Object.keys(stored())).toEqual(["luis"]);
});

test("lo guardado con otra forma se ignora", () => {
  expect(parseReadings("no es json")).toEqual({});
  expect(
    parseReadings(
      JSON.stringify({
        ana: { day: "2026-11-15", bpm: "72", spo2: 98 },
        luis: { ...READING, hrv: 41, day: "2026-11-15", takenAt: 1 },
      }),
    ),
  ).toEqual({
    luis: { ...READING, hrv: 41, day: "2026-11-15", takenAt: 1 },
  });
});
