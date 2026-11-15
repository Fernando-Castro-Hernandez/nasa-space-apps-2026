import { afterEach, expect, test } from "vitest";
import { EMPTY_FIELDS } from "@/api/checkinFields";
import {
  dayKey,
  logOfDay,
  parseLogs,
  resetVoiceLogs,
  saveVoiceLog,
} from "./voiceLogStore";

const fields = { ...EMPTY_FIELDS, mood: 3, stress: 2 };

afterEach(() => window.localStorage.clear());

test("el día se guarda en hora local con ceros", () => {
  expect(dayKey(new Date(2026, 10, 5, 23, 59))).toBe("2026-11-05");
});

test("la bitácora de ayer no cuenta como check-in de hoy", () => {
  const logs = { ana: { day: "2026-11-14", transcript: "dormí bien", fields } };
  expect(logOfDay(logs, "ana", "2026-11-14")?.transcript).toBe("dormí bien");
  expect(logOfDay(logs, "ana", "2026-11-15")).toBeNull();
  expect(logOfDay(logs, "luis", "2026-11-14")).toBeNull();
});

test("descarta lo guardado que ya no cumple el contrato", () => {
  const raw = JSON.stringify({
    ana: { day: "2026-11-15", transcript: "hola", fields },
    luis: { day: "2026-11-15", transcript: "x", fields: { mood: 9 } },
    mei: { transcript: "sin día", fields },
  });
  expect(Object.keys(parseLogs(raw))).toEqual(["ana"]);
  expect(parseLogs("no es json")).toEqual({});
  expect(parseLogs(null)).toEqual({});
});

test("guarda la hora del check-in para mostrar 'Completado · 09:24'", () => {
  const now = new Date(2026, 10, 15, 9, 24);
  saveVoiceLog("ana", { transcript: "dormí bien", fields }, now);
  const logs = parseLogs(window.localStorage.getItem("nostos.voice-log"));
  expect(logs.ana).toEqual({
    day: "2026-11-15",
    savedAt: now.getTime(),
    transcript: "dormí bien",
    fields,
  });
  resetVoiceLogs();
  expect(window.localStorage.getItem("nostos.voice-log")).toBeNull();
});

test("una bitácora de una versión anterior, sin hora, sigue contando", () => {
  const raw = JSON.stringify({
    ana: { day: "2026-11-15", transcript: "hola", fields },
    luis: { day: "2026-11-15", savedAt: "09:24", transcript: "x", fields },
  });
  const logs = parseLogs(raw);
  expect(logs.ana).toEqual({ day: "2026-11-15", transcript: "hola", fields });
  expect(logs.luis?.savedAt).toBeUndefined();
});
