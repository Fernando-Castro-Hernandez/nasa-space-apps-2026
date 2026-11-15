// Compañero del día (HU-26): a quien está en ámbar se le asigna alguien en
// verde con una acción simple. La salida solo lleva nombres y la acción,
// nunca el motivo del semáforo ni datos de salud.
import type { CrewMember } from "@/data/crew";
import { t } from "@/i18n";

export type Companion = {
  needsId: string;
  companionId: string;
  action: string;
};

// ponytail: cualquier ámbar cuenta; la regla "ámbar por I" llega cuando el
// estado por peligro (HU-12) esté conectado. Elige al primer verde disponible.
export function pickCompanion(crew: CrewMember[]): Companion | null {
  const needs = crew.find((c) => c.status === "ambar");
  const buddy = crew.find((c) => c.status === "verde");
  if (!needs || !buddy) return null;
  return {
    needsId: needs.id,
    companionId: buddy.id,
    action: t("crew.companion.action", { name: needs.name }),
  };
}
