// Inicio del día (check-in de la mañana, /buenos-dias). Una sola regla para
// toda la app: está pendiente para un perfil si ese perfil no tiene bitácora
// de hoy, no lo pospuso en esta sesión ("Ahora no") y no lo terminó hoy. Las
// marcas son por perfil: tras el check-in de Ana, Luis tiene el suyo.
import { useSyncExternalStore } from "react";
import {
  activeProfile,
  useActiveProfile,
} from "@/features/profiles/activeProfile";
import {
  todayVoiceLog,
  useTodayVoiceLog,
} from "@/features/voice/voiceLogStore";

// En localStorage: perfil → día en que terminó.
const KEY = "nostos.day-start";
// En sessionStorage: se olvida al cerrar la app.
const SNOOZE_KEY = "nostos.day-start-snoozed";

/** Perfil → día. El formato viejo era una fecha suelta, válida para todo el
 *  dispositivo; se lee como la marca de `DEVICE`. Las pruebas E2E y varios
 *  scripts la usan para saltarse el check-in. */
type Marks = Record<string, string>;
const DEVICE = "*";

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function parseMarks(raw: string | null): Marks {
  if (!raw) return {};
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data === "object" && data !== null && !Array.isArray(data))
      return Object.fromEntries(
        Object.entries(data).filter(([, day]) => typeof day === "string"),
      );
  } catch {
    // No es JSON: es el formato viejo.
  }
  return { [DEVICE]: raw };
}

const read = (storage: () => Storage, key: string): Marks => {
  try {
    return parseMarks(storage().getItem(key));
  } catch {
    return {};
  }
};

/** Marca `profile` con el día de hoy. Lanza si no se puede guardar. */
function mark(storage: () => Storage, key: string, profile: string) {
  const marks = { ...read(storage, key), [profile]: dayKey() };
  storage().setItem(key, JSON.stringify(marks));
}

const markedToday = (marks: Marks, profile: string) =>
  marks[profile] === dayKey() || marks[DEVICE] === dayKey();

const local = () => localStorage;
const session = () => sessionStorage;

/** true si `profile` (por defecto, el activo) no terminó hoy el check-in. */
export function needsDayStart(profile = activeProfile()) {
  return !markedToday(read(local, KEY), profile);
}

export function finishDayStart(profile = activeProfile()) {
  try {
    mark(local, KEY, profile);
  } catch (error) {
    console.warn(
      "No se pudo recordar el inicio del día en este dispositivo.",
      error,
    );
  }
  notify();
}

/** true si hoy, en esta sesión, `profile` eligió "Ahora no". */
export function isDayStartSnoozed(profile = activeProfile()) {
  return markedToday(read(session, SNOOZE_KEY), profile);
}

/** "Ahora no": Inicio deja de mostrar el check-in hasta la próxima sesión. */
export function snoozeDayStart(profile = activeProfile()) {
  try {
    mark(session, SNOOZE_KEY, profile);
  } catch {
    // Sin almacenamiento de sesión: el check-in vuelve a aparecer en Inicio.
  }
  notify();
}

/** Olvida el check-in de hoy y su posposición (reinicio de la demo). */
export function resetDayStart() {
  try {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(SNOOZE_KEY);
  } catch {
    // Sin almacenamiento no hay nada guardado que borrar.
  }
  notify();
}

/** Marcas de hoy: ni terminado ni pospuesto. Falta mirar la bitácora. */
const unmarked = (profile: string) =>
  needsDayStart(profile) && !isDayStartSnoozed(profile);

/** true si Inicio debe abrir con el check-in de la mañana para `profile`. */
export const dayStartDue = (profile = activeProfile()) =>
  unmarked(profile) && todayVoiceLog(profile) === null;

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
};

/** Igual que `dayStartDue` para el perfil activo, y el componente se
 *  actualiza si cambia el perfil, su bitácora o las marcas. */
export function useDayStartDue() {
  const profile = useActiveProfile();
  const logged = useTodayVoiceLog(profile) !== null;
  const pending = useSyncExternalStore(
    subscribe,
    () => unmarked(profile),
    () => false,
  );
  return pending && !logged;
}
