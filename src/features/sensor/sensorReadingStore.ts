// La lectura real del sensor de hoy, por perfil. Si existe, Inicio y Mi estado
// la usan en lugar de la lectura de muestra del panel /demo.
// ponytail: solo este navegador; entre dispositivos llegará con D1 (HU-29).
import { persistedStore } from "@/data/persisted";
import { dayKey } from "@/features/voice/voiceLogStore";
import type { SensorReading } from "./measurement";

export type SavedReading = SensorReading & {
  /** Día local de la medición, "2026-11-15". */
  day: string;
  /** Momento de la medición, en milisegundos (`Date.now()`). */
  takenAt: number;
  /** La medición anterior del mismo día: un rojo por pulso o SpO2 exige dos
   *  lecturas seguidas (FUENTES.md). */
  previous?: { bpm: number; spo2: number };
};

type Readings = Record<string, SavedReading>;

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

/** Lo guardado puede venir de otra versión de la app: se valida al leer. */
export function parseReadings(raw: string | null): Readings {
  if (!raw) return {};
  try {
    const data = JSON.parse(raw) as Record<string, Partial<SavedReading>>;
    const readings: Readings = {};
    for (const [profile, r] of Object.entries(data)) {
      if (
        !r ||
        typeof r.day !== "string" ||
        ![r.bpm, r.spo2, r.takenAt, r.validSeconds].every(isNumber)
      )
        continue;
      const previous = r.previous;
      readings[profile] = {
        day: r.day,
        takenAt: r.takenAt!,
        bpm: r.bpm!,
        spo2: r.spo2!,
        hrv: isNumber(r.hrv) ? r.hrv : null,
        validSeconds: r.validSeconds!,
        ...(previous && isNumber(previous.bpm) && isNumber(previous.spo2)
          ? { previous: { bpm: previous.bpm, spo2: previous.spo2 } }
          : {}),
      };
    }
    return readings;
  } catch {
    return {};
  }
}

const store = persistedStore<Readings>(
  "nostos.sensor-reading",
  parseReadings,
  JSON.stringify,
);

/** La lectura de `profile` solo si es de `today`. */
export const readingOfDay = (
  readings: Readings,
  profile: string,
  today: string,
) => (readings[profile]?.day === today ? readings[profile] : null);

/** Guarda la lectura de hoy; si ya había una de hoy, queda como la anterior. */
export function saveSensorReading(
  profile: string,
  reading: SensorReading,
  now = new Date(),
) {
  const readings = store.get();
  const before = readingOfDay(readings, profile, dayKey(now));
  store.set({
    ...readings,
    [profile]: {
      ...reading,
      day: dayKey(now),
      takenAt: now.getTime(),
      ...(before && { previous: { bpm: before.bpm, spo2: before.spo2 } }),
    },
  });
}

/** La lectura real de hoy del perfil, o null si no se ha medido. */
export function useSensorReading(profile: string): SavedReading | null {
  return readingOfDay(store.use(), profile, dayKey(new Date()));
}

/** Quita la lectura real del perfil: Inicio vuelve a la lectura de muestra. */
export function clearSensorReading(profile: string) {
  const { [profile]: _removed, ...rest } = store.get();
  store.set(rest);
}

/** Reinicio del panel /demo (HU-28). */
export const resetSensorReadings = store.clear;
