import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { api } from "@/api/client";
import { setLocale } from "@/i18n";
import { LunitoChat } from "./LunitoChat";

// Sin Worker ni audio: jsdom no tiene micrófono, AudioContext ni voz.
vi.mock("@/api/client", async (original) => {
  const actual = await original<typeof import("@/api/client")>();
  return {
    ...actual,
    api: {
      ...actual.api,
      aiAvailable: vi.fn(async () => false),
      lunitoReply: vi.fn(),
    },
  };
});

const reply = vi.mocked(api.lunitoReply);

afterEach(() => {
  cleanup();
  reply.mockReset();
  window.localStorage.clear();
});

function say(message: string) {
  fireEvent.change(
    screen.getByRole("textbox", { name: "Escríbele a Lunito" }),
    {
      target: { value: message },
    },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Enviar mensaje a Lunito" }),
  );
}

test("Lunito habla primero, con el estado y el motivo que dieron las reglas", () => {
  render(
    <LunitoChat
      status="ambar"
      reason="Variabilidad: bajo tu normal, descansa"
    />,
  );
  expect(
    screen.getByText(
      "Hola, Ana. Hoy tu estado es Precaución. Variabilidad: bajo tu normal, descansa. ¿Hacemos tu check-in?",
    ),
  ).toBeDefined();
});

test("manda el mensaje con el contexto de las reglas y muestra la respuesta", async () => {
  reply.mockResolvedValue({
    text: "Te escucho, Ana.",
    source: "ia",
    suggest: "check-in",
  });
  render(<LunitoChat status="ambar" reason="Pulso: sobre tu normal" />);
  say("  dormí mal  ");

  expect(await screen.findByText("Te escucho, Ana.")).toBeDefined();
  expect(screen.getByText("Tú: “dormí mal”")).toBeDefined();
  // El único check-in es el inicio del día.
  expect(
    screen
      .getByRole("link", { name: "Hacer mi check-in" })
      .getAttribute("href"),
  ).toBe("/buenos-dias");
  expect(reply).toHaveBeenCalledWith({
    message: "dormí mal",
    history: [],
    context: {
      name: "Ana",
      // El estado viaja como código; cada lado lo dice en su idioma.
      status: "ambar",
      reason: "Pulso: sobre tu normal",
      pendingActions: [
        "Respiración guiada · 5 min",
        "Apagar pantallas a las 22:00",
      ],
      checkInDone: false,
      missionDay: 142,
      cmoName: "Luis",
    },
  });
});

test("recuerda la conversación en el siguiente mensaje", async () => {
  reply.mockResolvedValue({ text: "Aquí estoy.", source: "ia", suggest: null });
  render(<LunitoChat status="verde" reason={null} />);
  say("hola");
  await screen.findByText("Aquí estoy.");
  say("¿y mis tareas?");
  await screen.findByText("Tú: “¿y mis tareas?”");
  expect(reply.mock.calls[1]![0].history).toEqual([
    { role: "user", text: "hola" },
    { role: "lunito", text: "Aquí estoy." },
  ]);
});

test("una emergencia no espera a la red: responden las reglas", async () => {
  render(<LunitoChat status="verde" reason={null} />);
  say("Omar se desmayó");
  expect(
    (
      await screen.findByRole("link", { name: "Abrir Emergencia" })
    ).getAttribute("href"),
  ).toBe("/emergencia");
  expect(screen.getByText(/^Eso puede ser una emergencia\./)).toBeDefined();
  expect(reply).not.toHaveBeenCalled();
});

test("sin conexión Lunito responde con lo que ya decidieron las reglas", async () => {
  reply.mockRejectedValue(new Error("sin red"));
  render(
    <LunitoChat
      status="rojo"
      reason="Oxígeno: baja, avisa al oficial médico"
    />,
  );
  say("¿cómo estoy?");
  expect(
    await screen.findByText(
      "Ahora no puedo responderte con detalle. Hoy tu estado es Atención. Oxígeno: baja, avisa al oficial médico. Avisa a Luis, tu oficial médico.",
    ),
  ).toBeDefined();
});

test("apagar la voz se recuerda y desactiva 'Escuchar a Lunito'", () => {
  render(<LunitoChat status="verde" reason={null} />);
  fireEvent.click(screen.getByRole("button", { name: "Apagar voz" }));
  expect(
    screen
      .getByRole("button", { name: "Voz apagada" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  expect(
    (
      screen.getByRole("button", {
        name: "Escuchar a Lunito",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  expect(window.localStorage.getItem("nostos.lunito-silencio")).toBe("1");
});

test("en inglés, Lunito saluda, responde y se maneja en inglés", async () => {
  setLocale("en");
  reply.mockRejectedValue(new Error("offline"));
  render(<LunitoChat status="ambar" reason="Pulse: above your normal" />);
  expect(
    screen.getByText(
      "Hi, Ana. Your status today is Caution. Pulse: above your normal. Shall we do your check-in?",
    ),
  ).toBeDefined();
  fireEvent.change(screen.getByRole("textbox", { name: "Write to Lunito" }), {
    target: { value: "how am I doing?" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Send message to Lunito" }),
  );
  expect(
    await screen.findByText(
      "I can't give you a detailed answer right now. Your status today is Caution. Pulse: above your normal. Shall we do your check-in?",
    ),
  ).toBeDefined();
  expect(screen.getByText("You: “how am I doing?”")).toBeDefined();
  expect(screen.getByRole("link", { name: "Do my check-in" })).toBeDefined();
  expect(screen.getByRole("region", { name: "Talk to Lunito" })).toBeDefined();
  // El contexto lleva el código del estado, no la palabra en ningún idioma.
  expect(reply.mock.calls[0]![0].context.status).toBe("ambar");
});

test("en inglés, una emergencia en español también manda al botón", async () => {
  setLocale("en");
  render(<LunitoChat status="verde" reason={null} />);
  fireEvent.change(screen.getByRole("textbox", { name: "Write to Lunito" }), {
    target: { value: "Omar se desmayó" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Send message to Lunito" }),
  );
  expect(
    await screen.findByRole("link", { name: "Open Emergency" }),
  ).toBeDefined();
  expect(screen.getByText(/^This could be an emergency\./)).toBeDefined();
  expect(reply).not.toHaveBeenCalled();
});
