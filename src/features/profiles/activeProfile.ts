// Perfil activo (HU-01): sin contraseñas, como los perfiles de Netflix.
import { CREW, ME } from "@/data/crew";
import { persistedStore } from "@/data/persisted";

/** Un id guardado que ya no existe en la tripulación cae al perfil de la demo. */
export const resolveProfile = (raw: string | null) =>
  CREW.some((c) => c.id === raw) ? raw! : ME;

const store = persistedStore<string>("nostos.profile", resolveProfile, String);

export const useActiveProfile = store.use;

export function setActiveProfile(id: string) {
  if (CREW.some((c) => c.id === id)) store.set(id);
}

/** Vuelve al perfil de la demo (reinicio del panel /demo, HU-28). */
export const resetActiveProfile = store.clear;
