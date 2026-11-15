import { afterEach, describe, expect, test } from "vitest";
import { setLocale } from "@/i18n";
import {
  addNote,
  addOrder,
  checkOrder,
  checkStep,
  closeCase,
  eventText,
  latestVitals,
  openCase,
  isSimulatedVitals,
  vitalsOf,
  whatCode,
  whatLabel,
} from "./caseLogic";

afterEach(() => window.localStorage.clear());

const T0 = new Date(2026, 10, 14, 14, 3).getTime();
const min = (n: number) => T0 + n * 60_000;
const opened = () => openCase("ana", "Ana", "fainted", T0);

describe("caso de emergencia", () => {
  test("abrir registra quién, qué y la hora", () => {
    const c = opened();
    expect(c.personId).toBe("ana");
    expect(c.what).toBe("fainted");
    expect(c.events).toHaveLength(1);
    expect(c.events[0]).toMatchObject({ kind: "open", at: T0 });
    expect(c.events[0]!.text).toBe("Caso abierto: Ana · Se desmayó");
  });

  test("marcar un paso agrega un evento con hora, una sola vez", () => {
    let c = checkStep(opened(), "restrain", min(1));
    c = checkStep(c, "restrain", min(2));
    expect(c.steps.restrain).toBe(min(1));
    expect(c.events.filter((e) => e.kind === "step")).toHaveLength(1);
  });

  test("un paso desconocido no cambia el caso", () => {
    const c = opened();
    expect(checkStep(c, "no-existe", min(1))).toBe(c);
  });

  test("sin la estación, poner el sensor registra una muestra y la marca simulada", () => {
    const c = checkStep(opened(), "sensor", min(4));
    const event = latestVitals(c)!;
    expect(vitalsOf(event)).toEqual({ bpm: 58, spo2: 97 });
    expect(isSimulatedVitals(event)).toBe(true);
    expect(eventText(event)).toMatch(/^Signos simulados: 58/);
  });

  test("con la estación conectada pero sin señal estable, no inventa signos", () => {
    const c = checkStep(opened(), "sensor", min(4), null);
    expect(c.steps.sensor).toBe(min(4));
    expect(latestVitals(c)).toBeUndefined();
  });

  test("con la estación conectada, registra lo que mide en ese momento", () => {
    const c = checkStep(opened(), "sensor", min(4), { bpm: 64, spo2: 96 });
    const event = latestVitals(c)!;
    expect(vitalsOf(event)).toEqual({ bpm: 64, spo2: 96 });
    expect(isSimulatedVitals(event)).toBe(false);
    expect(eventText(event)).toMatch(/^Signos con sensor: 64/);
  });

  test("una nota vacía no se registra: el caso nunca inventa lo que alguien dijo", () => {
    const c = opened();
    expect(addNote(c, min(1), "")).toBe(c);
    expect(addNote(c, min(1), "   ")).toBe(c);
  });

  test("una nota dictada guarda lo que se dijo, con su hora", () => {
    const c = addNote(opened(), min(1), "  le di oxígeno  ");
    const note = c.events.at(-1)!;
    expect(note.text).toBe("“le di oxígeno”");
    expect(note.at).toBe(min(1));
  });

  test("una indicación de Tierra queda pendiente hasta marcarla", () => {
    let c = addOrder(opened(), "  Mantener en reposo  ", min(20));
    expect(c.orders[0]!.text).toBe("Mantener en reposo");
    expect(c.orders[0]!.doneAt).toBeUndefined();
    c = checkOrder(c, "o1", min(35));
    expect(c.orders[0]!.doneAt).toBe(min(35));
    expect(eventText(c.events.at(-1)!)).toBe("Hecho: Mantener en reposo");
  });

  test("una indicación vacía se ignora", () => {
    const c = opened();
    expect(addOrder(c, "   ", min(1))).toBe(c);
  });

  test("cerrar marca la hora y no se cierra dos veces", () => {
    const c = closeCase(closeCase(opened(), min(30)), min(40));
    expect(c.closedAt).toBe(min(30));
    expect(c.events.filter((e) => e.kind === "close")).toHaveLength(1);
  });

  test("un caso cerrado ya no admite registros", () => {
    const c = closeCase(addOrder(opened(), "Reposo", min(5)), min(30));
    expect(checkStep(c, "restrain", min(31))).toBe(c);
    expect(addNote(c, min(31), "otra nota")).toBe(c);
    expect(addOrder(c, "Otra indicación", min(31))).toBe(c);
    expect(checkOrder(c, "o1", min(31))).toBe(c);
  });
});

describe("el caso se lee en el idioma activo", () => {
  test("qué pasó se guarda como código, aunque llegue su texto", () => {
    expect(openCase("ana", "Ana", "Se desmayó", T0).what).toBe("fainted");
    expect(openCase("ana", "Ana", "Chest pain", T0).what).toBe("chestPain");
    expect(whatCode("dificultad para respirar")).toBe("breathing");
    expect(whatCode("Mareo espacial")).toBeNull();
  });

  test("un caso abierto en español se lee entero en inglés", () => {
    let c = checkStep(opened(), "sensor", min(4));
    c = addNote(c, min(6), "le di oxígeno");
    c = addOrder(c, "Mantener en reposo", min(20));
    c = closeCase(checkOrder(c, "o1", min(25)), min(30));

    setLocale("en");
    expect(whatLabel(c.what)).toBe("Fainted");
    expect(c.events.map(eventText)).toEqual([
      "Case opened: Ana · Fainted",
      "Put the sensor on their finger",
      "Simulated sensor vitals: 58\u00a0bpm, 97%\u00a0SpO2",
      // Lo que dijo una persona es una cita: no se traduce.
      "“le di oxígeno”",
      "Ground instruction: Mantener en reposo",
      "Done: Mantener en reposo",
      "Case closed",
    ]);
  });

  test("una nota de muestra de una versión anterior se lee como se guardó", () => {
    const old = {
      id: "e2",
      at: T0,
      kind: "note" as const,
      text: "“Abrió los ojos, responde lento”",
      params: { sample: 0 },
    };
    setLocale("en");
    expect(eventText(old)).toBe(old.text);
  });

  test("un caso guardado antes de los códigos se muestra como estaba", () => {
    const legacy = {
      id: "e2",
      at: T0,
      kind: "vitals" as const,
      text: "Signos con sensor: 61 lpm, 96 % SpO2",
    };
    expect(eventText(legacy)).toBe(legacy.text);
    expect(vitalsOf(legacy)).toEqual({ bpm: 61, spo2: 96 });
    expect(whatLabel("Mareo espacial")).toBe("Mareo espacial");
  });
});
