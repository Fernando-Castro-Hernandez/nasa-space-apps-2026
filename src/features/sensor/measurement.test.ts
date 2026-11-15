import { expect, test } from "vitest";
import {
  addSample,
  EMPTY_MEASUREMENT,
  MEASURE_SECONDS,
  type Measurement,
  readingOf,
  rmssd,
} from "./measurement";
import type { SensorSample } from "./protocol";

const sample = (
  bpm: number | null,
  spo2: number | null,
  intervals: number[] = [],
): SensorSample => ({
  bpm,
  spo2,
  contact: bpm !== null || spo2 !== null,
  intervals,
});
const NOTHING = sample(null, null);

const feed = (samples: SensorSample[], from: Measurement = EMPTY_MEASUREMENT) =>
  samples.reduce(addSample, from);
const repeat = (s: SensorSample, times: number) =>
  Array.from({ length: times }, () => s);

test("el contador no corre mientras no llega un valor válido", () => {
  const m = feed([...repeat(NOTHING, 13), sample(null, 97)]);
  expect(m.seconds).toBe(0);
  expect(m.notice).toBeNull();
});

test("60 segundos seguidos dan la lectura: la mediana del pulso y la SpO2", () => {
  const m = feed([
    ...repeat(NOTHING, 12),
    ...repeat(sample(70, 98), 30),
    ...repeat(sample(74, 97), 29),
    sample(90, 96),
  ]);
  expect(m.done).toBe(true);
  expect(readingOf(m)).toEqual({
    bpm: 72,
    spo2: 98,
    hrv: null,
    validSeconds: MEASURE_SECONDS,
  });
});

test("antes de terminar no hay lectura", () => {
  const m = feed(repeat(sample(70, 98), 59));
  expect(m.done).toBe(false);
  expect(m.seconds).toBe(59);
  expect(readingOf(m)).toBeNull();
});

test("si la señal se pierde a media medición, vuelve a empezar y lo avisa", () => {
  const m = feed([...repeat(sample(70, 98), 20), NOTHING]);
  expect(m.seconds).toBe(0);
  expect(m.valid).toEqual([]);
  expect(m.notice).toBe("moved");
  // El aviso se queda hasta que vuelve la señal.
  expect(addSample(m, NOTHING).notice).toBe("moved");
  expect(addSample(m, sample(71, 98))).toMatchObject({
    seconds: 1,
    notice: null,
  });
});

test("un salto de pulso mayor al límite reinicia; uno normal no", () => {
  const steady = feed(repeat(sample(70, 98), 10));
  expect(addSample(steady, sample(96, 98))).toMatchObject({
    seconds: 0,
    notice: "moved",
  });
  expect(addSample(steady, sample(80, 98)).seconds).toBe(11);
});

test("un segundo con un solo valor pasa, pero no cuenta como válido", () => {
  const m = feed([...repeat(sample(70, 98), 5), sample(70, null)]);
  expect(m.seconds).toBe(6);
  expect(m.valid).toHaveLength(5);
});

test("con menos de 30 segundos válidos la medición no se guarda", () => {
  const m = feed([
    ...repeat(sample(70, 98), 29),
    ...repeat(sample(70, null), 31),
  ]);
  expect(m.done).toBe(false);
  expect(m.seconds).toBe(0);
  expect(m.notice).toBe("short");
});

test("con 30 segundos válidos de 60 sí se guarda", () => {
  const m = feed([
    ...repeat(sample(70, 98), 30),
    ...repeat(sample(70, null), 30),
  ]);
  expect(readingOf(m)).toMatchObject({ bpm: 70, spo2: 98, validSeconds: 30 });
});

test("una medición terminada ya no cambia", () => {
  const done = feed(repeat(sample(70, 98), 60));
  expect(addSample(done, NOTHING)).toBe(done);
});

test("RMSSD: raíz de la media de los cuadrados de las diferencias", () => {
  // Diferencias que alternan +20 y −20 ms: RMSSD = 20.
  const intervals = Array.from({ length: 40 }, (_, i) => 800 + (i % 2) * 20);
  expect(rmssd(intervals)).toBeCloseTo(20);
});

test("RMSSD descarta un latido perdido y pide intervalos suficientes", () => {
  const clean = Array.from({ length: 40 }, (_, i) => 800 + (i % 2) * 20);
  // Un intervalo doble (un latido que no se detectó) no infla la HRV.
  const withArtifact = [...clean.slice(0, 20), 1600, ...clean.slice(20)];
  expect(rmssd(withArtifact)).toBeCloseTo(20, 0);
  expect(rmssd(clean.slice(0, 10))).toBeNull();
});

test("con intervalos de la estación, la lectura incluye la HRV", () => {
  const m = feed(
    Array.from({ length: 60 }, (_, i) => sample(72, 98, [820 + (i % 2) * 30])),
  );
  expect(readingOf(m)).toMatchObject({ bpm: 72, spo2: 98, hrv: 30 });
});
