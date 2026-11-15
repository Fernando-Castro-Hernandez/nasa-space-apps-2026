import { expect, test } from "vitest";
import type { EmergencyCase } from "@/features/emergency/caseLogic";
import { casePersonName, isCaseActive, isEmergencyPath } from "./activeCase";

// Solo los campos que mira la estructura; el resto es del área de emergencia.
const opened = { id: "c1", personId: "luis", openedAt: 1_000 } as EmergencyCase;

test("un caso abierto está en curso hasta que se cierra", () => {
  expect(isCaseActive(null)).toBe(false);
  expect(isCaseActive(opened)).toBe(true);
  expect(isCaseActive({ ...opened, closedAt: 2_000 })).toBe(false);
});

test("la franja nombra a la persona del caso", () => {
  expect(casePersonName(opened)).toBe("Luis");
  expect(casePersonName({ ...opened, personId: "visita" })).toBe("visita");
});

test("Emergencia y Tierra no repiten el acceso a la emergencia", () => {
  expect(isEmergencyPath("/emergencia")).toBe(true);
  expect(isEmergencyPath("/tierra")).toBe(true);
  expect(isEmergencyPath("/tareas")).toBe(false);
});
