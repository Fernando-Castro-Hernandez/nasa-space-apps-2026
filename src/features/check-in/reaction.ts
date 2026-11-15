// Prueba de reacción tipo PVT. Un lapso es una respuesta de más de 355 ms en
// la versión breve validada de 3 minutos (Basner 2011, ver docs/FUENTES.md).
// Esta versión de 5 intentos es solo para la demo: no está validada.

export const LAPSE_MS = 355;
export const TRIALS = 5;
const MIN_WAIT_MS = 2000;
const MAX_WAIT_MS = 6000;

/** Espera aleatoria antes de la señal, para que no se pueda anticipar. */
export const waitMs = (random: number) =>
  Math.round(MIN_WAIT_MS + random * (MAX_WAIT_MS - MIN_WAIT_MS));

export type ReactionSummary = {
  count: number;
  meanMs: number;
  lapses: number;
};

/** Resumen de los tiempos válidos (los toques adelantados no cuentan). */
export function summarize(times: number[]): ReactionSummary {
  const valid = times.filter((t) => t > 0);
  if (valid.length === 0) return { count: 0, meanMs: 0, lapses: 0 };
  const mean = valid.reduce((a, b) => a + b, 0) / valid.length;
  return {
    count: valid.length,
    meanMs: Math.round(mean),
    lapses: valid.filter((t) => t > LAPSE_MS).length,
  };
}
