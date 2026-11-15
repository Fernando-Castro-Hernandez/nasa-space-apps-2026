import { describe, expect, test } from "vitest";
import {
  celebrates,
  nextPhase,
  PHASE_VIEW,
  resultPose,
  voiceEvent,
  type Phase,
  type VoiceSnapshot,
} from "./phases";

describe("nextPhase", () => {
  test("el saludo pasa solo a la pregunta", () => {
    expect(nextPhase("saludo", "tick")).toBe("pregunta");
    expect(nextPhase("pregunta", "tick")).toBe("pregunta");
  });

  test("tocar el micrófono en el saludo o la pregunta empieza a escuchar", () => {
    expect(nextPhase("saludo", "tapMic")).toBe("escucha");
    expect(nextPhase("pregunta", "tapMic")).toBe("escucha");
    expect(nextPhase("sensor", "tapMic")).toBe("sensor");
  });

  test("al dejar de escuchar piensa y, con el texto, abre la hoja", () => {
    expect(nextPhase("escucha", "think")).toBe("pensando");
    expect(nextPhase("pensando", "heard")).toBe("revisar");
    // Si la transcripción es instantánea, de escuchar se pasa directo a la hoja.
    expect(nextPhase("escucha", "heard")).toBe("revisar");
  });

  test("si no se pudo escuchar, vuelve a preguntar", () => {
    expect(nextPhase("escucha", "failed")).toBe("pregunta");
    expect(nextPhase("pensando", "failed")).toBe("pregunta");
    expect(nextPhase("revisar", "failed")).toBe("revisar");
  });

  test("escribir abre la misma hoja desde cualquier momento de la conversación", () => {
    for (const p of ["saludo", "pregunta", "escucha", "pensando"] as const)
      expect(nextPhase(p, "write")).toBe("revisar");
    expect(nextPhase("resultado", "write")).toBe("resultado");
  });

  test("cerrar la hoja vuelve a la pregunta; guardar pasa al sensor", () => {
    expect(nextPhase("revisar", "close")).toBe("pregunta");
    expect(nextPhase("revisar", "confirm")).toBe("sensor");
    expect(nextPhase("pregunta", "confirm")).toBe("pregunta");
  });

  test("el sensor y la prueba de reacción se terminan o se saltan hasta el resultado", () => {
    expect(nextPhase("sensor", "next")).toBe("reaccion");
    expect(nextPhase("reaccion", "next")).toBe("resultado");
    expect(nextPhase("resultado", "next")).toBe("resultado");
  });

  test("el resultado no vuelve atrás", () => {
    const events = [
      "tick",
      "tapMic",
      "think",
      "heard",
      "followUp",
      "failed",
      "write",
      "close",
      "confirm",
      "next",
    ] as const;
    for (const e of events) expect(nextPhase("resultado", e)).toBe("resultado");
  });
});

const voice = (patch: Partial<VoiceSnapshot>): VoiceSnapshot => ({
  status: "idle",
  error: null,
  log: "ask",
  organizing: "idle",
  followUp: null,
  ...patch,
});

describe("voiceEvent", () => {
  test("fuera de escuchar y pensar, la voz no mueve la conversación", () => {
    for (const p of ["saludo", "pregunta", "revisar", "sensor"] as Phase[])
      expect(voiceEvent(p, voice({ log: "review" }))).toBeNull();
  });

  test("mientras el micrófono arranca o escucha, sigue escuchando", () => {
    expect(voiceEvent("escucha", voice({ status: "starting" }))).toBeNull();
    expect(voiceEvent("escucha", voice({ status: "listening" }))).toBeNull();
  });

  test("al transcribir o al ordenar, Lunito piensa", () => {
    expect(voiceEvent("escucha", voice({ status: "transcribing" }))).toBe(
      "think",
    );
    expect(
      voiceEvent("escucha", voice({ log: "review", organizing: "working" })),
    ).toBe("think");
    expect(
      voiceEvent("pensando", voice({ log: "review", organizing: "working" })),
    ).toBeNull();
  });

  test("con el texto listo abre la hoja, aunque la IA no haya podido ordenar", () => {
    expect(voiceEvent("pensando", voice({ log: "review" }))).toBe("heard");
    expect(
      voiceEvent("pensando", voice({ log: "review", organizing: "failed" })),
    ).toBe("heard");
  });

  test("si falta ánimo o estrés, Lunito vuelve a preguntar", () => {
    expect(voiceEvent("pensando", voice({ followUp: "mood" }))).toBe(
      "followUp",
    );
    expect(nextPhase("pensando", "followUp")).toBe("pregunta");
    expect(
      voiceEvent("escucha", voice({ followUp: "mood", status: "listening" })),
    ).toBeNull();
  });

  test("sin micrófono o sin palabras vuelve a preguntar con el aviso", () => {
    expect(voiceEvent("escucha", voice({ error: "Sin micrófono" }))).toBe(
      "failed",
    );
    expect(voiceEvent("pensando", voice({ error: "No oí nada" }))).toBe(
      "failed",
    );
  });
});

test("las poses de Lunito siguen la tabla del brief", () => {
  expect(PHASE_VIEW.saludo.pose).toBe("greeting");
  expect(PHASE_VIEW.pregunta.pose).toBe("asking");
  expect(PHASE_VIEW.escucha.pose).toBe("listening");
  expect(PHASE_VIEW.pensando.pose).toBe("thinking");
});

describe("resultPose", () => {
  test("al terminar de decir el resultado celebra el check-in", () => {
    expect(resultPose("verde", false)).toBe("idle");
    expect(resultPose("verde", true)).toBe("celebrating");
    expect(resultPose("ambar", true)).toBe("celebrating");
  });

  test("en Precaución espera tranquilo y en Atención cuida, sin celebrar", () => {
    expect(resultPose("ambar", false)).toBe("caring");
    expect(resultPose("rojo", false)).toBe("caring");
    expect(resultPose("rojo", true)).toBe("caring");
  });

  test("si la bitácora habla de una emergencia, cuida y no celebra en ningún estado", () => {
    for (const status of ["verde", "ambar", "rojo"] as const) {
      expect(resultPose(status, false, true)).toBe("caring");
      expect(resultPose(status, true, true)).toBe("caring");
      expect(celebrates(status, true)).toBe(false);
    }
    expect(celebrates("verde", false)).toBe(true);
    expect(celebrates("ambar", false)).toBe(true);
    expect(celebrates("rojo", false)).toBe(false);
  });
});
