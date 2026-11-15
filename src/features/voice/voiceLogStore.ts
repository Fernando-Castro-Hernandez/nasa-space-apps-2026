// La bitácora confirmada de hoy, por perfil. Con ella Inicio y Tareas saben si
// el check-in del día ya se hizo y a qué hora ("Completado · 09:24").
// ponytail: solo este navegador; entre dispositivos llegará con D1 (HU-29).
import type { CheckInFields } from "@/api/contract";
import { parseFields } from "@/api/checkinFields";
import { persistedStore } from "@/data/persisted";

export type VoiceLog = {
  /** Día local en que se guardó, "2026-11-15". */
  day: string;
  /**
   * Momento en que se guardó, en milisegundos (`Date.now()`). Falta en las
   * bitácoras que guardó una versión anterior de la app.
   */
  savedAt?: number;
  transcript: string;
  fields: CheckInFields;
};

type Logs = Record<string, VoiceLog>;

export const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** Lo guardado puede venir de otra versión de la app: se valida al leer. */
export function parseLogs(raw: string | null): Logs {
  if (!raw) return {};
  try {
    const data = JSON.parse(raw) as Record<string, Partial<VoiceLog>>;
    const logs: Logs = {};
    for (const [profile, log] of Object.entries(data)) {
      const fields = parseFields(log?.fields);
      if (fields && typeof log.day === "string")
        logs[profile] = {
          day: log.day,
          ...(Number.isFinite(log.savedAt) ? { savedAt: log.savedAt } : {}),
          transcript: String(log.transcript ?? ""),
          fields,
        };
    }
    return logs;
  } catch {
    return {};
  }
}

const store = persistedStore<Logs>(
  "nostos.voice-log",
  parseLogs,
  JSON.stringify,
);

/** La bitácora de `profile` solo si es de `today`. */
export const logOfDay = (logs: Logs, profile: string, today: string) =>
  logs[profile]?.day === today ? logs[profile] : null;

export function saveVoiceLog(
  profile: string,
  log: Omit<VoiceLog, "day" | "savedAt">,
  now = new Date(),
) {
  store.set({
    ...store.get(),
    [profile]: { ...log, day: dayKey(now), savedAt: now.getTime() },
  });
}

/** La bitácora de hoy del perfil, o null si todavía no hace su check-in. */
export function useTodayVoiceLog(profile: string): VoiceLog | null {
  return logOfDay(store.use(), profile, dayKey(new Date()));
}

/** Reinicio del panel /demo (HU-28). */
export const resetVoiceLogs = store.clear;
