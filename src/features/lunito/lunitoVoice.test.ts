import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { setLocale } from "@/i18n";
import {
  lunitoVoice,
  pickVoice,
  restMouth,
  useLunitoActivity,
} from "./lunitoVoice";

afterEach(() => {
  lunitoVoice.stop();
  lunitoVoice.setThinking(false);
  vi.unstubAllGlobals();
  Reflect.deleteProperty(window, "speechSynthesis");
  window.localStorage.clear();
});

const voice = (name: string, lang: string) => ({ name, lang });

const VOICES = [
  voice("Microsoft Sabina - Spanish (Mexico)", "es-MX"),
  voice("Microsoft Dalia Online (Natural) - Spanish (Mexico)", "es-MX"),
  voice("Microsoft David - English (United States)", "en-US"),
  voice("Microsoft Aria Online (Natural) - English (United States)", "en-US"),
  voice("Microsoft Libby Online (Natural) - English (United Kingdom)", "en-GB"),
  voice("Google español de Estados Unidos", "es-US"),
];

test("en inglés elige una voz natural de EE. UU.", () => {
  expect(pickVoice(VOICES, "en")?.name).toBe(
    "Microsoft Aria Online (Natural) - English (United States)",
  );
});

test("en español elige la voz de México, natural si la hay", () => {
  expect(pickVoice(VOICES, "es")?.name).toBe(
    "Microsoft Dalia Online (Natural) - Spanish (Mexico)",
  );
});

test("sin la variante preferida, usa otra del mismo idioma", () => {
  const british = [voice("Daniel", "en_GB"), voice("Paulina", "es-MX")];
  expect(pickVoice(british, "en")?.name).toBe("Daniel");
  expect(pickVoice([voice("Monica", "es-ES")], "es")?.name).toBe("Monica");
  expect(pickVoice([voice("Daniel", "en-GB")], "es")).toBeUndefined();
});

test("activity dice si Lunito piensa o está quieto, sin React", () => {
  expect(lunitoVoice.activity()).toBe("idle");
  lunitoVoice.setThinking(true);
  expect(lunitoVoice.activity()).toBe("thinking");
  // El gesto de pensar sigue igual: pucker sin hablar.
  expect(lunitoVoice.mouth(restMouth()).pucker).toBeGreaterThan(0);
  lunitoVoice.setThinking(false);
  expect(lunitoVoice.activity()).toBe("idle");
});

test("useLunitoActivity se actualiza cuando Lunito empieza a pensar", () => {
  const { result } = renderHook(() => useLunitoActivity());
  expect(result.current).toBe("idle");
  act(() => lunitoVoice.setThinking(true));
  expect(result.current).toBe("thinking");
  act(() => lunitoVoice.setThinking(false));
  expect(result.current).toBe("idle");
});

/** Voz del navegador de mentira: jsdom no tiene `speechSynthesis`. */
function fakeBrowserVoice() {
  class Utterance extends EventTarget {
    lang = "";
    voice: unknown = null;
    constructor(readonly text: string) {
      super();
    }
  }
  const spoken: Utterance[] = [];
  vi.stubGlobal("SpeechSynthesisUtterance", Utterance);
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: {
      getVoices: () => VOICES,
      cancel: () => {},
      speak: (utterance: Utterance) => {
        spoken.push(utterance);
        utterance.dispatchEvent(new Event("start"));
      },
    },
  });
  return spoken;
}

test("sin Worker, Lunito habla en inglés con la voz del navegador y lo dice en activity", async () => {
  setLocale("en");
  const spoken = fakeBrowserVoice();
  const done = lunitoVoice.say("Hi, Ana.");
  await vi.waitFor(() => expect(spoken).toHaveLength(1));
  expect(spoken[0]!.lang).toBe("en-US");
  expect((spoken[0]!.voice as { name: string }).name).toContain("Aria");
  expect(lunitoVoice.activity()).toBe("speaking");
  // Hablar tiene prioridad sobre pensar.
  lunitoVoice.setThinking(true);
  expect(lunitoVoice.activity()).toBe("speaking");
  spoken[0]!.dispatchEvent(new Event("end"));
  await done;
  expect(lunitoVoice.activity()).toBe("thinking");
});

test("en español, la voz del navegador sigue siendo la de México", async () => {
  setLocale("es");
  const spoken = fakeBrowserVoice();
  const done = lunitoVoice.say("Hola, Ana.");
  await vi.waitFor(() => expect(spoken).toHaveLength(1));
  expect(spoken[0]!.lang).toBe("es-MX");
  spoken[0]!.dispatchEvent(new Event("end"));
  await done;
  expect(lunitoVoice.activity()).toBe("idle");
});
