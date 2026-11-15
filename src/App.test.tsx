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

test.each(ROUTES.filter((r) => r.shell))(
  "la ruta $path muestra el título $title y la información del build",
  ({ path, title }) => {
    render(<App />);
    act(() => navigate(path));

    expect(
      screen.getByRole("heading", { level: 1, name: title }),
    ).toBeDefined();
    expect(screen.getByTestId("build-info").textContent).toContain("Entorno:");
  },
);

test("el botón de emergencia está en todas las pantallas menos en la emergencia", () => {
  render(<App />);
  expect(screen.getByRole("link", { name: "Emergencia" })).toBeDefined();

  act(() => navigate("/emergencia"));
  expect(screen.queryByRole("link", { name: "Emergencia" })).toBeNull();
});

test("un día nuevo empieza con el saludo antes de Inicio", () => {
  render(<App />);

  expect(
    screen.getByRole("heading", { name: /Qué gusto verte/ }),
  ).toBeDefined();
});

test("con el día ya iniciado, Inicio abre Así estás hoy", () => {
  finishDayStart();
  render(<App />);

  expect(screen.getByRole("heading", { name: "Así estás hoy" })).toBeDefined();
});

test.each([
  ["/tripulacion", "Tu tripulación", "Equipo"],
  ["/tareas", "Hoy", "Tareas"],
  ["/ajustes", "Configuración", "Ajustes"],
])("%s abre %s con su pestaña activa", (path, heading, tab) => {
  render(<App />);
  act(() => navigate(path));

  expect(
    screen.getByRole("heading", { level: 1, name: heading }),
  ).toBeDefined();
  expect(
    screen.getByRole("link", { name: tab }).getAttribute("aria-current"),
  ).toBe("page");
});

test("una ruta desconocida cae en Inicio", () => {
  finishDayStart();
  render(<App />);
  act(() => navigate("/no-existe"));

  expect(screen.getByRole("heading", { name: "Así estás hoy" })).toBeDefined();
});
