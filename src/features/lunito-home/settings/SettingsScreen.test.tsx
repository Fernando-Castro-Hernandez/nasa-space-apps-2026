import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test } from "vitest";
import { ReferenceSettingsScreen } from "./SettingsScreen";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

const href = (name: RegExp) =>
  screen.getByRole("link", { name }).getAttribute("href");

test("abrir la tarjeta de perfil muestra el selector y cambiar a Mei actualiza el nombre", () => {
  render(<ReferenceSettingsScreen />);
  expect(screen.queryByRole("button", { name: /Meis*Comandante/ })).toBeNull();
  const card = screen.getByRole("button", { name: /Cambiar perfil/ });
  expect(card.textContent).toContain("Ana");
  fireEvent.click(card);
  expect(card.getAttribute("aria-expanded")).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: /Meis*Comandante/ }));
  expect(
    screen.getByRole("button", { name: /Cambiar perfil/ }).textContent,
  ).toContain("Mei");
});

test("lo que aún no existe aparece como Próximamente y deshabilitado", () => {
  render(<ReferenceSettingsScreen />);
  expect(screen.getAllByText("Próximamente")).toHaveLength(3);
  for (const name of [/Mi Lunito/, /Recordatorio diario/])
    expect(
      (screen.getByRole("button", { name }) as HTMLButtonElement).disabled,
    ).toBe(true);
  const notifications = screen.getByRole("switch", {
    name: "Notificaciones",
  }) as HTMLInputElement;
  expect(notifications.disabled).toBe(true);
  expect(notifications.checked).toBe(false);
});

test("Datos compartidos despliega la privacidad real", () => {
  render(<ReferenceSettingsScreen />);
  fireEvent.click(screen.getByRole("button", { name: /Datos compartidos/ }));
  expect(
    screen.getByText("Compartir mi estado con la tripulación"),
  ).toBeDefined();
});

test("conserva los accesos de la misión", () => {
  render(<ReferenceSettingsScreen />);
  expect(href(/Consola de Tierra/)).toBe("/tierra");
  expect(href(/Panel de la demo/)).toBe("/demo");
  expect(href(/Repetir el inicio del día/)).toBe("/buenos-dias");
});
