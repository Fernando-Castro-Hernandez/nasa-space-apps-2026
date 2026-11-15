import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test } from "vitest";
import { getLocale } from "@/i18n";
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

test("el perfil dice el día y la fase de la misión, sin una fila aparte", () => {
  render(<ReferenceSettingsScreen />);
  expect(
    screen.getByRole("button", { name: /Cambiar perfil/ }).textContent,
  ).toContain("Día 142");
  expect(screen.queryByText(/Información de la misión/)).toBeNull();
});

test("lo que aún no existe aparece como Próximamente, sin ser un control", () => {
  render(<ReferenceSettingsScreen />);
  expect(screen.getAllByText("Próximamente")).toHaveLength(3);
  for (const name of [/Mi Lunito/, /Recordatorio diario/])
    expect(screen.queryByRole("button", { name })).toBeNull();
  const notifications = screen.getByRole("switch", {
    name: "Notificaciones",
  }) as HTMLInputElement;
  expect(notifications.disabled).toBe(true);
  expect(notifications.checked).toBe(false);
});

test("el idioma se cambia aquí, con cada opción en su propio idioma", () => {
  render(<ReferenceSettingsScreen />);
  const english = screen.getByRole("button", { name: "English" });
  const spanish = screen.getByRole("button", { name: "Español" });
  expect(spanish.getAttribute("aria-pressed")).toBe("true");
  expect(english.getAttribute("aria-pressed")).toBe("false");

  fireEvent.click(english);
  expect(getLocale()).toBe("en");
  expect(localStorage.getItem("nostos.locale")).toBe("en");
});

test("Datos compartidos despliega la privacidad real", () => {
  render(<ReferenceSettingsScreen />);
  fireEvent.click(screen.getByRole("button", { name: /Datos compartidos/ }));
  expect(
    screen.getByText("Compartir mi estado con la tripulación"),
  ).toBeDefined();
});

test("los avisos generales de la app viven aquí", () => {
  render(<ReferenceSettingsScreen />);
  expect(screen.getByText("Prototipo, no es un diagnóstico.")).toBeDefined();
  expect(screen.getByText("Datos simulados para la demo.")).toBeDefined();
});

test("conserva los accesos de Tierra y de la demo", () => {
  render(<ReferenceSettingsScreen />);
  expect(href(/Consola de Tierra/)).toBe("/tierra");
  expect(href(/Panel de la demo/)).toBe("/demo");
  expect(href(/Repetir el check-in de hoy/)).toBe("/buenos-dias");
});
