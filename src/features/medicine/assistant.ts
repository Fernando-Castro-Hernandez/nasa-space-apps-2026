// Estado del asistente de dolor de cabeza mientras se responde: qué falta en
// cada paso, a qué paso se sigue y las respuestas completas para
// assessHeadache. Sin React, para probarlo aparte.
import { RED_FLAGS, type HeadacheAnswers } from "./headache";

/** Respuestas a medio llenar: undefined es "todavía sin responder". */
export type Draft = Partial<Omit<HeadacheAnswers, "redFlags">> & {
  redFlags: (boolean | undefined)[];
};

/** Pasos con preguntas, en orden; después viene el resultado. */
export const QUESTION_STEPS = ["screening", "history", "medicines"] as const;
export const RESULT_STEP = QUESTION_STEPS.length;

export const emptyDraft = (): Draft => ({
  redFlags: RED_FLAGS.map(() => undefined),
});

export const anyRedFlag = (d: Draft) => d.redFlags.some((f) => f === true);

// Las preguntas de sí o no de cada paso. Los números (días de analgésico y
// tabletas) siempre muestran un valor, así que no cuentan como pendientes.
function yesNoAnswers(d: Draft, step: number): (boolean | undefined)[] {
  if (step === 0) return d.redFlags;
  if (step === 1) return [d.fever, d.worseningOrOver10Days];
  return [d.chronicCondition, d.ulcerOrBleeding, d.ate];
}

/** Cuántas preguntas del paso ya tienen respuesta. */
export function stepProgress(d: Draft, step: number) {
  const answers = yesNoAnswers(d, step);
  const answered = answers.filter((a) => a !== undefined).length;
  return { answered, total: answers.length, done: answered === answers.length };
}

/** Siguiente paso: un "sí" en el descarte salta directo al resultado. */
export const nextStep = (d: Draft, step: number) =>
  anyRedFlag(d) ? RESULT_STEP : Math.min(RESULT_STEP, step + 1);

/** Respuestas completas. Lo que no se respondió (los pasos que salta un "sí"
 *  en el descarte) toma el valor que ya usaba el asistente. */
export function draftAnswers(d: Draft): HeadacheAnswers {
  return {
    redFlags: d.redFlags.map(Boolean),
    analgesicDaysThisMonth: d.analgesicDaysThisMonth ?? 0,
    fever: d.fever ?? false,
    worseningOrOver10Days: d.worseningOrOver10Days ?? false,
    chronicCondition: d.chronicCondition ?? false,
    ulcerOrBleeding: d.ulcerOrBleeding ?? false,
    ate: d.ate ?? true,
    paracetamolTablets24h: d.paracetamolTablets24h ?? 0,
  };
}

/** Emergencia con la persona ya elegida (/emergencia?quien=ana). */
export const emergencyHref = (profileId: string) =>
  `/emergencia?quien=${encodeURIComponent(profileId)}`;
