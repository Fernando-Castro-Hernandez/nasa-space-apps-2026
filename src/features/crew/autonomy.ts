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

/** Casos simulados de la misión para la demo. */
export const SAMPLE_CASES: CaseOutcome[] = [
  ...Array<CaseOutcome>(9).fill("resuelto a bordo"),
  "escalado correctamente",
  "escalado correctamente",
  "mal atendido",
  "abierto",
];

/** Meta de la fase: 100 %, decisión del equipo (FUENTES.md §4). */
export const PHASE_GOAL = 1;
