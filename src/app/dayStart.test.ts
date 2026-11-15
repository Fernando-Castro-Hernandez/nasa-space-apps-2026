import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { dayKey, finishDayStart, needsDayStart } from "./dayStart";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 10, 15, 12));
  localStorage.clear();
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
});

test("un fallo al guardar no impide continuar y se informa", () => {
  const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Almacenamiento lleno");
  });
  expect(() => finishDayStart()).not.toThrow();
  expect(warning).toHaveBeenCalledOnce();
});
