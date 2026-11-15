// Los datos de muestra hablan en el idioma activo. Las demás pruebas corren en
// español; estas fijan el inglés, el idioma oficial de la app.
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { setLocale } from "@/i18n";
import { DAY_ACTIONS } from "./actions";
import { CREW, crewMember, MISSION } from "./crew";
import { DASHBOARD_READINGS } from "./dashboard";
import { FEED_LABEL } from "./feed";
import { HISTORY } from "./history";
import { buildLunitoDashboard } from "./lunitoDashboard";
import { SAMPLE_READINGS } from "./sample";

beforeEach(() => setLocale("en"));
afterEach(() => window.localStorage.clear());

describe("tripulación y misión en inglés", () => {
  test("roles y ánimo; los nombres propios no se traducen", () => {
    expect(CREW.map(({ name, role, mood }) => ({ name, role, mood }))).toEqual([
      { name: "Ana", role: "Mission specialist", mood: "Short on rest" },
      { name: "Luis", role: "Crew medical officer (CMO)", mood: "Doing well" },
      { name: "Mei", role: "Commander", mood: "Doing well" },
      { name: "Omar", role: "Flight engineer", mood: "Doing well" },
    ]);
    expect(MISSION.phase).toBe("Mars transit");
  });

  test("acciones del día, lecturas de muestra y etiqueta del feed", () => {
    expect(DAY_ACTIONS.map((a) => a.text)).toEqual([
      "Guided breathing · 5 min",
      "Turn off screens at 22:00",
    ]);
    expect(SAMPLE_READINGS.map((s) => s.name)).toEqual([
      "Normal",
      "Little rest",
      "Low oxygen",
      "Confirmed alert",
    ]);
    expect(DASHBOARD_READINGS.map((r) => r.name)).toEqual([
      "Good",
      "Caution",
      "Alert",
    ]);
    expect(FEED_LABEL()).toBe("simulated");
  });

  test("historial: nombre, unidad, días y semanas", () => {
    expect(HISTORY.bpm.label).toBe("Resting pulse");
    expect(HISTORY.bpm.unit).toBe("bpm");
    expect(HISTORY.hrv.label).toBe("Heart rate variability (HRV)");
    // Tres letras: con iniciales, "T" y "S" se repetirían.
    expect(HISTORY.bpm.days.map((d) => d.day).join(" ")).toBe(
      "Mon Tue Wed Thu Fri Sat Sun",
    );
    expect(HISTORY.bpm.weeks[0]!.week).toBe("Wk 1");
  });
});

describe("dashboard de Lunito en inglés", () => {
  test("indicadores, misión y compañero del día", () => {
    const model = buildLunitoDashboard();
    expect(model.profile.role).toBe("Mission specialist");
    expect(model.mission.phase).toBe("Mars transit");
    expect(model.mission.companion?.action).toBe(
      "Share a coffee and chat for a moment",
    );
    expect(model.metrics.map((m) => `${m.label} (${m.unit})`)).toEqual([
      "Pulse (bpm)",
      "Heart rate variability (ms)",
      "Blood oxygen (%)",
    ]);
  });

  test("la comandante ve el panel RIDGE también en inglés", () => {
    const model = buildLunitoDashboard({ profileId: "mei", co2: "alto" });
    expect(model.isCommander).toBe(true);
    expect(model.mission.ridge.map((r) => r.label)).toEqual([
      "Radiation",
      "Isolation",
      "Distance",
      "Gravity",
      "Environment",
    ]);
  });

  test("un motivo de alerta sale de las reglas en inglés", () => {
    expect(buildLunitoDashboard({ readingIndex: 2 }).reason).toBe(
      "blood oxygen at 90%",
    );
  });
});

test("los datos perezosos siguen el cambio de idioma", () => {
  setLocale("es");
  expect(crewMember("mei").role).toBe("Comandante");
  expect(MISSION.phase).toBe("Tránsito a Marte");
  expect(DAY_ACTIONS[1]!.text).toBe("Apagar pantallas a las 22:00");
  setLocale("en");
  expect(crewMember("mei").role).toBe("Commander");
  expect(MISSION.phase).toBe("Mars transit");
  expect(DAY_ACTIONS[1]!.text).toBe("Turn off screens at 22:00");
});
