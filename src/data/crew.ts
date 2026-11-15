// Tripulación y misión de muestra, simuladas para la demo (SISTEMA.md §11).
// Todas las pantallas usan estos mismos nombres para que la historia cuadre.
// Los textos (fase, rol, ánimo) son getters: se leen en el idioma activo al
// usarlos. Los nombres propios no se traducen.
import type { Status } from "@/domain/vitals";
import { t } from "@/i18n";

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
  get phase() {
    return t("data.mission.phase");
  },
  /** Retraso de comunicación en un sentido, en minutos (FUENTES.md §4). */
  delayMinutes: 14,
} as const;

export const ME = "ana";

type Role = "specialist" | "cmo" | "commander" | "engineer";
type Mood = "shortOnRest" | "good";

const member = (
  id: string,
  name: string,
  role: Role,
  status: Status,
  mood: Mood,
): CrewMember => ({
  id,
  name,
  get role() {
    return t(`data.crew.roles.${role}`);
  },
  status,
  get mood() {
    return t(`data.crew.moods.${mood}`);
  },
});

export const CREW: CrewMember[] = [
  member("ana", "Ana", "specialist", "ambar", "shortOnRest"),
  member("luis", "Luis", "cmo", "verde", "good"),
  member("mei", "Mei", "commander", "verde", "good"),
  member("omar", "Omar", "engineer", "verde", "good"),
];

export const crewMember = (id: string) => CREW.find((c) => c.id === id)!;
