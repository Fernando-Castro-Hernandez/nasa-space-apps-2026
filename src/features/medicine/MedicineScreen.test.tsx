import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test } from "vitest";
import { setCo2State } from "@/features/demo/demoStore";
import { setActiveProfile } from "@/features/profiles/activeProfile";
import { MedicineScreen } from "./MedicineScreen";

beforeEach(() => {
  localStorage.clear();
  setActiveProfile("luis");
});
afterEach(cleanup);

const pick = (name: RegExp) =>
  fireEvent.click(screen.getByRole("button", { name }));

/** Responde "No" a todas las preguntas de sí o no del paso a la vista. */
const answerAllNo = () => {
  for (const no of screen.getAllByRole("button", { name: "No" }))
    fireEvent.click(no);
};

test("los síntomas sin protocolo lo dicen antes de entrar", () => {
  render(<MedicineScreen />);
  expect(
    screen.getByRole("button", { name: /Dolor de cabeza/ }).textContent,
  ).toContain("Guía paso a paso");
  for (const name of [/Náusea/, /Congestión/, /espalda/, /visión/])
    expect(screen.getByRole("button", { name }).textContent).toContain(
      "Sin protocolo",
    );
});

test("sin protocolo no hay callejón: se puede volver o ir a Emergencia con la persona activa", () => {
  render(<MedicineScreen />);
  pick(/Náusea/);
  expect(
    screen.getByText(/Este protocolo aún no tiene fuente cargada/),
  ).toBeDefined();
  expect(
    screen
      .getByRole("link", { name: /¿Es urgente\? Ir a Emergencia/ })
      .getAttribute("href"),
  ).toBe("/emergencia?quien=luis");
  pick(/Volver a síntomas/);
  expect(screen.getByRole("button", { name: /Náusea/ })).toBeDefined();
});

test("una búsqueda sin resultados ofrece borrarla o ir a Emergencia", () => {
  render(<MedicineScreen />);
  fireEvent.change(screen.getByLabelText("Buscar síntoma"), {
    target: { value: "zzz" },
  });
  expect(screen.getByText(/No encontramos ese síntoma/)).toBeDefined();
  expect(
    screen.getByRole("link", { name: /Ir a Emergencia/ }).getAttribute("href"),
  ).toBe("/emergencia?quien=luis");
  // Se borra desde el campo (la "x") o desde el mensaje: las dos sirven.
  const clear = screen.getAllByRole("button", { name: "Borrar la búsqueda" });
  expect(clear).toHaveLength(2);
  fireEvent.click(clear[1]!);
  expect(screen.getByRole("button", { name: /Dolor de cabeza/ })).toBeDefined();
  expect(
    screen.queryByRole("button", { name: "Borrar la búsqueda" }),
  ).toBeNull();
});

const next = () =>
  screen.getByRole("button", { name: "Siguiente" }) as HTMLButtonElement;

test("el asistente dice cuánto falta y solo avanza con todo respondido", () => {
  render(<MedicineScreen />);
  pick(/Dolor de cabeza/);
  expect(screen.getByText("Paso 1 de 3 · Descarte")).toBeDefined();
  expect(screen.getByText("0 de 6 respondidas")).toBeDefined();
  expect(next().disabled).toBe(true);
  answerAllNo();
  expect(screen.getByText("6 de 6 respondidas")).toBeDefined();
  fireEvent.click(next());

  expect(screen.getByText("Paso 2 de 3 · Historial")).toBeDefined();
  // Los días se eligen con − y +, sin teclado.
  pick(/Aumentar ¿Cuántos días tomaste analgésicos/);
  expect(screen.queryByRole("spinbutton")).toBeNull();
});

test("un sí en el descarte lleva al cirujano de vuelo con la persona elegida", () => {
  render(<MedicineScreen />);
  pick(/Dolor de cabeza/);
  fireEvent.click(screen.getAllByRole("button", { name: "Sí" })[0]!);
  pick(/Ver qué hacer/);
  // El título dice qué hacer; el botón, a dónde lleva.
  expect(screen.getByText("Contacta al cirujano de vuelo")).toBeDefined();
  expect(
    screen.getByRole("link", { name: "Ir a Emergencia" }).getAttribute("href"),
  ).toBe("/emergencia?quien=luis");
});

const finishWithAllNo = () => {
  pick(/Dolor de cabeza/);
  for (let step = 0; step < 3; step++) {
    answerAllNo();
    pick(/Siguiente/);
  }
};

test("el aviso de CO2 solo sale cuando la demo tiene el CO2 alto", () => {
  const { unmount } = render(<MedicineScreen />);
  finishWithAllNo();
  expect(screen.getByText("Puedes cuidarte tú")).toBeDefined();
  expect(screen.queryByText(/El CO2 de la cabina está alto/)).toBeNull();
  unmount();

  setCo2State("alto");
  render(<MedicineScreen />);
  finishWithAllNo();
  expect(screen.getByText(/El CO2 de la cabina está alto/)).toBeDefined();
});

test("un solo aviso de que no es un diagnóstico", () => {
  render(<MedicineScreen />);
  expect(screen.getAllByText(/no es un diagnóstico/i)).toHaveLength(1);
});
