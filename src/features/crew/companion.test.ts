import { describe, expect, it } from "vitest";
import type { CrewMember } from "@/data/crew";
import { pickCompanion } from "./companion";

const member = (id: string, status: CrewMember["status"]): CrewMember => ({
  id,
  name: id.toUpperCase(),
  role: "",
  status,
  mood: "",
});

describe("pickCompanion", () => {
  it("asigna a alguien en verde a quien está en ámbar", () => {
    const c = pickCompanion([member("a", "ambar"), member("b", "verde")]);
    expect(c).toEqual({
      needsId: "a",
      companionId: "b",
      action: "toma el café con A",
    });
  });

  it("no asigna a nadie si todos están en verde", () => {
    expect(
      pickCompanion([member("a", "verde"), member("b", "verde")]),
    ).toBeNull();
  });

  it("no asigna a nadie si no hay quién acompañe", () => {
    expect(
      pickCompanion([member("a", "ambar"), member("b", "rojo")]),
    ).toBeNull();
  });

  it("la salida no expone datos de salud", () => {
    const c = pickCompanion([member("a", "ambar"), member("b", "verde")])!;
    expect(Object.keys(c).toSorted()).toEqual(["action", "companionId", "needsId"]);
  });
});
