import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { DayCheckInScreen } from "./DayCheckInScreen";
import { GREETING_MS, LISTEN_MAX_MS } from "./phases";

const mic = vi.hoisted(() => vi.fn());
vi.mock("./useMicLevel", () => ({
  useMicLevel: (active: boolean) => {
    mic(active);
    return { source: "mic", getLevel: () => 0 };
  },
}));

beforeEach(() => {
  vi.useFakeTimers();
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
  vi.restoreAllMocks();
  mic.mockClear();
});

test("escribir pausa la escucha y el cierre automático sin perder el borrador", () => {
  const onDone = vi.fn();
  render(<DayCheckInScreen onDone={onDone} />);
  fireEvent.click(screen.getByRole("button", { name: "Hablar con Lunito" }));
  expect(mic).toHaveBeenLastCalledWith(true);
  fireEvent.click(screen.getByRole("button", { name: "Escribir respuesta" }));
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "Dormí bien" },
  });
  expect(mic).toHaveBeenLastCalledWith(false);
  act(() => vi.advanceTimersByTime(60_000));
  expect(screen.getByRole<HTMLTextAreaElement>("textbox").value).toBe(
    "Dormí bien",
  );
  expect(onDone).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
  act(() => vi.advanceTimersByTime(500));
  expect(onDone).toHaveBeenCalledOnce();
});

test("cancelar la respuesta escrita reanuda la escucha", () => {
  render(<DayCheckInScreen onDone={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Hablar con Lunito" }));
  fireEvent.click(screen.getByRole("button", { name: "Escribir respuesta" }));
  fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(mic).toHaveBeenLastCalledWith(true);
});

test("saluda, pregunta, escucha y entrega el cierre al componente padre", () => {
  const onDone = vi.fn();
  render(<DayCheckInScreen onDone={onDone} />);
  expect(
    screen.getByRole("heading", { name: /Qué gusto verte/ }),
  ).toBeDefined();
  act(() => vi.advanceTimersByTime(GREETING_MS));
  expect(screen.getByText("Cuéntame cómo te sientes")).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Hablar con Lunito" }));
  expect(screen.getByText("Escuchando…")).toBeDefined();
  act(() => vi.advanceTimersByTime(LISTEN_MAX_MS));
  act(() => vi.advanceTimersByTime(1));
  expect(onDone).toHaveBeenCalledOnce();
});
