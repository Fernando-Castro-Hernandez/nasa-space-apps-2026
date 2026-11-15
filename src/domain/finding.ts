// Resultado de una regla del semáforo (HU-12): estado, motivo, peligro RIDGE
// y fuente. Una regla sin fuente puede dar amarillo pero nunca rojo (C7, C15).
import type { Status } from "@/domain/vitals";
import { t } from "@/i18n";

/** Los 5 peligros de NASA (SISTEMA.md §3). */
export type Hazard = "R" | "I" | "D" | "G" | "E";

/** Nombre del peligro en el idioma activo: se lee al usarlo, no al cargar. */
export const HAZARD_NAME: Record<Hazard, string> = {
  get R() {
    return t("common.hazards.R");
  },
  get I() {
    return t("common.hazards.I");
  },
  get D() {
    return t("common.hazards.D");
  },
  get G() {
    return t("common.hazards.G");
  },
  get E() {
    return t("common.hazards.E");
  },
};

export type Source = { name: string; url: string };

export type Finding = {
  /** Regla que lo produjo, por ejemplo "hrv-low"; las acciones se ligan a él. */
  id: string;
  hazard: Hazard;
  status: Status;
  /** Motivo en texto, sin la palabra del estado: la pone la pantalla. */
  reason: string;
  /** null = pendiente de validar. */
  source: Source | null;
  /** Línea base insuficiente o pocas lecturas: no cambia el semáforo. */
  insufficient?: boolean;
};

/** "pendiente de validar" en el idioma activo. Es función para que el texto
 *  se pida al usarlo y siga el cambio de idioma. */
export const PENDING = () => t("common.pendingValidation");

/** Crea un hallazgo aplicando la regla de seguridad: sin fuente, el rojo
 *  baja a amarillo y el motivo lo dice. */
export function finding(f: Finding): Finding {
  if (f.status === "rojo" && f.source === null) {
    const reason = t("domain.reasons.unsourced", {
      reason: f.reason,
      pending: PENDING(),
    });
    return { ...f, status: "ambar", reason };
  }
  return f;
}

const RANK: Record<Status, number> = { verde: 0, ambar: 1, rojo: 2 };

export const worst = (statuses: Status[]): Status =>
  statuses.reduce<Status>((w, s) => (RANK[s] > RANK[w] ? s : w), "verde");

export const bySeverity = (a: Finding, b: Finding) =>
  RANK[b.status] - RANK[a.status];
