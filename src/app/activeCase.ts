// Caso de emergencia en curso, visto desde la estructura de la app: con un
// caso abierto, toda la app lo muestra (SISTEMA.md §1 y §7.5).
import { CREW } from "@/data/crew";
import type { EmergencyCase } from "@/features/emergency/caseLogic";
import { useCase } from "@/features/emergency/caseStore";

/** Un caso guardado sigue en curso hasta que se cierra a propósito. */
export const isCaseActive = (c: EmergencyCase | null): c is EmergencyCase =>
  c !== null && c.closedAt === undefined;

/** Pantallas que ya son la emergencia: no repiten el acceso ni la franja. */
export const isEmergencyPath = (path: string) =>
  path === "/emergencia" || path === "/tierra";

/** Nombre de la persona del caso (o su id, si ya no está en la tripulación). */
export const casePersonName = (c: EmergencyCase) =>
  CREW.find((member) => member.id === c.personId)?.name ?? c.personId;

/** El caso en curso, o null si no hay ninguno abierto. */
export function useActiveCase() {
  const c = useCase();
  return isCaseActive(c) ? c : null;
}
