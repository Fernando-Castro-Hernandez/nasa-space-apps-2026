// Inicio del día (check-in de la mañana, /buenos-dias). Se hace una vez al día
// en este dispositivo; "Ahora no" lo pospone solo durante esta sesión, para
// que Inicio deje de mostrarlo sin marcarlo como hecho.
import { useSyncExternalStore } from "react";

const KEY = "nostos.day-start";
// En sessionStorage: se olvida al cerrar la app.
const SNOOZE_KEY = "nostos.day-start-snoozed";

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/** true si hoy todavía no se hizo el check-in de la mañana. */
export function needsDayStart() {
  try {
    return localStorage.getItem(KEY) !== dayKey();
  } catch {
    return true;
  }
}

export function finishDayStart() {
  try {
    localStorage.setItem(KEY, dayKey());
  } catch (error) {
    console.warn(
      "No se pudo recordar el inicio del día en este dispositivo.",
      error,
    );
  }
  notify();
}

/** true si hoy, en esta sesión, la persona eligió "Ahora no". */
export function isDayStartSnoozed() {
  try {
    return sessionStorage.getItem(SNOOZE_KEY) === dayKey();
  } catch {
    return false;
  }
}

/** "Ahora no": Inicio deja de mostrar el check-in hasta la próxima sesión. */
export function snoozeDayStart() {
  try {
    sessionStorage.setItem(SNOOZE_KEY, dayKey());
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

/** true si Inicio debe abrir con el check-in de la mañana. */
export const dayStartDue = () => needsDayStart() && !isDayStartSnoozed();

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
};

/** Igual que `dayStartDue`, y el componente se actualiza si cambia. */
export const useDayStartDue = () =>
  useSyncExternalStore(subscribe, dayStartDue, () => false);
