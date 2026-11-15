import {
  act,
  cleanup,
  render,
  screen,
  fireEvent,
} from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { App } from "@/App";
import { setActiveProfile } from "@/features/profiles/activeProfile";

vi.mock("@/features/lunito/LunitoScene", () => ({ LunitoScene: () => null }));
afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
});

test("una tarea marcada no se comparte con otro perfil", () => {
  render(<App />);
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Respiración guiada · 5 min" }),
  );
  act(() => setActiveProfile("mei"));
  expect(
    (
      screen.getByRole("checkbox", {
        name: "Respiración guiada · 5 min",
      }) as HTMLInputElement
    ).checked,
  ).toBe(false);
});

test("Órbita conecta las cuatro áreas y conserva el acceso al check-in", () => {
  render(<App />);
  const nav = screen.getByRole("navigation", { name: "Principal" });
  expect(nav.textContent).toContain("Inicio");
  expect(nav.textContent).toContain("Equipo");
  expect(nav.textContent).toContain("Tareas");
  expect(nav.textContent).toContain("Ajustes");
  expect(
    screen.getByRole("link", { name: /Hacer check-in/ }).getAttribute("href"),
  ).toBe("/check-in");
  fireEvent.click(screen.getByRole("link", { name: "Ajustes" }));
  expect(
    screen.getByText("Compartir mi estado con la tripulación"),
  ).toBeDefined();
});

test("las tareas marcadas en Inicio siguen marcadas en Tareas", () => {
  render(<App />);
  const task = screen.getByRole("checkbox", {
    name: "Respiración guiada · 5 min",
  });
  fireEvent.click(task);
  fireEvent.click(screen.getByRole("link", { name: "Tareas" }));
  expect(
    (
      screen.getByRole("checkbox", {
        name: "Respiración guiada · 5 min",
      }) as HTMLInputElement
    ).checked,
  ).toBe(true);
});
