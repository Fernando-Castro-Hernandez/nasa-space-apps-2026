import { describe, expect, test } from "vitest";
import type { IndicatorHistory } from "@/data/history";
import { addNote, addOrder, checkStep, openCase } from "./caseLogic";
import { buildSbar, trendNote } from "./sbar";

const T0 = new Date(2026, 10, 14, 14, 3).getTime();

const hist = (values: number[], baseline: number): IndicatorHistory => ({
  label: "Recuperación (HRV)",
  unit: "ms",
  baseline,
  days: values.map((value, i) => ({ day: String(i), value })),
  weeks: [],
});

describe("resumen SBAR", () => {
  test("la tendencia compara los últimos 3 días con la línea base", () => {
    expect(trendNote(hist([50, 41, 40, 39], 50))).toContain("bajo su normal");
    expect(trendNote(hist([50, 50, 50.2], 50))).toContain("en su normal");
    expect(trendNote(hist([], 50))).toContain("sin datos");
  });

  test("situación con persona, qué pasó, hora y última nota", () => {
    const c = addNote(openCase("ana", "Ana", "Se desmayó", T0), T0 + 60_000);
    const s = buildSbar(c, "Ana", []);
    expect(s.situation).toContain("Ana: se desmayó a las 14:03");
    expect(s.situation).toContain("Abrió los ojos");
  });

  test("la evaluación nunca es diagnóstico y avisa que el sensor es prototipo", () => {
    const open = openCase("ana", "Ana", "Se desmayó", T0);
    expect(buildSbar(open, "Ana", []).assessment).toContain("Aún sin signos");
    const withVitals = checkStep(open, "sensor", T0 + 4 * 60_000);
    const s = buildSbar(withVitals, "Ana", []);
    expect(s.assessment).toContain("lpm");
    expect(s.assessment).toContain("prototipo");
    expect(s.assessment).toContain("lo decide el cirujano");
  });

  test("lo que se pide cambia cuando Tierra ya respondió", () => {
    const c = openCase("ana", "Ana", "Se desmayó", T0);
    expect(buildSbar(c, "Ana", []).request).toContain(
      "Indicación sobre reposo",
    );
    const replied = addOrder(c, "Reposo", T0 + 60_000);
    expect(buildSbar(replied, "Ana", []).request).toContain(
      "Indicaciones enviadas: 1",
    );
  });
});
