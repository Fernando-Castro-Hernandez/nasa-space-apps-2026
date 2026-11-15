import { expect, test } from "vitest";
import { parseSample } from "./protocol";

test("lee el formato actual del firmware: pulso y SpO2", () => {
  expect(parseSample("72,98")).toEqual({
    bpm: 72,
    spo2: 98,
    contact: true,
    intervals: [],
  });
});

test("un cero es 'sin dato válido': no se sabe si hay dedo", () => {
  expect(parseSample("0,0")).toEqual({
    bpm: null,
    spo2: null,
    contact: false,
    intervals: [],
  });
  // El pulso puede faltar mientras la SpO2 ya llegó (y al revés).
  expect(parseSample("0,97")).toMatchObject({
    bpm: null,
    spo2: 97,
    contact: true,
  });
  expect(parseSample("70,0")).toMatchObject({
    bpm: 70,
    spo2: null,
    contact: true,
  });
});

test("el formato extendido trae intervalos y distingue 'hay dedo, falta señal'", () => {
  expect(parseSample("72,98,830,845")).toEqual({
    bpm: 72,
    spo2: 98,
    contact: true,
    intervals: [830, 845],
  });
  expect(parseSample("-1,-1")).toEqual({
    bpm: null,
    spo2: null,
    contact: true,
    intervals: [],
  });
});

test("tolera espacios, saltos de línea y el relleno del búfer", () => {
  expect(parseSample(" 72,98\r\n")).toMatchObject({ bpm: 72, spo2: 98 });
  expect(parseSample("72,98\0\0\0")).toMatchObject({ bpm: 72, spo2: 98 });
});

test("descarta valores que el sensor no puede medir", () => {
  expect(parseSample("999,98")).toMatchObject({ bpm: null, spo2: 98 });
  expect(parseSample("72,140")).toMatchObject({ bpm: 72, spo2: null });
  expect(parseSample("72,98,5,830,9000")?.intervals).toEqual([830]);
});

test.each(["", "72", "hola", "72;98", "72,abc", "7.5,98", ","])(
  "un mensaje con otra forma no es una lectura: %j",
  (text) => {
    expect(parseSample(text)).toBeNull();
  },
);
