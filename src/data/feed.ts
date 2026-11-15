// Feed simulado de la nave (HU-02): 14 días por astronauta, sin backend.
// Todo es simulado y la interfaz lo etiqueta con FEED_LABEL (SISTEMA.md §11).
// Fuentes de calibración:
// - Ejercicio: promedio de 600 min/semana, OCHMO-TB-031 (FUENTES.md §1). El
//   reparto T2/CEVIS/ARED (30/25/30 min al día) es de muestra, pendiente de validar.
// - Dosis: ~0.4 mSv/día, dentro del rango de 0.2 a 1.0 mSv/día de la ISS en
//   documentos NASA (LSAH newsletter 2023, vol. 28 n.º 2). El rango en tránsito
//   a Marte es mayor: pendiente de validar.
// - CO2: umbral de 2.5 mmHg en promedio de 7 días, OCHMO-TB-004; la muestra
//   queda por debajo salvo que la demo lo suba (HU-28).
// - Presión: 14.7 psia = 101.3 kPa, nivel del mar, OCHMO-TB-003.
// - Temperatura (22 °C) y humedad (30-60 %): tabla de confort de NASA-STD-3001
//   Vol. 2; no son el límite de salud (Fig. 6.2-2): pendiente de validar.
import { MISSION } from "@/data/crew";

export const FEED_LABEL = "simulado";
export const FEED_DAYS = 14;

export type FeedDay = {
  /** Dosis acumulada en mSv. */
  doseMsv: number;
  /** Minutos de ejercicio por equipo. */
  exercise: { t2: number; cevis: number; ared: number };
  co2Mmhg: number;
  tempC: number;
  pressureKpa: number;
  humidityPct: number;
};

const DOSE_PER_DAY = 0.4;
const round1 = (n: number) => Math.round(n * 10) / 10;

/** Ejercicio relativo al promedio de la ISS: Ana duerme poco y entrena menos. */
const EXERCISE_FACTOR: Record<string, number> = { ana: 0.8 };

// Variación determinista (sin azar) para que la muestra y las pruebas no cambien.
const wobble = (day: number, seed: number) => Math.sin(day * 1.7 + seed);

function member(id: string, seed: number): FeedDay[] {
  const factor = EXERCISE_FACTOR[id] ?? 1;
  const min = (base: number, d: number) =>
    Math.round(base * factor * (1 + 0.08 * wobble(d, seed)));
  return Array.from({ length: FEED_DAYS }, (_, d) => ({
    doseMsv: round1((MISSION.day - FEED_DAYS + 1 + d) * DOSE_PER_DAY),
    exercise: { t2: min(30, d), cevis: min(25, d + 3), ared: min(30, d + 6) },
    co2Mmhg: round1(2 + 0.2 * wobble(d, seed + 1)),
    tempC: round1(22 + 0.5 * wobble(d, seed + 2)),
    pressureKpa: 101.3,
    humidityPct: Math.round(45 + 5 * wobble(d, seed + 3)),
  }));
}

export const FEED: Record<string, FeedDay[]> = {
  ana: member("ana", 1),
  luis: member("luis", 2),
  mei: member("mei", 3),
  omar: member("omar", 4),
};

export const exerciseTotal = (d: FeedDay) =>
  d.exercise.t2 + d.exercise.cevis + d.exercise.ared;
