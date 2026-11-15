// Cuándo proponer avisar a Tierra por un rojo (SISTEMA.md §7.4: "Rojo →
// cirujano de vuelo, se envía el paquete del caso"). El semáforo ya decide qué
// es rojo y con qué fuente (HISTORIAS C15: SpO2 ≤ 91 % o pulso ≤ 40 / ≥ 131
// confirmados en 2 lecturas, o el oficial médico lo marca); aquí solo se decide
// si toca proponerlo. La app propone y la persona envía: nunca sale sola
// (SISTEMA.md §7.5, "lo que no hace").
import type { StatusCode } from "@/api/contract";

export type Escalation = {
  /** El motivo del rojo, tal como lo dice el semáforo (con su peligro). */
  reason: string | null;
};

type Input = {
  status: StatusCode;
  reason: string | null;
  /** Ya hay un caso abierto: Tierra ya está avisada. */
  caseActive: boolean;
};

export const escalationFor = ({
  status,
  reason,
  caseActive,
}: Input): Escalation | null =>
  status === "rojo" && !caseActive ? { reason } : null;
