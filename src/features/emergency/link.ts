// Cuentas del retraso de comunicación Tierra–nave y formato de horas.
// El retraso es de un tramo (FUENTES.md §4); ida y vuelta es el doble.
import { formatDate, t } from "@/i18n";

const MINUTE = 60_000;

/** Hora de la nave, "14:03": 24 h en los dos idiomas, como en una misión. */
export const formatTime = (ms: number) =>
  formatDate(ms, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

/** Cuándo llega a destino algo enviado en `sentAt`. */
export const arrivesAt = (sentAt: number, delayMinutes: number) =>
  sentAt + delayMinutes * MINUTE;

/** Respuesta estimada: el aviso llega a Tierra y la respuesta vuelve. */
export const responseEta = (sentAt: number, delayMinutes: number) =>
  sentAt + 2 * delayMinutes * MINUTE;

/** Cuenta regresiva "mm:ss"; "00:00" si ya pasó. */
export function countdown(target: number, now: number) {
  const left = Math.max(0, Math.round((target - now) / 1000));
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

/** Estado de un mensaje en el enlace, en palabras. */
export function linkLabel(sentAt: number, delayMinutes: number, now: number) {
  const time = formatTime(arrivesAt(sentAt, delayMinutes));
  return now >= arrivesAt(sentAt, delayMinutes)
    ? t("ground.arrival.arrived", { time })
    : t("ground.arrival.inTransit", { time });
}
