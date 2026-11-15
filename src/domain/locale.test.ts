// Las reglas hablan en el idioma activo. Las demás pruebas corren en español;
// estas fijan el inglés, el idioma oficial de la app.
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { setLocale } from "@/i18n";
import { actionsFor, DISCLAIMER, ROUTINE } from "./actions";
import { baselineOf } from "./baseline";
import { distanceRule } from "./distanceRule";
import { environmentalEvent } from "./environment";
import { finding, type Finding, HAZARD_NAME, PENDING } from "./finding";
import { assessDay, baselinesFrom, reasonLine } from "./semaphore";
import { co2Rule, exerciseRule, radiationRule } from "./shipRules";
import { SOURCES } from "./sources";
import { STATUS_LABEL } from "./status";
import {
  hrvRule,
  pulseRule,
  reactionRule,
  sleepRule,
  spo2Rule,
} from "./vitalRules";
import { assessVitals, type Baseline } from "./vitals";

beforeEach(() => setLocale("en"));
afterEach(() => window.localStorage.clear());

const base: Baseline = {
  bpm: { mean: 60, sd: 4 },
  hrv: { mean: 50, sd: 8 },
  spo2: { mean: 97 },
};
const normal = { bpm: 62, spo2: 97, hrv: 52 };

describe("motivos del semáforo en inglés", () => {
  test("los indicadores del dashboard", () => {
    const calm = assessVitals(normal, base);
    expect(calm.heart.reason).toBe("within your usual range");
    expect(assessVitals({ ...normal, bpm: 66 }, base).heart.reason).toBe(
      "above your usual range",
    );
    expect(assessVitals({ ...normal, spo2: 93 }, base).oxygen.reason).toBe(
      "below your usual range",
    );
    expect(assessVitals({ ...normal, hrv: 40 }, base).recovery.reason).toBe(
      "below your usual range, get some rest",
    );
    expect(assessVitals({ ...normal, spo2: 90 }, base).oxygen.reason).toBe(
      "unclear reading, measure again",
    );
    const red = assessVitals({ ...normal, bpm: 131, confirmed: true }, base);
    expect(red.heart.reason).toBe(
      "out of range, tell the crew medical officer",
    );
  });

  test("las reglas de signos vitales, con números en formato inglés", () => {
    const bpmBase = baselineOf([58, 60, 62, 59, 61, 60, 60]);
    expect(pulseRule(bpmBase, [], { value: 131, confirmed: true }).reason).toBe(
      "pulse of 131 bpm, out of range",
    );
    const spo2Base = baselineOf([97, 98, 97, 97, 98, 97, 97]);
    expect(spo2Rule(spo2Base, [], { value: 90, confirmed: true }).reason).toBe(
      "blood oxygen at 90%",
    );
    expect(spo2Rule(spo2Base, [97, 93]).reason).toBe("blood oxygen below 94%");
    const sleepBase = baselineOf([7.5, 7.8, 7.2, 7.6, 7.4, 7.7, 7.5]);
    expect(sleepRule(sleepBase, [6, 6, 6]).reason).toBe(
      "you slept 6.0 h on average over the last 3 nights",
    );
    expect(hrvRule(baselineOf([60, 61]), [3, 3, 3]).reason).toBe(
      "not enough baseline data yet",
    );
    const lapses = reactionRule(baselineOf([1, 2, 1, 1, 2, 1, 1]), 4);
    expect(lapses.reason).toBe(
      "more attention lapses than usual (threshold pending validation)",
    );
  });

  test("las reglas de la nave y la luz D", () => {
    expect(co2Rule(3.8).reason).toBe("cabin CO2 at 3.8 mmHg (1-hour average)");
    expect(radiationRule(600).reason).toBe(
      "cumulative dose of 600 mSv, at the 600 mSv limit",
    );
    expect(exerciseRule(540).reason).toBe(
      "540 of 600 min of exercise this week",
    );
    const link = { delayMinutes: 14, linkUp: true, awaitingEarth: false };
    expect(distanceRule(link).reason).toBe("Ground responds in ~28 min");
    expect(distanceRule({ ...link, linkUp: false }).reason).toBe(
      "no link with Ground: follow the onboard protocol",
    );
  });

  test("un rojo sin fuente baja a amarillo y lo dice en inglés", () => {
    const f = finding({
      id: "x",
      hazard: "I",
      status: "rojo",
      reason: "something",
      source: null,
    });
    expect(f.reason).toBe("something (pending validation)");
    expect(PENDING()).toBe("pending validation");
  });

  test("el titular del semáforo: letra, peligro y motivo", () => {
    const a = assessDay({
      baselines: baselinesFrom({
        lnRmssd: [3.9, 4.0, 3.95, 4.05, 4.0, 3.9, 4.1],
      }),
      lnRmssdWeek: [3.6, 3.7, 3.65, 3.7, 3.6, 3.7, 3.65],
    });
    expect(reasonLine(a.top!)).toBe(
      "I · Isolation: heart rate variability (HRV) below your usual range on the 7-day average",
    );
  });
});

/** Hallazgo mínimo para elegir acciones: solo importan la regla y el estado. */
const f = (id: string, status: Finding["status"]): Finding => ({
  id,
  hazard: "I",
  status,
  reason: "",
  source: null,
});

describe("acciones del día en inglés", () => {
  test("las acciones, la rutina y el aviso", () => {
    expect(actionsFor([f("spo2-red", "rojo")])[0]!.text).toBe(
      "Contact the flight surgeon",
    );
    expect(actionsFor([f("hrv-low", "ambar")])[0]!.text).toBe(
      "Guided breathing · 5 min",
    );
    expect(actionsFor([f("hrv-ok", "verde")])[0]!.text).toBe(
      "No changes, keep up your routine",
    );
    expect(DISCLAIMER()).toBe("Prototype, not a diagnosis");
  });

  test("la etiqueta de la fuente se traduce; las siglas no", () => {
    const [a] = actionsFor([f("radiation-limit", "rojo")]);
    expect(a!.source?.name).toBe("OCHMO, radiation");
    expect(SOURCES.plews2012.name).toBe("Plews et al. 2012");
  });

  test("el evento ambiental pide revisar la ventilación del módulo", () => {
    const e = environmentalEvent(
      [{ module: "lab module", co2OneHourMmhg: 3.4 }],
      [
        { crewId: "ana", day: "d" },
        { crewId: "luis", day: "d" },
      ],
      "d",
    );
    expect(e?.instruction).toBe("Check the ventilation in the lab module");
  });
});

describe("etiquetas de estado y de peligro", () => {
  test("en inglés, con el glosario", () => {
    expect(STATUS_LABEL).toEqual({
      verde: "Good",
      ambar: "Caution",
      rojo: "Alert",
    });
    expect(Object.values(HAZARD_NAME)).toEqual([
      "Radiation",
      "Isolation",
      "Distance",
      "Gravity",
      "Environment",
    ]);
  });

  test("las exportaciones perezosas siguen el cambio de idioma", () => {
    setLocale("es");
    expect(STATUS_LABEL.ambar).toBe("Precaución");
    expect(HAZARD_NAME.G).toBe("Gravedad");
    expect(ROUTINE.text).toBe("Sin cambios, sigue tu rutina");
    expect(SOURCES.news2Response.name).toBe("Respuesta clínica NEWS2");
    setLocale("en");
    expect(STATUS_LABEL.ambar).toBe("Caution");
    expect(HAZARD_NAME.G).toBe("Gravity");
    expect(ROUTINE.text).toBe("No changes, keep up your routine");
    expect(SOURCES.news2Response.name).toBe("NEWS2 clinical response");
  });
});
