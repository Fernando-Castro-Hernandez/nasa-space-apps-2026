// Tripulación y misión de muestra, simuladas para la demo (SISTEMA.md §11).
// Todas las pantallas usan estos mismos nombres para que la historia cuadre.
import type { Status } from "@/domain/vitals";

export type CrewMember = {
  id: string;
  name: string;
  role: string;
  /** Estado general en palabras para la constelación: nunca números. */
  status: Status;
  mood: string;
};

export const MISSION = {
  day: 142,
  phase: "Tránsito a Marte",
  /** Retraso de comunicación en un sentido, en minutos (FUENTES.md §4). */
  delayMinutes: 14,
} as const;

export const ME = "ana";

export const CREW: CrewMember[] = [
  {
    id: "ana",
    name: "Ana",
    role: "Especialista de misión",
    status: "ambar",
    mood: "Descansando poco",
  },
  {
    id: "luis",
    name: "Luis",
    role: "Oficial médico (CMO)",
    status: "verde",
    mood: "Bien",
  },
  { id: "mei", name: "Mei", role: "Comandante", status: "verde", mood: "Bien" },
  {
    id: "omar",
    name: "Omar",
    role: "Ingeniero de vuelo",
    status: "verde",
    mood: "Bien",
  },
];

export const crewMember = (id: string) => CREW.find((c) => c.id === id)!;
