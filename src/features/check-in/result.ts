// Cierre del check-in: el estado del día, 1 o 2 acciones y lo que Lunito dice.
// Todo sale de las reglas (SISTEMA.md §1: "la IA habla, las reglas deciden"):
// el estado es el de la lectura de Inicio, las acciones son las del día que
// siguen pendientes (las mismas de Tareas) y la frase es la de lunitoRules.
import type { LunitoContext } from "@/api/contract";
import { stateLine } from "@/api/lunitoRules";
import { translate, type Locale } from "@/i18n/translate";

/** Más de dos acciones ya no se recuerdan al salir del check-in. */
export const MAX_RESULT_ACTIONS = 2;

export type CheckInResult = {
  status: LunitoContext["status"];
  reason: string | null;
  /** Lo que conviene hacer hoy; vacío si ya está todo hecho. */
  actions: string[];
  /** Lo que Lunito dice en voz alta. */
  line: string;
};

export function checkInResult(
  context: Omit<LunitoContext, "checkInDone">,
  locale: Locale,
): CheckInResult {
  const done = { ...context, checkInDone: true };
  // En Atención, lo único que se pide es avisar al oficial médico (o repetir la
  // medición, si quien hace el check-in es el oficial médico).
  const actions =
    context.status === "rojo"
      ? [
          context.name === context.cmoName
            ? translate(locale, "lunito.rules.repeatMeasurement")
            : translate(locale, "lunito.rules.tellCmo", {
                cmo: context.cmoName,
              }),
        ]
      : context.pendingActions.slice(0, MAX_RESULT_ACTIONS);
  return {
    status: context.status,
    reason: context.reason,
    actions,
    line: stateLine(done, locale),
  };
}
