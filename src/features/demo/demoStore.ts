// Eventos simulados de la demo (HU-28, SISTEMA.md §11, paso 4). El panel /demo
// en un dispositivo mueve la app abierta en otra pestaña del mismo navegador.
import { persistedStore } from "@/data/persisted";
import { SAMPLE_HAZARD_CASES, type Case } from "@/features/crew/autonomy";

export const CO2_MODULE = "Módulo de laboratorio";

/** normal → alto (evento) → resuelto (la tripulación lo resolvió a bordo). */
export type Co2State = "normal" | "alto" | "resuelto";

export const parseCo2State = (raw: string | null): Co2State =>
  raw === "alto" || raw === "resuelto" ? raw : "normal";

const store = persistedStore<Co2State>("nostos.demo", parseCo2State, String);

export const useCo2State = store.use;

export const setCo2State = (state: Co2State) =>
  state === "normal" ? store.clear() : store.set(state);

/** Casos de la misión con el evento de CO2: abierto no cuenta; resuelto suma. */
export const casesWithCo2 = (state: Co2State): Case[] =>
  state === "normal"
    ? SAMPLE_HAZARD_CASES
    : [
        ...SAMPLE_HAZARD_CASES,
        {
          hazard: "E",
          outcome: state === "alto" ? "abierto" : "resuelto a bordo",
        },
      ];
