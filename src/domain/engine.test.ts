import { describe, expect, test } from "vitest";
import { actionsFor, MAX_ACTIONS, ROUTINE, RULES_WITH_ACTION } from "./actions";
import { distanceRule } from "./distanceRule";
import { environmentalEvent, withEnvironmentalEvent } from "./environment";
import type { Finding } from "./finding";
import { assessDay, baselinesFrom, reasonLine, summarize } from "./semaphore";

const preflight = {
  lnRmssd: [3.9, 4.0, 3.95, 4.05, 4.0, 3.9, 4.1],
  bpm: [58, 60, 62, 59, 61, 60, 60],
  spo2: [97, 98, 97, 97, 98, 97, 97],
  sleepHours: [7.5, 7.8, 7.2, 7.6, 7.4, 7.7],
};
const baselines = baselinesFrom(preflight);

const calmDay = {
  baselines,
  lnRmssdWeek: [4, 4, 4, 4, 4, 4, 4],
  bpmLast3: [60, 60, 61],
  spo2Recent: [97, 98],
  sleepLast3: [7.5, 7.4, 7.6],
  ship: { co2OneHourMmhg: 2.1, doseMsv: 57, exerciseLast7Days: 630 },
};

describe("assessDay", () => {
  test("un día en tu normal es verde y sin motivo", () => {
    const a = assessDay(calmDay);
    expect(a.overall).toBe("verde");
    expect(a.top).toBeNull();
    expect(Object.values(a.byHazard).every((s) => s === "verde")).toBe(true);
  });

  test("dormir poco y HRV baja encienden I, no los demás peligros", () => {
    const a = assessDay({
      ...calmDay,
      lnRmssdWeek: [3.6, 3.7, 3.65, 3.7, 3.6, 3.7, 3.65],
      sleepLast3: [5.8, 6, 5.9],
    });
    expect(a.overall).toBe("ambar");
    expect(a.byHazard.I).toBe("ambar");
    expect(a.byHazard.G).toBe("verde");
    expect(reasonLine(a.top!)).toMatch(/^I · Aislamiento: /);
  });

  test("un rojo confirmado domina y explica el estado", () => {
    const a = assessDay({
      ...calmDay,
      sleepLast3: [5.8, 6, 5.9],
      latest: { spo2: { value: 90, confirmed: true } },
    });
    expect(a.overall).toBe("rojo");
    expect(a.top?.id).toBe("spo2-red");
    expect(a.byHazard.E).toBe("rojo");
  });

  test("sin línea base, los indicadores no cambian el semáforo", () => {
    const a = assessDay({
      baselines: baselinesFrom({ bpm: [60, 61], lnRmssd: [4] }),
      lnRmssdWeek: [2, 2, 2],
      bpmLast3: [90, 95, 99],
    });
    expect(a.overall).toBe("verde");
    expect(a.findings.every((f) => f.insufficient)).toBe(true);
  });

  test("solo evalúa lo que llega: sin dato, no hay regla", () => {
    expect(assessDay({ baselines: {} }).findings).toHaveLength(0);
  });
});

