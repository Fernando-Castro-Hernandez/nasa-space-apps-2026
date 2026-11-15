import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test } from "vitest";
import { setShared } from "@/features/crew/privacy";
import { setActiveProfile } from "@/features/profiles/activeProfile";
import { TeamScreen } from "./TeamScreen";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

test("no muestra el perfil activo", () => {
  setActiveProfile("ana");
  render(<TeamScreen />);
  expect(screen.queryByRole("button", { name: "Ver a Ana" })).toBeNull();
  expect(screen.getByRole("button", { name: "Ver a Luis" })).toBeDefined();
});

test("quien no comparte muestra Sin compartir y no su estado", () => {
  setActiveProfile("ana");
  setShared("luis", false);
  render(<TeamScreen />);
  fireEvent.click(screen.getByRole("button", { name: "Ver a Luis" }));
  expect(screen.getByText("Luis · Sin compartir")).toBeDefined();
  expect(screen.getByText("No comparte su estado")).toBeDefined();
  expect(screen.queryByText(/Luis · Bien/)).toBeNull();
});

test("tocar abre la hoja; Cerrar y Escape la cierran", () => {
  setActiveProfile("ana");
  render(<TeamScreen />);
  expect(screen.getByText(/Compañero de hoy/)).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Ver a Luis" }));
  expect(screen.getByText("Luis · Bien")).toBeDefined();
  expect(screen.getByText("Estado compartido")).toBeDefined();
  expect(screen.queryByText(/Compañero de hoy/)).toBeNull();
  const cheer = screen.getByRole("button", { name: "Enviar ánimo" });
  expect((cheer as HTMLButtonElement).disabled).toBe(true);

  fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
  expect(screen.queryByText("Luis · Bien")).toBeNull();

  fireEvent.click(screen.getByRole("button", { name: "Ver a Mei" }));
  expect(screen.getByText("Mei · Bien")).toBeDefined();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByText("Mei · Bien")).toBeNull();
});

test("todos ven la autonomía; solo el comandante ve el balanceador", () => {
  const { unmount } = render(<TeamScreen />);
  expect(screen.getByText("Autonomía de la tripulación")).toBeDefined();
  expect(screen.queryByText("Balanceador de carga")).toBeNull();
  unmount();

  setActiveProfile("mei");
  render(<TeamScreen />);
  expect(screen.getByText("Autonomía de la tripulación")).toBeDefined();
  expect(screen.getByText("Balanceador de carga")).toBeDefined();
});
