import { afterEach, expect, test } from "vitest";
import { setLocale } from "@/i18n";
import { metricParts, metricText } from "./metricFormat";

afterEach(() => window.localStorage.clear());

test("pulso y HRV llevan su unidad separada por un espacio", () => {
  expect(metricParts("bpm", 72, "lpm")).toEqual(["72", " lpm"]);
  expect(metricText("hrv", 45, "ms")).toBe("45 ms");
  expect(metricText("bpm", 70.5, "lpm")).toBe("70.5 lpm");
});

test("el oxígeno es un porcentaje con el formato del idioma", () => {
  expect(metricParts("spo2", 98, "%")).toEqual(["98", "%"]);
  expect(metricText("spo2", 97.8, "%")).toBe("97.8%");
  setLocale("en");
  expect(metricText("spo2", 90, "%")).toBe("90%");
  expect(metricText("bpm", 1200, "bpm")).toBe("1,200 bpm");
});
