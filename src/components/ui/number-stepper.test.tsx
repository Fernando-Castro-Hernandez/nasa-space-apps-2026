import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { NumberStepper, stepValue } from "./number-stepper";

afterEach(cleanup);

const hours = { min: 0, max: 24, step: 0.5, start: 7 };

test("el primer toque empieza en el valor inicial, no en el mínimo", () => {
  expect(stepValue(null, 1, hours)).toBe(7);
  expect(stepValue(null, -1, hours)).toBe(7);
  expect(stepValue(null, 1, { min: 1, max: 5 })).toBe(1);
});

test("sube y baja de paso en paso sin salirse de los límites", () => {
  expect(stepValue(7, 1, hours)).toBe(7.5);
  expect(stepValue(7, -1, hours)).toBe(6.5);
  expect(stepValue(24, 1, hours)).toBe(24);
  expect(stepValue(0, -1, hours)).toBe(0);
  expect(stepValue(0.1 + 0.2, 1, { min: 0, max: 1, step: 0.1 })).toBeCloseTo(
    0.4,
  );
});

test("se maneja con dos botones y dice el valor con su unidad", () => {
  const onChange = vi.fn();
  render(
    <NumberStepper
      value={5}
      onChange={onChange}
      {...hours}
      label="Horas de sueño"
      unit="h"
    />,
  );
  expect(screen.getByRole("group", { name: "Horas de sueño" })).toBeDefined();
  expect(screen.getByRole("status").textContent).toBe("5h");

  fireEvent.click(
    screen.getByRole("button", { name: "Aumentar Horas de sueño" }),
  );
  expect(onChange).toHaveBeenLastCalledWith(5.5);
  fireEvent.click(
    screen.getByRole("button", { name: "Reducir Horas de sueño" }),
  );
  expect(onChange).toHaveBeenLastCalledWith(4.5);
});

test("sin valor muestra una raya y en el límite apaga el botón", () => {
  const { rerender } = render(
    <NumberStepper value={null} onChange={() => {}} {...hours} label="Sueño" />,
  );
  expect(screen.getByRole("status").textContent).toBe("–");

  rerender(
    <NumberStepper value={24} onChange={() => {}} {...hours} label="Sueño" />,
  );
  expect(
    (
      screen.getByRole("button", {
        name: "Aumentar Sueño",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
});
