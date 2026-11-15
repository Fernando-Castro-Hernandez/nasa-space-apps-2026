import { expect, test } from "vitest";
import { openRedCase } from "./caseLogic";
import { escalationFor } from "./escalation";
import { buildSbar } from "./sbar";

const reason = "G · Gravity: pulse 41 bpm, confirmed";

test("solo un rojo sin caso abierto propone avisar a Tierra", () => {
  expect(escalationFor({ status: "rojo", reason, caseActive: false })).toEqual({
    reason,
  });
  expect(
    escalationFor({ status: "ambar", reason, caseActive: false }),
  ).toBeNull();
  expect(
    escalationFor({ status: "verde", reason: null, caseActive: false }),
  ).toBeNull();
  // Con el caso abierto Tierra ya sabe: no se vuelve a proponer.
  expect(
    escalationFor({ status: "rojo", reason, caseActive: true }),
  ).toBeNull();
});

test("el caso abierto por una alerta lleva el motivo y los signos, y el SBAR los dice", () => {
  const c = openRedCase(
    "ana",
    "Ana",
    reason,
    { bpm: 41, spo2: 90, simulated: false },
    1000,
  );
  expect(c.what).toBe("redStatus");
  expect(c.events.map((e) => e.kind)).toEqual(["open", "vitals"]);
  expect(c.events[0]!.params).toMatchObject({ reason });
  expect(c.events[1]!.params).toEqual({ bpm: 41, spo2: 90 });
  const sbar = buildSbar(c, "Ana", []);
  expect(sbar.situation).toContain(reason);
  expect(sbar.assessment).toContain("41");
});

test("los signos de la demo se marcan como simulados", () => {
  const c = openRedCase(
    "ana",
    "Ana",
    reason,
    { bpm: 41, spo2: 90, simulated: true },
    1000,
  );
  expect(c.events[1]!.params).toMatchObject({ simulated: 1 });
});
