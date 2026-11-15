// Eventos simulados de la demo (HU-28, SISTEMA.md §11). El panel /demo en un
// dispositivo mueve la app abierta en otra pestaña del mismo navegador.
import { persistedStore } from "@/data/persisted";

export const CO2_MODULE = "Módulo de laboratorio";

export const parseCo2Raised = (raw: string | null) => raw === "co2";

const store = persistedStore<boolean>(
  "nostos.demo",
  parseCo2Raised,
  () => "co2",
);

export const useCo2Raised = store.use;

export const setCo2Raised = (raised: boolean) =>
  raised ? store.set(true) : store.clear();
