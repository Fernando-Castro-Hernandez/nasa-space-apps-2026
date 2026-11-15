import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { useVoiceInput } from "./useVoiceInput";

// La sesión de voz es de mentira: jsdom no tiene micrófono ni dictado.
const session = vi.hoisted(() => ({
  detectEngine: vi.fn(),
  startVoiceSession: vi.fn(),
}));
vi.mock("./session", async (original) => ({
  ...(await original<typeof import("./session")>()),
  detectEngine: session.detectEngine,
  startVoiceSession: session.startVoiceSession,
}));

function fakeSession() {
  const heard = Promise.withResolvers<string>();
  const fake = {
    level: () => 0.4,
    stop: vi.fn(() => heard.promise),
    cancel: vi.fn(),
  };
  session.startVoiceSession.mockResolvedValue(fake);
  return { fake, heard };
}

beforeEach(() => session.detectEngine.mockResolvedValue("worker"));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const listen = (onText = vi.fn()) =>
  renderHook(() => useVoiceInput({ maxSeconds: 30, onText }));

test("escucha, transcribe al soltar y entrega el texto", async () => {
  const { heard } = fakeSession();
  const onText = vi.fn();
  const { result } = listen(onText);
  await act(async () => result.current.start());
  expect(result.current.status).toBe("listening");
  expect(result.current.level()).toBe(0.4);
  act(() => result.current.stop());
  expect(result.current.status).toBe("transcribing");
  await act(async () => heard.resolve("Dormí bien"));
  expect(onText).toHaveBeenCalledWith("Dormí bien");
  expect(result.current.status).toBe("idle");
});

test("cancelar suelta el micrófono y descarta lo dicho, sin transcribir", async () => {
  const { fake } = fakeSession();
  const onText = vi.fn();
  const { result } = listen(onText);
  await act(async () => result.current.start());
  act(() => result.current.cancel());
  expect(fake.cancel).toHaveBeenCalledOnce();
  expect(fake.stop).not.toHaveBeenCalled();
  expect(result.current.status).toBe("idle");
  expect(result.current.error).toBeNull();
});

test("una transcripción que llega después de cancelar no se entrega", async () => {
  const { heard } = fakeSession();
  const onText = vi.fn();
  const { result } = listen(onText);
  await act(async () => result.current.start());
  act(() => result.current.stop());
  act(() => result.current.cancel());
  await act(async () => heard.resolve("tarde"));
  expect(onText).not.toHaveBeenCalled();
  expect(result.current.status).toBe("idle");
});

test("cancelar mientras el micrófono arranca lo suelta en cuanto llega", async () => {
  const { fake } = fakeSession();
  const ready = Promise.withResolvers<typeof fake>();
  session.startVoiceSession.mockReturnValue(ready.promise);
  const { result } = listen();
  await act(async () => result.current.start());
  expect(session.startVoiceSession).toHaveBeenCalledOnce();
  act(() => result.current.cancel());
  await act(async () => ready.resolve(fake));
  expect(fake.cancel).toHaveBeenCalledOnce();
  expect(result.current.status).toBe("idle");
});

test("salir de la pantalla mientras el micrófono arranca no lo deja abierto", async () => {
  const { fake } = fakeSession();
  const ready = Promise.withResolvers<typeof fake>();
  session.startVoiceSession.mockReturnValue(ready.promise);
  const { result, unmount } = listen();
  await act(async () => result.current.start());
  unmount();
  await act(async () => ready.resolve(fake));
  expect(fake.cancel).toHaveBeenCalledOnce();
});
