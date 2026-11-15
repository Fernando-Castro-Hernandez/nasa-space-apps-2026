// Campos de la bitácora (HU-09): el esquema que se le pide a la IA y la
// validación de lo que devuelve. La IA solo llena esta forma cerrada: no hay
// campo de texto libre donde pueda colar un diagnóstico o una recomendación.
import {
  SLEEP_QUALITIES,
  SYMPTOMS,
  type CheckInFields,
  type SleepQuality,
  type Symptom,
} from "./contract";

export const EMPTY_FIELDS: CheckInFields = {
  sleepHours: null,
  sleepQuality: null,
  mood: null,
  stress: null,
  symptoms: [],
};

/** JSON Schema para el modo JSON de Workers AI. */
export const FIELDS_SCHEMA = {
  type: "object",
  properties: {
    sleepHours: { type: ["number", "null"], minimum: 0, maximum: 24 },
    sleepQuality: {
      type: ["string", "null"],
      enum: [...SLEEP_QUALITIES, null],
    },
    mood: { type: ["integer", "null"], minimum: 1, maximum: 5 },
    stress: { type: ["integer", "null"], minimum: 1, maximum: 5 },
    symptoms: { type: "array", items: { type: "string", enum: [...SYMPTOMS] } },
  },
  required: ["sleepHours", "sleepQuality", "mood", "stress", "symptoms"],
} as const;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const inRange = (v: unknown, min: number, max: number): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;

/** Escala de 1 a 5 en enteros, o null. `undefined` si no cumple. */
function scale(v: unknown): number | null | undefined {
  if (v === null || v === undefined) return null;
  return inRange(v, 1, 5) && Number.isInteger(v) ? v : undefined;
}

/**
 * Valida lo que devolvió la IA (o lo que mandó la app) contra el esquema.
 * Devuelve los campos limpios, o null si algo no cumple tipo o rango: quien
 * llama decide si reintenta (HU-09) o rechaza el dato (HU-29).
 */
export function parseFields(raw: unknown): CheckInFields | null {
  if (!isRecord(raw)) return null;

  const hours = raw.sleepHours ?? null;
  if (hours !== null && !inRange(hours, 0, 24)) return null;

  const quality = raw.sleepQuality ?? null;
  if (quality !== null && !SLEEP_QUALITIES.includes(quality as SleepQuality))
    return null;

  const mood = scale(raw.mood);
  const stress = scale(raw.stress);
  if (mood === undefined || stress === undefined) return null;

  const list = raw.symptoms ?? [];
  if (!Array.isArray(list)) return null;
  if (!list.every((s) => SYMPTOMS.includes(s as Symptom))) return null;

  return {
    sleepHours: hours === null ? null : Math.round(hours * 2) / 2,
    sleepQuality: quality as SleepQuality | null,
    mood,
    stress,
    symptoms: SYMPTOMS.filter((s) => list.includes(s)),
  };
}

/** Ánimo y estrés son obligatorios para guardar la bitácora (HISTORIAS C9). */
export const fieldsComplete = (f: CheckInFields) =>
  f.mood !== null && f.stress !== null;
