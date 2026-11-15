import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { setReadingIndex } from "@/features/demo/readingStore";
import { saveVoiceLog } from "@/features/voice/voiceLogStore";
import { setLocale } from "@/i18n";
import { LunitoHomeScreen } from "./LunitoHomeScreen";

// Sin Worker: la conversación responde con las reglas.
vi.mock("@/api/client", async (original) => {
  const actual = await original<typeof import("@/api/client")>();
  return {
    ...actual,
    api: { ...actual.api, aiAvailable: vi.fn(async () => false) },
  };
});

beforeEach(() => localStorage.clear());
afterEach(cleanup);

const bubble = (name: RegExp) => screen.getByRole("link", { name });
/** La palabra del estado junto a su ícono, bajo el título. */
const statusWord = () => document.querySelector(".status-word")?.textContent;

test("en Bien: palabra, burbujas con sus valores y sin motivo", () => {
  render(<LunitoHomeScreen />);
  expect(statusWord()).toBe("Bien");
  expect(bubble(/^Pulso: 72 lpm, Bien/).getAttribute("href")).toBe(
    "/estado?m=bpm",
  );
  expect(bubble(/^Oxígeno en sangre: 98%, Bien/)).toBeDefined();
  expect(document.querySelector(".today-reason")).toBeNull();
});

test("en Atención: la palabra, el motivo de las reglas y el estado de cada burbuja", () => {
  setReadingIndex(2);
  render(<LunitoHomeScreen />);
  expect(statusWord()).toBe("Atención");
  expect(screen.getByText("oxígeno en sangre al 90 %")).toBeDefined();
  const oxygen = bubble(/^Oxígeno en sangre: 90%, Atención/);
  expect(oxygen.getAttribute("data-status")).toBe("rojo");
  // El color nunca va solo: la burbuja también lo dice en palabras.
  expect(within(oxygen).getByText("Atención")).toBeDefined();
  expect(
    within(bubble(/^Pulso:/)).queryByText(/Bien|Precaución|Atención/),
  ).toBeNull();
});

test("el estado cambia en Inicio cuando el panel /demo cambia la lectura", () => {
  render(<LunitoHomeScreen />);
  expect(statusWord()).toBe("Bien");
  act(() => setReadingIndex(1));
  expect(statusWord()).toBe("Precaución");
  expect(bubble(/^Variabilidad cardíaca: 36 ms, Precaución/)).toBeDefined();
});

test("sin el check-in de hoy, la fila bajo Lunito invita a hacerlo", () => {
  render(<LunitoHomeScreen />);
  expect(
    screen
      .getByRole("link", { name: "Hacer mi check-in" })
      .getAttribute("href"),
  ).toBe("/buenos-dias");
  expect(
    screen.queryByRole("button", { name: "Hablar con Lunito" }),
  ).toBeNull();
});

test("con el check-in hecho, la fila abre la conversación con Lunito", () => {
  saveVoiceLog("ana", {
    transcript: "Dormí bien",
    fields: {
      sleepHours: 8,
      sleepQuality: null,
      mood: null,
      stress: null,
      symptoms: [],
    },
  });
  render(<LunitoHomeScreen />);
  expect(screen.queryByRole("link", { name: "Hacer mi check-in" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Hablar con Lunito" }));
  const chat = screen.getByRole("region", { name: "Habla con Lunito" });
  expect(
    within(chat).getByText(/^Hola, Ana\. Hoy tu estado es Bien/),
  ).toBeDefined();
});

test("tocar a Lunito abre la conversación con el estado que muestra la pantalla", () => {
  setReadingIndex(2);
  render(<LunitoHomeScreen />);
  fireEvent.click(
    screen.getByRole("button", { name: "Lunito, Atención. Hablar con Lunito" }),
  );
  expect(
    within(screen.getByRole("region", { name: "Habla con Lunito" })).getByText(
      /Hoy tu estado es Atención\. Oxígeno en sangre al 90 %\./,
    ),
  ).toBeDefined();
});

test("en inglés, Inicio usa el glosario y no deja texto en español", () => {
  setLocale("en");
  render(<LunitoHomeScreen />);
  expect(
    screen.getByRole("heading", { name: "How you're doing today" }),
  ).toBeDefined();
  expect(statusWord()).toBe("Good");
  expect(bubble(/^Heart rate variability: 45 ms, Good/)).toBeDefined();
  expect(screen.getByRole("link", { name: "Do my check-in" })).toBeDefined();
  expect(screen.getByRole("button", { name: "What it means" })).toBeDefined();
});
