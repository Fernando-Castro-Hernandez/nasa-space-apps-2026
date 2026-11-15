import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import type { DashboardMetric } from "@/data/lunitoDashboard";
import { MetricChart } from "./MetricChart";

afterEach(cleanup);

const metric = (week: number[]): DashboardMetric => ({
  key: "hrv",
  label: "Variabilidad cardíaca",
  unit: "ms",
  value: week.at(-1)!,
  status: "verde",
  week,
  month: [40, 42, 44, 45],
  domain: [30, 60],
});

const valueLabels = (container: HTMLElement) =>
  [...container.querySelectorAll("g[aria-hidden] text")].map(
    (node) => node.textContent,
  );

test("solo muestra la etiqueta del último registro por defecto", () => {
  const { container } = render(
    <MetricChart metric={metric([41, 46, 42, 45, 42, 51, 45])} period="week" />,
  );
  expect(valueLabels(container)).toEqual(["45"]);
});

test("la etiqueta sigue al punto señalado", () => {
  const { container } = render(
    <MetricChart metric={metric([41, 46, 42, 45, 42, 51, 45])} period="week" />,
  );
  fireEvent.mouseEnter(screen.getByRole("button", { name: "S: 51 ms" }));
  expect(valueLabels(container)).toEqual(["51"]);
});
