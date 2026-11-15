import { expect, test } from "vitest";
import { initialMetric, statusHref } from "./initialMetric";

test("la burbuja que se tocó elige el indicador de Mi estado", () => {
  expect(initialMetric(new URL(statusHref("hrv"), "http://x").search)).toBe(
    "hrv",
  );
  expect(initialMetric("?m=spo2")).toBe("spo2");
});

test("sin indicador o con uno desconocido, abre el pulso", () => {
  expect(initialMetric("")).toBe("bpm");
  expect(initialMetric("?m=co2")).toBe("bpm");
});
