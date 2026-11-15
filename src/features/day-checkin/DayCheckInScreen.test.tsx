import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { api } from "@/api/client";
import { setReadingIndex } from "@/features/demo/readingStore";
import { DayCheckInScreen } from "./DayCheckInScreen";
import { DONE_MS, GREETING_MS } from "./phases";

// jsdom no tiene micrófono: la sesión de voz es de mentira, con la misma forma
// que la de Whisper (graba, entrega el texto al soltar y se puede cancelar).
const session = vi.hoisted(() => ({
  detectEngine: vi.fn(),
  startVoiceSession: vi.fn(),
}));
vi.mock("@/features/voice/session", async (original) => ({
  ...(await original<typeof import("@/features/voice/session")>()),
  detectEngine: session.detectEngine,
  startVoiceSession: session.startVoiceSession,
}));

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

// La voz de Lunito: solo importa qué dice y cuándo calla.
const voiceOut = vi.hoisted(() => ({
  say: vi.fn(async (_text: string) => {}),
  stop: vi.fn(),
  setThinking: vi.fn(),
}));
vi.mock("@/features/lunito/lunitoVoice", async (original) => ({
  ...(await original<typeof import("@/features/lunito/lunitoVoice")>()),
  lunitoVoice: voiceOut,
}));

const extract = vi.mocked(api.extract);

function fakeSession(text = "Dormí cinco horas y me duele la cabeza") {
  const fake = {
    level: () => 0.5,
    stop: vi.fn(async () => text),
    cancel: vi.fn(),
  };
  session.startVoiceSession.mockResolvedValue(fake);
  return fake;
}

beforeEach(() => {
  session.detectEngine.mockResolvedValue("worker");
  // jsdom no implementa showModal/close; el foco real se verifica en E2E.
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
  vi.useRealTimers();
  vi.clearAllMocks();
  localStorage.clear();
});

const pressed = (name: string) =>
  screen.getByRole("button", { name }).getAttribute("aria-pressed");

