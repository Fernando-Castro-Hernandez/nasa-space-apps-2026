import { describe, expect, test } from "vitest";
import { emergencyHref, presetPerson } from "./preset";

const CREW_IDS = ["ana", "luis", "mei", "omar"];

describe("emergencia con la persona elegida", () => {
  test("el enlace lleva el id de la persona", () => {
    expect(emergencyHref("ana")).toBe("/emergencia?quien=ana");
    expect(emergencyHref()).toBe("/emergencia");
  });

  test("la dirección elige a esa persona si es de la tripulación", () => {
    expect(presetPerson("?quien=luis", CREW_IDS)).toBe("luis");
    expect(
      presetPerson(emergencyHref("mei").split("/emergencia")[1]!, CREW_IDS),
    ).toBe("mei");
  });

  test("sin persona o con una que no existe, no elige a nadie", () => {
    expect(presetPerson("", CREW_IDS)).toBeNull();
    expect(presetPerson("?quien=", CREW_IDS)).toBeNull();
    expect(presetPerson("?quien=zoe", CREW_IDS)).toBeNull();
  });
});
