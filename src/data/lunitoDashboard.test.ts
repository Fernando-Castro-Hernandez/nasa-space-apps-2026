import { afterEach, describe, expect, test } from "vitest";
import { cleanup, renderHook, act } from "@testing-library/react";
import { setActiveProfile } from "@/features/profiles/activeProfile";
import { setReadingIndex } from "@/features/demo/readingStore";
import { setShared } from "@/features/crew/privacy";
import { buildLunitoDashboard, useLunitoDashboard } from "./lunitoDashboard";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("dashboard de demostración", () => {
  test("centraliza valores de referencia y no anuncia servicios reales", () => {
    const model = buildLunitoDashboard();
    expect(model.source).toBe("demo");
    expect(model.capabilities).toEqual({
      backend: false,
      remoteEncouragement: false,
      liveSensor: false,
    });
    expect(model.reading).toMatchObject({ bpm: 72, hrv: 45, spo2: 98 });
    expect(model.status).toBe("verde");
    expect(model.reason).toBeNull();
    expect(model.mission).toMatchObject({ autonomy: 68, target: 100 });
    expect(model).toEqual(buildLunitoDashboard());
  });

  test.each([
    [0, "verde"],
    [1, "ambar"],
    [2, "rojo"],
  ] as const)(
    "escenario %i usa las reglas existentes: %s",
    (readingIndex, status) => {
      const model = buildLunitoDashboard({ readingIndex });
      expect(model.status).toBe(status);
      for (const metric of model.metrics) {
        expect(metric.week.at(-1)).toBe(metric.value);
        expect(metric.value).toBe(model.reading[metric.key]);
      }
    },
  );

  test("el promedio y el rango del pulso salen de la misma serie", () => {
    const values = buildLunitoDashboard().series.bpm.week;
    expect(values).toEqual([71, 77, 74, 70, 71, 75, 72]);
    expect(Math.min(...values)).toBe(70);
    expect(Math.max(...values)).toBe(77);
    expect(Math.round(values.reduce((a, b) => a + b) / values.length)).toBe(73);
  });

  test.each([-1, 10, 0.5, NaN])(
    "descarta un escenario inválido: %s",
    (readingIndex) => {
      expect(buildLunitoDashboard({ readingIndex })).toEqual(
        buildLunitoDashboard(),
      );
    },
  );

  test("una persona ajena a la pareja no recibe datos del compañero", () => {
    expect(buildLunitoDashboard().mission.companion?.name).toBe("Luis");
    expect(
      buildLunitoDashboard({ profileId: "omar" }).mission.companion?.name,
    ).toBe("Mei");
    expect(
      buildLunitoDashboard({ shared: { luis: false } }).mission.companion?.name,
    ).not.toBe("Luis");
    expect(
      buildLunitoDashboard({ shared: { ana: false } }).mission.companion,
    ).toBeNull();
  });

  test("la pareja visual del comandante respeta la privacidad de ambos", () => {
    expect(
      buildLunitoDashboard({ profileId: "mei" }).mission.companion?.name,
    ).toBe("Omar");
    for (const id of ["mei", "omar"]) {
      expect(
        buildLunitoDashboard({ profileId: "mei", shared: { [id]: false } })
          .mission.companion,
      ).toBeNull();
    }
  });

  test("RIDGE solo aparece al comandante y no contiene nombres ni motivos", () => {
    expect(buildLunitoDashboard().mission.ridge).toEqual([]);
    const commander = buildLunitoDashboard({ profileId: "mei", co2: "alto" });
    expect(commander.isCommander).toBe(true);
    expect(commander.mission.ridge).toHaveLength(5);
    expect(commander.mission.ridge.find((r) => r.key === "E")?.status).toBe(
      "ambar",
    );
    for (const row of commander.mission.ridge)
      expect(Object.keys(row).toSorted()).toEqual(["key", "label", "status"]);
  });

  test("el contexto de emergencia mueve D sin convertirlo en alerta médica", () => {
    const model = buildLunitoDashboard({
      profileId: "mei",
      awaitingEarth: true,
    });
    expect(model.mission.ridge.find((r) => r.key === "D")?.status).toBe(
      "ambar",
    );
    expect(model.status).toBe("verde");
  });

  test("un caso ambiental resuelto actualiza la autonomía de muestra", () => {
    expect(
      buildLunitoDashboard({ co2: "resuelto" }).mission.autonomy,
    ).toBeGreaterThan(buildLunitoDashboard({ co2: "alto" }).mission.autonomy);
  });

  test("el hook responde a perfil, lectura y privacidad de los stores existentes", () => {
    const { result } = renderHook(useLunitoDashboard);
    act(() => setReadingIndex(2));
    expect(result.current.status).toBe("rojo");
    act(() => setActiveProfile("mei"));
    expect(result.current.isCommander).toBe(true);
    act(() => setActiveProfile("ana"));
    act(() => setShared("ana", false));
    expect(result.current.mission.companion).toBeNull();
    expect(result.current.mission.ridge).toEqual([]);
  });
});
