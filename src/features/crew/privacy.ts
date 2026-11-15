// Privacidad de la Constelación (HU-30): cada persona decide si comparte su
// estado general, y un rojo nunca se publica (se avisa al CMO por el caso
// correspondiente, no por la Constelación). Quien no comparte y quien está en
// rojo se ven igual a propósito: así el rojo no se puede deducir.
import type { CrewMember } from "@/data/crew";
import { persistedStore } from "@/data/persisted";
import type { Status } from "@/domain/vitals";

/** id → false si esa persona dejó su estado privado. Por defecto se comparte. */
export type Shared = Record<string, boolean>;

export const parseShared = (raw: string | null): Shared => {
  try {
    return raw ? (JSON.parse(raw) as Shared) : {};
  } catch {
    return {};
  }
};

export const isShared = (shared: Shared, id: string) => shared[id] !== false;

/** Estado visible para los demás, o null si no se publica. */
export const publicStatus = (m: CrewMember, shared: Shared): Status | null =>
  isShared(shared, m.id) && m.status !== "rojo" ? m.status : null;

/** Quienes publican su estado: base del compañero del día. */
export const publicCrew = (crew: CrewMember[], shared: Shared) =>
  crew.filter((m) => publicStatus(m, shared) !== null);

export const isCommander = (m: CrewMember) => m.role === "Comandante";

const store = persistedStore<Shared>(
  "nostos.share",
  parseShared,
  JSON.stringify,
);

export const useShared = store.use;

export const setShared = (id: string, value: boolean) =>
  store.set({ ...store.get(), [id]: value });

/** Reinicio de la demo (HU-28). */
export const resetShared = store.clear;
