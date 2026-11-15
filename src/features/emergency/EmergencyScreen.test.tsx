import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { setLocale } from "@/i18n";
import { dictationSample, openCase } from "./caseLogic";
import { saveCase } from "./caseStore";
import { EmergencyScreen } from "./EmergencyScreen";

// jsdom no tiene micrófono ni Worker: el dictado usa la nota de muestra.
vi.mock("@/api/client", async (original) => {
  const actual = await original<typeof import("@/api/client")>();
  return {
    ...actual,
    api: { ...actual.api, aiAvailable: vi.fn(async () => false) },
  };
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
});

const button = (name: string | RegExp) => screen.getByRole("button", { name });
const storedCase = () => JSON.parse(localStorage.getItem("nostos.case")!);
const openButton = () => screen.getByRole("button", { name: /elige|Abrir/i });

/** Abre el caso de Luis desde el formulario. */
function openLuisCase() {
  render(<EmergencyScreen />);
  fireEvent.click(button(/^Luis/));
  fireEvent.click(button("Se desmayó"));
  fireEvent.click(button("Abrir emergencia · Luis"));
}

test("el botón principal dice siempre qué falta para abrir el caso", () => {
  render(<EmergencyScreen />);
  expect(openButton().textContent).toBe("Elige a la persona y qué pasó");
  expect(openButton().hasAttribute("disabled")).toBe(true);
  fireEvent.click(button(/^Luis/));
  expect(openButton().textContent).toBe("Ahora elige qué pasó");
  fireEvent.click(button("Se desmayó"));
  expect(openButton().textContent).toBe("Abrir emergencia · Luis");
  expect(openButton().hasAttribute("disabled")).toBe(false);
});

test("con ?quien= la persona llega elegida", () => {
  window.history.replaceState(null, "", "/emergencia?quien=mei");
  render(<EmergencyScreen />);

  expect(button(/^Mei/).getAttribute("aria-pressed")).toBe("true");
  expect(button(/^Ana/).getAttribute("aria-pressed")).toBe("false");
  expect(screen.getByText("Ahora elige qué pasó")).toBeDefined();
});

test("Cancelar no abre ningún caso", () => {
  // jsdom no desplaza la ventana al navegar.
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  window.history.replaceState(null, "", "/emergencia");
  render(<EmergencyScreen />);
  fireEvent.click(button(/^Ana/));
  fireEvent.click(button("Cancelar"));

  expect(localStorage.getItem("nostos.case")).toBeNull();
  expect(window.location.pathname).toBe("/");
});

test("abrir el caso muestra quién, qué y la cuenta regresiva con su etiqueta", () => {
  openLuisCase();

  expect(
    screen.getByRole("heading", { level: 2, name: "Luis · Se desmayó" }),
  ).toBeDefined();
  expect(screen.getByText("Respuesta de Tierra en")).toBeDefined();
  expect(screen.getByText("28:00")).toBeDefined();
  expect(storedCase().what).toBe("fainted");
});

test("al llegar a cero, la cuenta regresiva dice qué hacer", () => {
  saveCase(openCase("luis", "Luis", "fainted", Date.now() - 29 * 60_000));
  render(<EmergencyScreen />);

  expect(screen.queryByText("Respuesta de Tierra en")).toBeNull();
  expect(
    screen.getByText("Respuesta esperada · revisa el registro"),
  ).toBeDefined();
});

test("dictar es un toque para empezar y otro para guardar", async () => {
  openLuisCase();
  // Espera a saber que no hay motor de voz.
  await act(async () => {});

  fireEvent.click(button("Dictar nota"));
  expect(button("Escuchando… toca para guardar")).toBeDefined();
  fireEvent.click(button("Escuchando… toca para guardar"));

  const log = screen.getByRole("list", { name: "Registro del caso" });
  expect(within(log).getByText(`“${dictationSample(0)}”`)).toBeDefined();
  expect(button("Dictar nota")).toBeDefined();
});

test("cerrar pide confirmación y, ya cerrado, el contador se detiene", () => {
  openLuisCase();

  fireEvent.click(button("Cerrar caso"));
  expect(screen.getByText("¿Cerrar el caso de Luis?")).toBeDefined();
  // El foco nunca se pierde: va a la respuesta segura y vuelve al botón.
  expect(document.activeElement).toBe(button("No, sigue abierto"));
  fireEvent.click(button("No, sigue abierto"));
  expect(storedCase().closedAt).toBeUndefined();
  expect(document.activeElement).toBe(button("Cerrar caso"));

  fireEvent.click(button("Cerrar caso"));
  fireEvent.click(button("Sí, cerrar"));
  expect(storedCase().closedAt).toBeTypeOf("number");
  expect(document.activeElement).toBe(button("Nuevo caso"));
  expect(screen.queryByText("Respuesta de Tierra en")).toBeNull();
  expect(screen.getByText(/^Caso cerrado a las \d\d:\d\d$/)).toBeDefined();
  expect(screen.queryByRole("button", { name: "Dictar nota" })).toBeNull();
  expect(button("Nuevo caso")).toBeDefined();
});

test("un caso abierto en español se lee en inglés", () => {
  openLuisCase();
  cleanup();
  setLocale("en");
  render(<EmergencyScreen />);

  expect(
    screen.getByRole("heading", { level: 2, name: "Luis · Fainted" }),
  ).toBeDefined();
  expect(screen.getByText("Case opened: Luis · Fainted")).toBeDefined();
  expect(button("Dictate a note")).toBeDefined();
});
