import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { api } from "@/api/client";
import type { LunitoContext, LunitoReplyResponse } from "@/api/contract";
import { useLunitoTalk } from "./useLunitoTalk";

// La IA responde cuando la prueba quiere: así se ve qué pasa mientras piensa.
vi.mock("@/api/client", () => ({
  api: { lunitoReply: vi.fn() },
}));

const voice = vi.hoisted(() => ({
  say: vi.fn(async (_text: string) => {}),
  stop: vi.fn(),
  setThinking: vi.fn(),
}));
vi.mock("./lunitoVoice", () => ({
  lunitoVoice: voice,
  useLunitoSpeaking: () => false,
}));

const reply = vi.mocked(api.lunitoReply);

/** La siguiente respuesta de la IA queda pendiente hasta `resolve`. */
function pendingReply() {
  const answer = Promise.withResolvers<LunitoReplyResponse>();
  reply.mockReturnValueOnce(answer.promise);
  return answer;
}

const ana: LunitoContext = {
  name: "Ana",
  status: "ambar",
  reason: null,
  pendingActions: [],
  checkInDone: true,
  missionDay: 142,
  cmoName: "Luis",
};

afterEach(() => {
  vi.clearAllMocks();
});

test("una emergencia no viaja a la IA en el turno siguiente y la invitación a Emergencia se queda", async () => {
  const { result } = renderHook(() => useLunitoTalk(ana));
  act(() => result.current.ask("I can't breathe"));
  await waitFor(() => expect(result.current.suggest).toBe("emergencia"));
  expect(reply).not.toHaveBeenCalled();

  const next = pendingReply();
  act(() => result.current.ask("what should I do now?"));
  await waitFor(() => expect(reply).toHaveBeenCalledOnce());
  expect(reply.mock.calls[0]![0].history).toEqual([]);

  await act(async () =>
    next.resolve({ text: "I'm here.", source: "ia", suggest: null }),
  );
  expect(result.current.line).toBe("I'm here.");
  expect(result.current.suggest).toBe("emergencia");
});

test("si el Worker reconoce una emergencia, tampoco entra al historial", async () => {
  reply.mockResolvedValueOnce({
    text: "This could be an emergency.",
    source: "reglas",
    suggest: "emergencia",
  });
  const { result } = renderHook(() => useLunitoTalk(ana));
  act(() => result.current.ask("something the app missed"));
  await waitFor(() => expect(result.current.suggest).toBe("emergencia"));

  reply.mockResolvedValueOnce({ text: "Okay.", source: "ia", suggest: null });
  act(() => result.current.ask("and now?"));
  await waitFor(() => expect(result.current.line).toBe("Okay."));
  expect(reply.mock.calls[1]![0].history).toEqual([]);
  expect(result.current.suggest).toBe("emergencia");
});

test("una conversación normal sí se recuerda", async () => {
  reply.mockResolvedValueOnce({ text: "Hi Ana.", source: "ia", suggest: null });
  const { result } = renderHook(() => useLunitoTalk(ana));
  act(() => result.current.ask("hello"));
  await waitFor(() => expect(result.current.line).toBe("Hi Ana."));

  reply.mockResolvedValueOnce({ text: "Sure.", source: "ia", suggest: null });
  act(() => result.current.ask("and my tasks?"));
  await waitFor(() => expect(result.current.line).toBe("Sure."));
  expect(reply.mock.calls[1]![0].history).toEqual([
    { role: "user", text: "hello" },
    { role: "lunito", text: "Hi Ana." },
  ]);
  expect(result.current.suggest).toBeNull();
});

test("al cerrar la conversación mientras piensa, Lunito ya no habla", async () => {
  const answer = pendingReply();
  const { result, unmount } = renderHook(() => useLunitoTalk(ana));
  act(() => result.current.ask("hello"));
  await waitFor(() => expect(reply).toHaveBeenCalledOnce());

  unmount();
  voice.setThinking.mockClear();
  await act(async () =>
    answer.resolve({ text: "Hi Ana.", source: "ia", suggest: null }),
  );

  expect(voice.say).not.toHaveBeenCalled();
  expect(voice.setThinking).not.toHaveBeenCalled();
});
