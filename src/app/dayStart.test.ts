import { afterEach, beforeEach, expect, test, vi } from "vitest";
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

test("el reinicio de la demo olvida el check-in y su posposición", () => {
  finishDayStart();
  snoozeDayStart();
  resetDayStart();
  expect(needsDayStart()).toBe(true);
  expect(isDayStartSnoozed()).toBe(false);
  expect(dayStartDue()).toBe(true);
});