/** Escribe la respuesta, elige ánimo y estrés y guarda la bitácora. */
function saveByWriting(text = "Dormí bien") {
  fireEvent.click(screen.getByRole("button", { name: "Escribir respuesta" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Tu respuesta" }), {
    target: { value: text },
  });
  fireEvent.click(screen.getByRole("button", { name: "Ánimo 4 de 5: bueno" }));
  fireEvent.click(screen.getByRole("button", { name: "Estrés 2 de 5: poco" }));
  fireEvent.click(screen.getByRole("button", { name: "Listo" }));
}

test("saluda en voz alta y pasa sola a la pregunta", () => {
  vi.useFakeTimers();
  render(<DayCheckInScreen onDone={vi.fn()} onSkip={vi.fn()} />);
  expect(
    screen.getByRole("heading", { name: "¡Hola! Qué gusto verte" }),
  ).toBeDefined();
  expect(screen.getByText("Hola, soy Lunito")).toBeDefined();
  expect(voiceOut.say).toHaveBeenCalledWith(
    "¡Hola! Qué gusto verte. ¿Cómo amaneciste hoy?",
  );
  act(() => vi.advanceTimersByTime(GREETING_MS));
  expect(
    screen.getByRole("heading", { name: "¿Cómo amaneciste hoy?" }),
  ).toBeDefined();
  expect(screen.getByText("Cuéntame cómo te sientes")).toBeDefined();
});

test("escucha de verdad, piensa y muestra lo que entendió; al confirmar guarda la bitácora con su hora", async () => {
  const fake = fakeSession();
  const heard = Promise.withResolvers<string>();
  fake.stop.mockReturnValue(heard.promise);
  extract.mockResolvedValue({
    sleepHours: 5,
    sleepQuality: "mala",
    mood: 2,
    stress: 4,
    symptoms: ["dolor_cabeza"],
  });
  render(<DayCheckInScreen onDone={vi.fn()} onSkip={vi.fn()} />);

  fireEvent.click(screen.getByRole("button", { name: "Hablar con Lunito" }));
  // Lunito calla para no hablar encima de la grabación.
  expect(voiceOut.stop).toHaveBeenCalled();
  await screen.findByText("Escuchando…");
  expect(screen.getByText(/Toca la onda cuando termines/)).toBeDefined();

  fireEvent.click(screen.getByRole("button", { name: "Terminar de hablar" }));
  await screen.findByText("Pasando tu voz a texto…");
  expect(voiceOut.setThinking).toHaveBeenLastCalledWith(true);
  await act(async () =>
    heard.resolve("Dormí cinco horas y me duele la cabeza"),
  );

  const sheet = await screen.findByRole("dialog", { name: "Esto entendí" });
  expect(extract).toHaveBeenCalledWith(
    "Dormí cinco horas y me duele la cabeza",
  );
  expect(
    within(sheet).getByRole<HTMLTextAreaElement>("textbox", {
      name: "Tu respuesta",
    }).value,
  ).toBe("Dormí cinco horas y me duele la cabeza");
  expect(pressed("Ánimo 2 de 5: bajo")).toBe("true");
  expect(pressed("Estrés 4 de 5: bastante")).toBe("true");
  expect(pressed("Dolor de cabeza")).toBe("true");

  fireEvent.click(within(sheet).getByRole("button", { name: "Listo" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByText("Bitácora guardada")).toBeDefined();
  expect(
    screen.getByRole("heading", { name: "Pon el dedo en el sensor" }),
  ).toBeDefined();
  const saved = JSON.parse(localStorage.getItem("nostos.voice-log")!);
  expect(saved.ana.fields.mood).toBe(2);
  expect(saved.ana.transcript).toBe("Dormí cinco horas y me duele la cabeza");
  expect(typeof saved.ana.savedAt).toBe("number");
});

test("escribir abre la misma hoja con el texto vacío y Emergencia a un toque", () => {
  render(<DayCheckInScreen onDone={vi.fn()} onSkip={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Escribir respuesta" }));
  const sheet = screen.getByRole("dialog", { name: "¿Cómo amaneciste hoy?" });
  const text = within(sheet).getByRole<HTMLTextAreaElement>("textbox", {
    name: "Tu respuesta",
  });
  expect(text.value).toBe("");
  expect(document.activeElement).toBe(text);
  expect(
    within(sheet)
      .getByRole("link", { name: "Emergencia" })
      .getAttribute("href"),
  ).toBe("/emergencia");
  // Ánimo y estrés son obligatorios.
  const done = within(sheet).getByRole<HTMLButtonElement>("button", {
    name: "Listo",
  });
  expect(done.disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(
    screen.getByRole("heading", { name: "¿Cómo amaneciste hoy?" }),
  ).toBeDefined();
});

test("escribir mientras escucha descarta la grabación sin transcribirla", async () => {
  const fake = fakeSession();
  render(<DayCheckInScreen onDone={vi.fn()} onSkip={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Hablar con Lunito" }));
  await screen.findByText("Escuchando…");
  fireEvent.click(screen.getByRole("button", { name: "Escribir respuesta" }));
  expect(fake.cancel).toHaveBeenCalledOnce();
  expect(fake.stop).not.toHaveBeenCalled();
  expect(
    screen.getByRole("dialog", { name: "¿Cómo amaneciste hoy?" }),
  ).toBeDefined();
});

test("sin micrófono vuelve a la pregunta con el aviso y se puede escribir", async () => {
  session.startVoiceSession.mockRejectedValue(new Error("NotAllowedError"));
  render(<DayCheckInScreen onDone={vi.fn()} onSkip={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Hablar con Lunito" }));
  expect((await screen.findByRole("alert")).textContent).toBe(
    "No pude usar el micrófono.",
  );
  expect(screen.getByText("Cuéntame cómo te sientes")).toBeDefined();
  saveByWriting();
  expect(
    screen.getByRole("heading", { name: "Pon el dedo en el sensor" }),
  ).toBeDefined();
});

test("sin motor de voz, el micrófono abre la hoja para escribir", async () => {
  session.detectEngine.mockResolvedValue("none");
  render(<DayCheckInScreen onDone={vi.fn()} onSkip={vi.fn()} />);
  await screen.findByText(
    "Este navegador no puede escucharte. Escribe tu respuesta.",
  );
  fireEvent.click(screen.getByRole("button", { name: "Hablar con Lunito" }));
  expect(
    screen.getByRole("dialog", { name: "¿Cómo amaneciste hoy?" }),
  ).toBeDefined();
  expect(session.startVoiceSession).not.toHaveBeenCalled();
});

test("el sensor y la prueba se saltan; el resultado es el de Inicio, Lunito lo dice y confirma antes de ir a Inicio", async () => {
  setReadingIndex(2); // La demo puso Atención: Inicio y el check-in dicen lo mismo.
  const onDone = vi.fn();
  render(<DayCheckInScreen onDone={onDone} onSkip={vi.fn()} />);
  saveByWriting();
  fireEvent.click(screen.getByRole("button", { name: "Saltar el sensor" }));
  expect(
    screen.getByRole("heading", { name: "Prueba de reacción" }),
  ).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Saltar la prueba" }));

  expect(
    screen.getByRole("heading", { name: "Gracias por contarme" }),
  ).toBeDefined();
  expect(screen.getByText("Así estás hoy")).toBeDefined();
  expect(screen.getByText(/^Atención · /)).toBeDefined();
  expect(screen.getByText("Avisa a Luis, tu oficial médico.")).toBeDefined();
  expect(screen.getByText("Prototipo, no es un diagnóstico.")).toBeDefined();
  expect(voiceOut.say).toHaveBeenLastCalledWith(
    expect.stringMatching(/^Hoy tu estado es Atención\. .*Avisa a Luis/),
  );
  // Sin "Ahora no": la salida del resultado es "Ir a Inicio".
  expect(screen.queryByRole("button", { name: "Ahora no" })).toBeNull();

  vi.useFakeTimers();
  fireEvent.click(screen.getByRole("button", { name: "Ir a Inicio" }));
  expect(screen.getByRole("button", { name: "¡Listo!" })).toBeDefined();
  act(() => vi.advanceTimersByTime(DONE_MS - 1));
  expect(onDone).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(1));
  expect(onDone).toHaveBeenCalledOnce();
});

test("en Bien, el resultado propone las acciones del día que siguen pendientes", () => {
  render(<DayCheckInScreen onDone={vi.fn()} onSkip={vi.fn()} />);
  saveByWriting();
  fireEvent.click(screen.getByRole("button", { name: "Saltar el sensor" }));
  fireEvent.click(screen.getByRole("button", { name: "Saltar la prueba" }));
  expect(screen.getByText("Bien")).toBeDefined();
  expect(screen.getByRole("heading", { name: "Para hoy" })).toBeDefined();
  expect(screen.getByText("Respiración guiada · 5 min")).toBeDefined();
});

test("'Ahora no' pospone antes de guardar y termina después de guardar", () => {
  const onSkip = vi.fn();
  const onDone = vi.fn();
  render(<DayCheckInScreen onDone={onDone} onSkip={onSkip} />);
  fireEvent.click(screen.getByRole("button", { name: "Ahora no" }));
  expect(onSkip).toHaveBeenCalledOnce();
  expect(onDone).not.toHaveBeenCalled();

  saveByWriting();
  fireEvent.click(screen.getByRole("button", { name: "Ahora no" }));
  expect(onDone).toHaveBeenCalledOnce();
  expect(onSkip).toHaveBeenCalledOnce();
});
