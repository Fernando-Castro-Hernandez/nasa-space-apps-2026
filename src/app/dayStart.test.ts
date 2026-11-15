import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { setActiveProfile } from "@/features/profiles/activeProfile";
import { saveVoiceLog } from "@/features/voice/voiceLogStore";
import {
  dayKey,
  dayStartDue,
  finishDayStart,
  isDayStartSnoozed,
  needsDayStart,
  resetDayStart,
  snoozeDayStart,
} from "./dayStart";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 10, 15, 12));
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

test.each([
  [new Date(2026, 0, 1), "2026-1-1"],
  [new Date(2026, 11, 31), "2026-12-31"],
])("usa la fecha local para la clave del día %s", (date, expected) => {
  expect(dayKey(date)).toBe(expected);
});

test("solo omite el saludo si se completó hoy en este dispositivo", () => {
  expect(needsDayStart()).toBe(true);
  finishDayStart();
  expect(needsDayStart()).toBe(false);
  vi.setSystemTime(new Date(2026, 10, 16, 0));
  expect(needsDayStart()).toBe(true);
});

test("sin lectura de almacenamiento conserva el inicio del día", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("Almacenamiento bloqueado");
  });
  expect(needsDayStart()).toBe(true);
  expect(isDayStartSnoozed()).toBe(false);
});

test("un fallo al guardar no impide continuar y se informa", () => {
  const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Almacenamiento lleno");
  });
  expect(() => finishDayStart()).not.toThrow();
  expect(warning).toHaveBeenCalledOnce();
  expect(() => snoozeDayStart()).not.toThrow();
});

test("'Ahora no' lo pospone en esta sesión sin darlo por hecho", () => {
  expect(dayStartDue()).toBe(true);
  snoozeDayStart();
  expect(isDayStartSnoozed()).toBe(true);
  expect(dayStartDue()).toBe(false);
  // La tarea del check-in sigue pendiente.
  expect(needsDayStart()).toBe(true);
});

test("la posposición vale solo para el día en que se pidió", () => {
  snoozeDayStart();
  vi.setSystemTime(new Date(2026, 10, 16, 8));
  expect(dayStartDue()).toBe(true);
});

const fields = {
  sleepHours: 7,
  sleepQuality: "buena" as const,
  mood: 4,
  stress: 2,
  symptoms: [],
};

test("terminar el check-in es de cada perfil: Luis tiene el suyo aunque Ana ya hizo el de ella", () => {
  finishDayStart("ana");
  expect(needsDayStart("ana")).toBe(false);
  expect(needsDayStart("luis")).toBe(true);
  expect(dayStartDue("luis")).toBe(true);
});

test("sin argumento, cuenta el perfil activo", () => {
  setActiveProfile("mei");
  finishDayStart();
  expect(needsDayStart("mei")).toBe(false);
  expect(needsDayStart("ana")).toBe(true);
  setActiveProfile("ana");
  expect(dayStartDue()).toBe(true);
});

test("con la bitácora de hoy guardada ya no está pendiente, aunque no se haya terminado", () => {
  saveVoiceLog("ana", { transcript: "Dormí bien", fields });
  expect(dayStartDue("ana")).toBe(false);
  expect(dayStartDue("luis")).toBe(true);
  // La bitácora de ayer no cuenta.
  vi.setSystemTime(new Date(2026, 10, 16, 8));
  expect(dayStartDue("ana")).toBe(true);
});

test("posponer también es de cada perfil", () => {
  snoozeDayStart("ana");
  expect(isDayStartSnoozed("ana")).toBe(true);
  expect(isDayStartSnoozed("luis")).toBe(false);
  expect(dayStartDue("luis")).toBe(true);
});

test("el formato viejo (una fecha suelta) vale como terminado hoy en este dispositivo", () => {
  localStorage.setItem("nostos.day-start", dayKey());
  for (const profile of ["ana", "luis", "mei", "omar"])
    expect(needsDayStart(profile)).toBe(false);
  // Al guardar con el formato nuevo no se pierde lo que ya decía el viejo.
  finishDayStart("ana");
  expect(needsDayStart("luis")).toBe(false);
  // Una fecha vieja de otro día no cuenta.
  localStorage.setItem("nostos.day-start", "2026-11-14");
  expect(needsDayStart("ana")).toBe(true);
});

test("el reinicio de la demo olvida el check-in y su posposición", () => {
  finishDayStart();
  snoozeDayStart();
  resetDayStart();
  expect(needsDayStart()).toBe(true);
  expect(isDayStartSnoozed()).toBe(false);
  expect(dayStartDue()).toBe(true);
});