describe("evento ambiental (HU-13)", () => {
  const air = [
    { module: "Módulo de laboratorio", co2OneHourMmhg: 3.4 },
    { module: "Nodo 2", co2OneHourMmhg: 2.2 },
  ];
  const today = "2026-11-15";

  test("CO2 alto + 2 tripulantes con dolor de cabeza el mismo día", () => {
    const e = environmentalEvent(
      air,
      [
        { crewId: "ana", day: today },
        { crewId: "luis", day: today },
      ],
      today,
    );
    expect(e?.module).toBe("Módulo de laboratorio");
    expect(e?.instruction).toBe(
      "Revisar la ventilación del Módulo de laboratorio",
    );
    expect(e?.affected).toEqual(["ana", "luis"]);
  });

  test("una sola persona, otro día o aire normal: no es evento", () => {
    const one = [{ crewId: "ana", day: today }];
    expect(environmentalEvent(air, one, today)).toBeNull();
    const twice = [...one, { crewId: "ana", day: today }];
    expect(environmentalEvent(air, twice, today)).toBeNull();
    const otherDay = [...one, { crewId: "luis", day: "2026-11-14" }];
    expect(environmentalEvent(air, otherDay, today)).toBeNull();
    const two = [...one, { crewId: "luis", day: today }];
    expect(
      environmentalEvent([{ module: "Nodo 2", co2OneHourMmhg: 3 }], two, today),
    ).toBeNull();
  });

  test("la luz E se pone amarilla con el evento y vuelve al resolverlo", () => {
    const green = summarize([]).byHazard;
    const e = environmentalEvent(
      air,
      [
        { crewId: "ana", day: today },
        { crewId: "mei", day: today },
      ],
      today,
    );
    expect(withEnvironmentalEvent(green, e, false).E).toBe("ambar");
    expect(withEnvironmentalEvent(green, e, true).E).toBe("verde");
  });
});

describe("acciones del día (HU-14)", () => {
  const f = (id: string, status: Finding["status"]): Finding => ({
    id,
    hazard: "I",
    status,
    reason: "",
    source: null,
  });

  test("en verde: 'Sin cambios, sigue tu rutina'", () => {
    expect(actionsFor([f("hrv-ok", "verde")])).toEqual([ROUTINE]);
  });

  test("de 1 a 3 acciones, la del rojo primero y sin repetir", () => {
    const a = actionsFor([
      f("sleep-low", "ambar"),
      f("hrv-low", "ambar"),
      f("reaction-lapses", "ambar"),
      f("exercise-low", "ambar"),
      f("spo2-red", "rojo"),
    ]);
    expect(a).toHaveLength(MAX_ACTIONS);
    expect(a[0]!.id).toBe("contact-surgeon");
    expect(new Set(a.map((x) => x.id)).size).toBe(a.length);
  });

  test("toda regla que puede alertar tiene una acción precargada", () => {
    const alerting = [
      "hrv-low",
      "pulse-high",
      "pulse-red",
      "pulse-doubtful",
      "spo2-low",
      "spo2-red",
      "spo2-doubtful",
      "sleep-low",
      "reaction-lapses",
      "co2-high",
      "radiation-near",
      "radiation-limit",
      "exercise-low",
    ];
    for (const id of alerting) expect(RULES_WITH_ACTION).toContain(id);
  });

  test("las acciones sin fuente quedan marcadas como pendientes", () => {
    const [a] = actionsFor([f("hrv-low", "ambar")]);
    expect(a!.id).toBe("breathing");
    expect(a!.source).toBeNull();
  });
});

describe("luz D: ¿podemos contar con Tierra ahora?", () => {
  const link = { delayMinutes: 14, linkUp: true, awaitingEarth: false };

  test("enlace activo y sin casos esperando: Bien, con el tiempo de respuesta", () => {
    const f = distanceRule(link);
    expect(f.status).toBe("verde");
    expect(f.reason).toBe("Tierra responde en ~28 min");
  });

  test("un caso esperando a Tierra o sin enlace: Precaución, nunca Atención", () => {
    expect(distanceRule({ ...link, awaitingEarth: true }).status).toBe("ambar");
    const off = distanceRule({ ...link, linkUp: false, awaitingEarth: true });
    expect(off.id).toBe("distance-nolink");
    expect(off.status).toBe("ambar");
  });

  test("enciende la D del panel RIDGE y propone seguir el protocolo a bordo", () => {
    const a = assessDay({
      baselines: {},
      earth: { ...link, awaitingEarth: true },
    });
    expect(a.byHazard.D).toBe("ambar");
    expect(actionsFor(a.findings).map((x) => x.id)).toEqual([
      "onboard-protocol",
    ]);
  });
});
