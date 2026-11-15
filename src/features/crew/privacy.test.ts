import { beforeEach, describe, expect, it } from "vitest";
import type { CrewMember } from "@/data/crew";
import {
  isCommander,
  parseShared,
  publicCrew,
  publicStatus,
  setShared,
} from "./privacy";

const member = (
  id: string,
  status: CrewMember["status"],
  role = "",
): CrewMember => ({ id, name: id, role, status, mood: "" });

describe("publicStatus", () => {
  it("publica el estado de quien comparte", () => {
    expect(publicStatus(member("a", "ambar"), {})).toBe("ambar");
  });

  it("no publica a quien lo dejó privado", () => {
    expect(publicStatus(member("a", "verde"), { a: false })).toBeNull();
  });

  it("nunca publica un rojo, aunque la persona comparta", () => {
    expect(publicStatus(member("a", "rojo"), { a: true })).toBeNull();
  });

  it("un rojo y un privado se ven igual", () => {
    expect(publicStatus(member("a", "rojo"), {})).toBe(
      publicStatus(member("b", "verde"), { b: false }),
    );
  });
});

describe("publicCrew", () => {
  it("deja fuera a privados y rojos", () => {
    const crew = [
      member("a", "verde"),
      member("b", "rojo"),
      member("c", "verde"),
    ];
    expect(publicCrew(crew, { c: false }).map((m) => m.id)).toEqual(["a"]);
  });
});

describe("isCommander", () => {
  it("solo el comandante ve el panel RIDGE", () => {
    expect(isCommander(member("m", "verde", "Comandante"))).toBe(true);
    expect(isCommander(member("o", "verde", "Ingeniero de vuelo"))).toBe(false);
  });
});

describe("parseShared / setShared", () => {
  beforeEach(() => window.localStorage.clear());

  it("un texto inválido cae a todos compartiendo", () => {
    expect(parseShared("{roto")).toEqual({});
  });

  it("guarda la preferencia de cada persona sin pisar las demás", () => {
    setShared("ana", false);
    setShared("luis", true);
    expect(parseShared(window.localStorage.getItem("nostos.share"))).toEqual({
      ana: false,
      luis: true,
    });
  });
});
