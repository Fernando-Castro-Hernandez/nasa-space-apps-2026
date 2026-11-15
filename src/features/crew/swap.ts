// Balanceador de carga (HU-27): si alguien en ámbar por I, G o R tiene una
// tarea pesada, se propone cambiarla con alguien en verde. La propuesta lleva
// solo el peligro, nunca datos de salud.
import type { CrewMember } from "@/data/crew";

export type SwapHazard = "R" | "I" | "G";
export type Task = { personId: string; name: string; heavy: boolean };
export type SwapProposal = {
  fromId: string;
  toId: string;
  task: string;
  hazard: SwapHazard;
};

/** Tareas simuladas de la tripulación para la demo. */
export const TASKS: Task[] = [
  { personId: "ana", name: "caminata espacial", heavy: true },
  { personId: "mei", name: "revisión de módulos", heavy: false },
];

/** Peligro simulado de quien está en ámbar; sale del estado por peligro (HU-12) cuando llegue. */
export const AMBER_HAZARD: Record<string, SwapHazard> = { ana: "I" };

export function proposeSwap(
  crew: CrewMember[],
  tasks: Task[],
  hazards: Record<string, SwapHazard>,
): SwapProposal | null {
  const heavy = (id: string) => tasks.some((t) => t.personId === id && t.heavy);
  const task = tasks.find((t) => {
    const person = crew.find((c) => c.id === t.personId);
    return t.heavy && person?.status === "ambar" && hazards[t.personId];
  });
  const to = crew.find((c) => c.status === "verde" && !heavy(c.id));
  if (!task || !to) return null;
  return {
    fromId: task.personId,
    toId: to.id,
    task: task.name,
    hazard: hazards[task.personId]!,
  };
}
