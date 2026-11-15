// Conversación por voz de la bitácora: lo que la persona no dijo, Lunito lo
// pregunta de uno en uno: sueño, ánimo, estrés y síntomas. Solo ánimo y estrés
// son obligatorios (si siguen vacíos se llenan a mano en la hoja); el resto se
// pregunta para completar el cuadro. Cada pregunta se hace una vez, y ánimo y
// estrés una segunda si la primera respuesta no se entendió.
import { EMPTY_FIELDS } from "@/api/checkinFields";
import type { CheckInFields } from "@/api/contract";

export type FollowUp = "sleep" | "mood" | "stress" | "symptoms";

const ORDER: readonly FollowUp[] = ["sleep", "mood", "stress", "symptoms"];

/** Cuántas veces se puede preguntar cada cosa. */
const MAX_ASKS: Record<FollowUp, number> = {
  sleep: 1,
  mood: 2,
  stress: 2,
  symptoms: 1,
};

const isMissing = (f: CheckInFields, question: FollowUp) =>
  question === "sleep"
    ? f.sleepHours === null && f.sleepQuality === null
    : question === "symptoms"
      ? f.symptoms.length === 0
      : f[question] === null;

/** `asked`: cuántas veces ya se preguntó cada cosa. */
export const nextFollowUp = (
  fields: CheckInFields,
  asked: ReadonlyMap<FollowUp, number>,
): FollowUp | null =>
  ORDER.find(
    (question) =>
      isMissing(fields, question) &&
      (asked.get(question) ?? 0) < MAX_ASKS[question],
  ) ?? null;

const WORDS: Record<string, number> = {
  one: 1,
  uno: 1,
  una: 1,
  two: 2,
  dos: 2,
  three: 3,
  tres: 3,
  four: 4,
  cuatro: 4,
  five: 5,
  cinco: 5,
};

const SCALE_WORD =
  "[1-5]|one|uno|una|two|dos|three|tres|four|cuatro|five|cinco";
const toScale = (word: string) => WORDS[word.toLowerCase()] ?? Number(word);

/**
 * "Cuatro", "4" o "four" contestando una escala de 1 a 5. Si dice dos números
 * distintos o ninguno, es null: lo decide la IA con el resto de la frase.
 * Repetir el mismo ("5, like 5") cuenta como uno.
 */
export function parseScale(text: string): number | null {
  const found = text
    .toLowerCase()
    .match(new RegExp(String.raw`\b(?:${SCALE_WORD})\b`, "g"));
  const values = new Set(found?.map(toScale));
  return values.size === 1 ? [...values][0]! : null;
}

/** "Siete", "7" o "7.5" contestando cuántas horas durmió, o null. */
function parseHours(text: string): number | null {
  const found = text.match(/\b\d{1,2}(?:[.,]5)?\b/g);
  if (found?.length !== 1) return null;
  const hours = Number(found[0].replace(",", "."));
  return hours <= 24 ? hours : null;
}

const NOTHING = /^\W*(no|nope|none|nothing|nada|ninguno|ninguna)\b/i;

/**
 * La respuesta corta que se entiende sin IA: un número en las escalas, las
 * horas de sueño, o "no" a los síntomas. Todo lo demás lo ordena `extract`.
 */
export function quickAnswer(
  question: FollowUp,
  text: string,
): CheckInFields | null {
  if (question === "mood" || question === "stress") {
    const value = parseScale(text);
    return value === null ? null : { ...EMPTY_FIELDS, [question]: value };
  }
  if (question === "sleep") {
    const hours = parseHours(text);
    return hours === null ? null : { ...EMPTY_FIELDS, sleepHours: hours };
  }
  return NOTHING.test(text) ? EMPTY_FIELDS : null;
}

// Sin IA (Worker apagado o sin red) la bitácora se entiende por palabras
// clave, en inglés y español. Es un respaldo: la IA entiende mucho más.
const SYMPTOM_WORDS: readonly [CheckInFields["symptoms"][number], RegExp][] = [
  ["dolor_cabeza", /headache|head (hurts|aches)|dolor de cabeza/i],
  ["mareo", /dizz|mareo|mareado|mareada/i],
  ["dolor_espalda", /back (pain|hurts|aches)|dolor de espalda/i],
  ["congestion", /congest|stuffy|nariz tapada/i],
];

const scaleAbout = (text: string, topic: string) => {
  const found = text.match(
    new RegExp(String.raw`(?:${topic})\D{0,25}?\b(${SCALE_WORD})\b`, "i"),
  );
  return found ? toScale(found[1]!) : null;
};

/** Lo que se saca de un texto sin IA: "mood is 2", "estrés 5", "6 hours". */
export function localFields(text: string): CheckInFields {
  const hours = text.match(/\b(\d{1,2}(?:[.,]5)?)\s*(?:hours?|horas?|hrs?)\b/i);
  return {
    sleepHours: hours ? Number(hours[1]!.replace(",", ".")) : null,
    sleepQuality: null,
    mood: scaleAbout(text, "mood|[aá]nimo"),
    stress: scaleAbout(text, "stress|estr[eé]s"),
    symptoms: SYMPTOM_WORDS.filter(([, words]) => words.test(text)).map(
      ([symptom]) => symptom,
    ),
  };
}

/** Lo nuevo manda; lo que no dijo se queda como estaba. */
export const mergeFields = (
  before: CheckInFields,
  next: CheckInFields,
): CheckInFields => ({
  sleepHours: next.sleepHours ?? before.sleepHours,
  sleepQuality: next.sleepQuality ?? before.sleepQuality,
  mood: next.mood ?? before.mood,
  stress: next.stress ?? before.stress,
  symptoms: [...new Set([...before.symptoms, ...next.symptoms])],
});
