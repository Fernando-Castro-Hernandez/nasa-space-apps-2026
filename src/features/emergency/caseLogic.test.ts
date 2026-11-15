import { describe, expect, test } from "vitest";
import {
  addNote,
  addOrder,
  checkOrder,
  checkStep,
  closeCase,
  DICTATION_SAMPLES,
  latestVitals,
  openCase,
} from "./caseLogic";

const T0 = new Date(2026, 10, 14, 14, 3).getTime();
const min = (n: number) => T0 + n * 60_000;
const opened = () => openCase("ana", "Ana", "Se desmayó", T0);

describe("caso de emergencia", () => {
  test("abrir registra quién, qué y la hora", () => {
    const c = opened();
    expect(c.personId).toBe("ana");
    expect(c.events).toHaveLength(1);
    expect(c.events[0]).toMatchObject({ kind: "open", at: T0 });
    expect(c.events[0]!.text).toContain("Ana");
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

  test("poner el sensor registra los signos", () => {
    const c = checkStep(opened(), "sensor", min(4));
    expect(latestVitals(c)?.text).toMatch(/lpm/);
  });

  test("dictar agrega notas simuladas en orden", () => {
    const c = addNote(addNote(opened(), min(1)), min(2));
    const notes = c.events.filter((e) => e.kind === "note");
    expect(notes.map((n) => n.text)).toEqual(
      DICTATION_SAMPLES.slice(0, 2).map((t) => `“${t}”`),
    );
  });

  test("una indicación de Tierra queda pendiente hasta marcarla", () => {
    let c = addOrder(opened(), "  Mantener en reposo  ", min(20));
    expect(c.orders[0]!.text).toBe("Mantener en reposo");
    expect(c.orders[0]!.doneAt).toBeUndefined();
    c = checkOrder(c, "o1", min(35));
    expect(c.orders[0]!.doneAt).toBe(min(35));
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
});
