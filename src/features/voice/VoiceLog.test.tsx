import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { api } from "@/api/client";
import { setLocale } from "@/i18n";
import { useVoiceLog, type ConfirmedLog } from "./useVoiceLog";
import { VoiceLogSheet } from "./VoiceLogSheet";

// jsdom no tiene micrófono: aquí se prueba la hoja con la respuesta escrita.
vi.mock("@/api/client", async (original) => {
  const actual = await original<typeof import("@/api/client")>();
  return {
    ...actual,
    api: {
      ...actual.api,
      aiAvailable: vi.fn(async () => false),
      extract: vi.fn(),
    },
  };
});

const extract = vi.mocked(api.extract);

beforeEach(() => {
  // jsdom no implementa showModal/close.
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.setAttribute("open", "");
      },
    },
    close: {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.removeAttribute("open");
      },
    },
  });
});

afterEach(() => {
  cleanup();
  extract.mockReset();
  window.localStorage.clear();
});

function Sheet({
  onConfirm,
  onClose = () => {},
}: {
  onConfirm: (log: ConfirmedLog) => void;
  onClose?: () => void;
}) {
  const log = useVoiceLog({ onConfirm });
  return <VoiceLogSheet log={log} title="Esto entendí" onClose={onClose} />;
}

const pressed = (name: string) =>
  screen.getByRole("button", { name }).getAttribute("aria-pressed");

function write(text: string) {
  fireEvent.change(screen.getByRole("textbox", { name: "Tu respuesta" }), {
    target: { value: text },
  });
  fireEvent.click(screen.getByRole("button", { name: "Ordenar mi bitácora" }));
}

test("escribir, ordenar con la IA, corregir un campo y confirmar", async () => {
  extract.mockResolvedValue({
    sleepHours: 5,
    sleepQuality: "mala",
    mood: 2,
    stress: 4,
    symptoms: ["dolor_cabeza"],
  });
  const onConfirm = vi.fn();
  render(<Sheet onConfirm={onConfirm} />);
  write("Dormí cinco horas y me duele la cabeza");

  await screen.findByText("Lo que entendí · toca para corregir");
  expect(extract).toHaveBeenCalledWith(
    "Dormí cinco horas y me duele la cabeza",
  );
  expect(pressed("Ánimo 2 de 5: bajo")).toBe("true");
  expect(pressed("Estrés 4 de 5: bastante")).toBe("true");
  expect(pressed("Dolor de cabeza")).toBe("true");
  expect(pressed("Calidad del sueño: Mala")).toBe("true");

  fireEvent.click(screen.getByRole("button", { name: "Ánimo 4 de 5: bueno" }));
  fireEvent.click(screen.getByRole("button", { name: "Mareo" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Aumentar Horas de sueño" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Listo" }));

  expect(onConfirm).toHaveBeenCalledWith({
    transcript: "Dormí cinco horas y me duele la cabeza",
    fields: {
      sleepHours: 5.5,
      sleepQuality: "mala",
      mood: 4,
      stress: 4,
      symptoms: ["mareo", "dolor_cabeza"],
    },
  });
  const saved = JSON.parse(window.localStorage.getItem("nostos.voice-log")!);
  expect(saved.ana.fields.mood).toBe(4);
  expect(typeof saved.ana.savedAt).toBe("number");
});

test("si la IA falla, los campos se llenan a mano y exige ánimo y estrés", async () => {
  extract.mockRejectedValue(new Error("sin IA"));
  const onConfirm = vi.fn();
  render(<Sheet onConfirm={onConfirm} />);
  write("Dormí bien");

  await screen.findByText(
    "No pude ordenar tu bitácora. Llena los campos a mano.",
  );
  const confirm = screen.getByRole<HTMLButtonElement>("button", {
    name: "Listo",
  });
  expect(confirm.disabled).toBe(true);
  expect(
    screen.getByText("Elige tu ánimo y tu estrés para terminar."),
  ).toBeDefined();

  fireEvent.click(
    screen.getByRole("button", { name: "Ánimo 5 de 5: muy bueno" }),
  );
  expect(confirm.disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Estrés 1 de 5: nada" }));
  expect(confirm.disabled).toBe(false);
  fireEvent.click(confirm);

  expect(onConfirm).toHaveBeenCalledWith({
    transcript: "Dormí bien",
    fields: {
      sleepHours: null,
      sleepQuality: null,
      mood: 5,
      stress: 1,
      symptoms: [],
    },
  });
});

test("las escalas muestran sus extremos antes de elegir y las horas se eligen sin teclado", () => {
  render(<Sheet onConfirm={() => {}} />);
  expect(screen.getByText("Ánimo · falta elegir")).toBeDefined();
  // Las dos polaridades, siempre a la vista.
  for (const anchor of ["muy bajo", "muy bueno", "nada", "mucho"])
    expect(screen.getByText(anchor)).toBeDefined();
  expect(screen.queryByRole("spinbutton")).toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: "Aumentar Horas de sueño" }),
  );
  expect(
    screen.getByRole("group", { name: "Horas de sueño" }).textContent,
  ).toContain("7");
  fireEvent.click(
    screen.getByRole("button", { name: "Ánimo 3 de 5: regular" }),
  );
  expect(screen.getByText("Ánimo · regular")).toBeDefined();
});

test("Emergencia sigue a un toque dentro de la hoja y cerrar no guarda nada", () => {
  const onClose = vi.fn();
  render(<Sheet onConfirm={() => {}} onClose={onClose} />);
  expect(
    screen.getByRole("link", { name: "Emergencia" }).getAttribute("href"),
  ).toBe("/emergencia");
  fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(onClose).toHaveBeenCalledOnce();
  expect(window.localStorage.getItem("nostos.voice-log")).toBeNull();
});

test("en inglés, la hoja y las escalas se leen en inglés", () => {
  setLocale("en");
  render(<Sheet onConfirm={() => {}} />);
  expect(screen.getByRole("textbox", { name: "Your answer" })).toBeDefined();
  expect(
    screen.getByRole("button", { name: "Stress 5 of 5: a lot" }),
  ).toBeDefined();
  expect(screen.getByText("Mood · not chosen yet")).toBeDefined();
  expect(screen.getByRole("button", { name: "Done" })).toBeDefined();
});
