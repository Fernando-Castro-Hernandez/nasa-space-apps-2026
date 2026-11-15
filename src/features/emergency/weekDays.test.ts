import { afterEach, expect, test } from "vitest";
import { setLocale } from "@/i18n";
import { weekdayShort, withWeekdays } from "./weekDays";

afterEach(() => window.localStorage.clear());

const week = [51, 49, 47, 44, 42, 40, 52].map((value) => ({ day: "?", value }));

test("cada día de la gráfica tiene una etiqueta distinta, de lunes a domingo", () => {
  setLocale("en");
  const days = withWeekdays(week).map((d) => d.day);
  expect(days).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  expect(new Set(days).size).toBe(7);
});

test("en español, los días van abreviados y conservan sus valores", () => {
  setLocale("es");
  expect(weekdayShort(0)).toMatch(/^lun/);
  expect(weekdayShort(6)).toMatch(/^dom/);
  expect(withWeekdays(week).map((d) => d.value)).toEqual(
    week.map((d) => d.value),
  );
});
