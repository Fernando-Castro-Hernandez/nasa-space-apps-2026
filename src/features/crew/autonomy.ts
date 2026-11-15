// Meta común de autonomía (SISTEMA.md §8, FUENTES.md §4). Escalar bien un
// caso rojo también cuenta: la meta nunca debe premiar esconder un problema.

export type CaseOutcome =
  "resuelto a bordo" | "escalado correctamente" | "mal atendido" | "abierto";

export type Autonomy = { wellHandled: number; closed: number; ratio: number };

export function autonomy(outcomes: CaseOutcome[]): Autonomy {
  const closed = outcomes.filter((o) => o !== "abierto").length;
  const wellHandled = outcomes.filter(
    (o) => o === "resuelto a bordo" || o === "escalado correctamente",
  ).length;
  return {
    wellHandled,
    closed,
    ratio: closed === 0 ? 1 : wellHandled / closed,
  };
}

export type Hazard = "R" | "I" | "D" | "G" | "E";
export const HAZARDS: Hazard[] = ["R", "I", "D", "G", "E"];
export type Case = { hazard: Hazard; outcome: CaseOutcome };

/** Desglose por peligro (HU-17): sin nombres, nunca métricas individuales. */
export function byHazard(cases: Case[]) {
  return HAZARDS.map((hazard) => ({
    hazard,
    ...autonomy(cases.filter((c) => c.hazard === hazard).map((c) => c.outcome)),
  })).filter((h) => h.closed > 0);
}

const sample = (hazard: Hazard, outcome: CaseOutcome, n = 1): Case[] =>
  Array.from({ length: n }, () => ({ hazard, outcome }));

/** Casos simulados de la misión para la demo. */
export const SAMPLE_HAZARD_CASES: Case[] = [
  ...sample("E", "resuelto a bordo", 4),
  ...sample("I", "resuelto a bordo", 3),
  ...sample("I", "mal atendido"),
  ...sample("G", "resuelto a bordo", 2),
  ...sample("R", "escalado correctamente"),
  ...sample("D", "escalado correctamente"),
  ...sample("D", "abierto"),
];

export const SAMPLE_CASES: CaseOutcome[] = SAMPLE_HAZARD_CASES.map(
  (c) => c.outcome,
);

/** Meta de la fase: 100 %, decisión del equipo (FUENTES.md §4). */
export const PHASE_GOAL = 1;
