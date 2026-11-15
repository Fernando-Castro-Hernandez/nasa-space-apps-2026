import { expect, test } from "vitest";
import { checkInResult } from "./result";

const ana = {
  name: "Ana",
  status: "verde" as const,
  reason: null,
  pendingActions: [
    "Respiración guiada · 5 min",
    "Apagar pantallas a las 22:00",
    "Tercera acción",
  ],
  missionDay: 142,
  cmoName: "Luis",
};

test("en Bien, Lunito lo dice con las reglas y propone hasta dos acciones pendientes", () => {
  const result = checkInResult(ana, "es");
  expect(result.status).toBe("verde");
  expect(result.actions).toEqual([
    "Respiración guiada · 5 min",
    "Apagar pantallas a las 22:00",
  ]);
  expect(result.line).toBe(
    "Hoy tu estado es Bien: tus indicadores están en tu normal. Te propongo esto: Respiración guiada · 5 min.",
  );
});

test("con el check-in hecho no vuelve a pedirlo, y si no queda nada lo celebra en palabras", () => {
  const result = checkInResult({ ...ana, pendingActions: [] }, "en");
  expect(result.actions).toEqual([]);
  expect(result.line).toBe(
    "Your status today is Good: your readings are within your usual range. You've done everything for today.",
  );
  expect(result.line).not.toContain("check-in");
});

test("en Precaución conserva el motivo de las reglas", () => {
  const result = checkInResult(
    { ...ana, status: "ambar", reason: "pulso en reposo alto" },
    "es",
  );
  expect(result.reason).toBe("pulso en reposo alto");
  expect(result.line).toContain("Hoy tu estado es Precaución.");
});

test("en Atención la única acción es avisar al oficial médico", () => {
  const result = checkInResult(
    { ...ana, status: "rojo", reason: "oxígeno al 90%" },
    "en",
  );
  expect(result.actions).toEqual([
    "Let Luis, your crew medical officer, know.",
  ]);
  expect(result.line).toContain("Let Luis, your crew medical officer, know.");
});

test("si el oficial médico es quien hace el check-in, repite la medición", () => {
  const result = checkInResult(
    { ...ana, name: "Luis", status: "rojo", reason: "oxígeno al 90%" },
    "es",
  );
  expect(result.actions).toEqual(["Repite la medición."]);
});
