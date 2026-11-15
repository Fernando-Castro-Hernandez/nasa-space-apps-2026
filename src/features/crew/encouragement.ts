// "Enviar ánimo" (SISTEMA.md §9.4): un gesto entre compañeros, sin datos de
// salud. Quien lo recibe ve quién se lo mandó hoy; mañana empieza de cero.
// ponytail: solo este navegador (se ve al cambiar de perfil); entre
// dispositivos llegará con D1 (HU-29).
import { persistedStore } from "@/data/persisted";

/** Un ánimo enviado: de quién, a quién y qué día local ("2026-11-15"). */
export type Cheer = { from: string; to: string; day: string };

export const cheerDay = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** Lo guardado puede venir de otra versión: se valida al leer. */
export function parseCheers(raw: string | null): Cheer[] {
  try {
    const list: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    return list.filter(
      (c): c is Cheer =>
        typeof c?.from === "string" &&
        typeof c?.to === "string" &&
        typeof c?.day === "string",
    );
  } catch {
    return [];
  }
}

/** ¿`from` ya le mandó ánimo a `to` ese día? */
export const hasCheered = (
  cheers: Cheer[],
  from: string,
  to: string,
  day: string,
) => cheers.some((c) => c.from === from && c.to === to && c.day === day);

/** Quiénes le mandaron ánimo a `to` ese día, sin repetir. */
export const cheersFor = (cheers: Cheer[], to: string, day: string) => [
  ...new Set(
    cheers.filter((c) => c.to === to && c.day === day).map((c) => c.from),
  ),
];

/** Agrega el ánimo de hoy y tira los de días anteriores. Uno al día por par. */
export function withCheer(
  cheers: Cheer[],
  from: string,
  to: string,
  day: string,
): Cheer[] {
  const today = cheers.filter((c) => c.day === day);
  if (from === to || hasCheered(today, from, to, day)) return today;
  return [...today, { from, to, day }];
}

const store = persistedStore<Cheer[]>(
  "nostos.encouragement",
  parseCheers,
  JSON.stringify,
);

export const useCheers = store.use;

export function sendEncouragement(from: string, to: string, now = new Date()) {
  store.set(withCheer(store.get(), from, to, cheerDay(now)));
}

/** Reinicio de la demo (HU-28). */
export const resetEncouragement = store.clear;
