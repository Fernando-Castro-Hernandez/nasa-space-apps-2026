import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { finishDayStart } from "@/app/dayStart";
import { navigate } from "@/app/router";
import { ROUTES } from "@/app/routes";
import { App } from "./App";

// jsdom no tiene WebGL: la escena 3D se prueba a mano, aquí se reemplaza.
vi.mock("@/features/lunito/LunitoScene", () => ({ LunitoScene: () => null }));

// Sin `globals: true` en Vitest, Testing Library no desmonta sola.
afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
});

test("abre en Mi Lunito con la información del build", () => {
  render(<App />);

  expect(
    screen.getByRole("heading", { level: 1, name: "Mi Lunito" }),
  ).toBeDefined();
  expect(screen.getByTestId("build-info").textContent).toContain("Entorno:");
});

test.each(ROUTES.filter((r) => r.shell))(
  "la ruta $path muestra el título $title",
  ({ path, title }) => {
    render(<App />);
    act(() => navigate(path));

    expect(
      screen.getByRole("heading", { level: 1, name: title }),
    ).toBeDefined();
  },
);

test("el botón de emergencia está en todas las pantallas menos en la emergencia", () => {
  render(<App />);
  expect(screen.getByRole("link", { name: "Emergencia" })).toBeDefined();

  act(() => navigate("/emergencia"));
  expect(screen.queryByRole("link", { name: "Emergencia" })).toBeNull();
});

test("una ruta desconocida cae en Mi Lunito", () => {
  render(<App />);
  act(() => navigate("/no-existe"));

  expect(
    screen.getByRole("heading", { level: 1, name: "Mi Lunito" }),
  ).toBeDefined();
});

test("el inicio del día solo intercepta el Inicio de referencia", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { level: 1, name: "Mi Lunito" }),
  ).toBeDefined();

  act(() => navigate("/referencia"));
  expect(
    screen.getByRole("heading", { name: /Qué gusto verte/ }),
  ).toBeDefined();
});

test("con el día ya iniciado, /referencia abre Así estás hoy", () => {
  finishDayStart();
  render(<App />);
  act(() => navigate("/referencia"));

  expect(screen.getByRole("heading", { name: "Así estás hoy" })).toBeDefined();
});
