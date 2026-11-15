import { describe, expect, test } from "vitest";
import { nextPhase, PHASE_COPY } from "./phases";

describe("nextPhase", () => {
  test("el saludo pasa solo a la pregunta", () => {
    expect(nextPhase("saludo", "tick")).toBe("pregunta");
  });

  test("tocar el micrófono en el saludo empieza a escuchar", () => {
    expect(nextPhase("saludo", "tapMic")).toBe("escucha");
  });

  test("en la pregunta, el micrófono empieza a escuchar", () => {
    expect(nextPhase("pregunta", "tapMic")).toBe("escucha");
    expect(nextPhase("pregunta", "tick")).toBe("pregunta");
  });

  test("escuchar termina al detener o al volver a tocar", () => {
    expect(nextPhase("escucha", "stop")).toBe("listo");
    expect(nextPhase("escucha", "tapMic")).toBe("listo");
    expect(nextPhase("escucha", "tick")).toBe("escucha");
  });

  test("escribir la respuesta termina desde cualquier paso", () => {
    for (const p of ["saludo", "pregunta", "escucha"] as const) {
      expect(nextPhase(p, "submitText")).toBe("listo");
    }
  });

  test("listo no vuelve atrás", () => {
    expect(nextPhase("listo", "tapMic")).toBe("listo");
  });
});

test("los textos son los de la referencia", () => {
  expect(PHASE_COPY.saludo.title).toBe("¡Hola!\nQué gusto verte");
  expect(PHASE_COPY.pregunta.caption).toBe("Cuéntame cómo te sientes");
  expect(PHASE_COPY.escucha.caption).toBe("Escuchando…");
});
