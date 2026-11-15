import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { useMicLevel } from "./useMicLevel";

function createAudio() {
  const stop = vi.fn();
  const stream = { getTracks: () => [{ stop }] };
  const close = vi.fn().mockResolvedValue(undefined);
  const getUserMedia = vi.fn().mockResolvedValue(stream);
  const failAnalyser = vi.fn();
  vi.stubGlobal("navigator", { mediaDevices: { getUserMedia } });
  vi.stubGlobal(
    "AudioContext",
    class {
      close = close;
      createAnalyser() {
        failAnalyser();
        return { fftSize: 512, getFloatTimeDomainData: vi.fn() };
      }
      createMediaStreamSource() {
        return { connect: vi.fn() };
      }
    },
  );
  return { stop, stream, close, getUserMedia, failAnalyser };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test("libera el micrófono y el contexto al dejar de escuchar", async () => {
  const audio = createAudio();
  const { result, rerender } = renderHook(({ active }) => useMicLevel(active), {
    initialProps: { active: true },
  });
  await act(async () => {});
  expect(result.current.source).toBe("mic");
  rerender({ active: false });
  expect(audio.stop).toHaveBeenCalledOnce();
  expect(audio.close).toHaveBeenCalledOnce();
});

test("un permiso que llega después de salir no deja el micrófono abierto", async () => {
  const audio = createAudio();
  const permission = Promise.withResolvers<typeof audio.stream>();
  audio.getUserMedia.mockReturnValue(permission.promise);
  const { unmount } = renderHook(() => useMicLevel(true));
  unmount();
  await act(async () => permission.resolve(audio.stream));
  expect(audio.stop).toHaveBeenCalledOnce();
  expect(audio.close).not.toHaveBeenCalled();
});

test("un fallo de Web Audio libera los recursos antes de usar la onda demo", async () => {
  const audio = createAudio();
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  audio.failAnalyser.mockImplementation(() => {
    throw new Error("Audio no disponible");
  });
  const { result } = renderHook(() => useMicLevel(true));
  await act(async () => {});
  expect(result.current.source).toBe("demo");
  expect(audio.stop).toHaveBeenCalledOnce();
  expect(audio.close).toHaveBeenCalledOnce();
  expect(warn).toHaveBeenCalled();
});

test("un cierre rechazado se informa sin dejar una promesa rechazada", async () => {
  const audio = createAudio();
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  audio.close.mockRejectedValue(new Error("Error de cierre"));
  const { unmount } = renderHook(() => useMicLevel(true));
  await act(async () => {});
  unmount();
  await act(async () => {});
  expect(warn).toHaveBeenCalledWith(
    "No se pudo cerrar el contexto de audio.",
    expect.any(Error),
  );
});
