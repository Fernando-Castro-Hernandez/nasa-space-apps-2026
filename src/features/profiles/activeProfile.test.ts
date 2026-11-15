import { beforeEach, describe, expect, it } from "vitest";
import { ME } from "@/data/crew";
import {
  resetActiveProfile,
  resolveProfile,
  setActiveProfile,
} from "./activeProfile";

describe("resolveProfile", () => {
  it("devuelve el perfil guardado si existe en la tripulación", () => {
    expect(resolveProfile("luis")).toBe("luis");
  });

  it("cae al perfil de la demo si no hay nada o el id es desconocido", () => {
    expect(resolveProfile(null)).toBe(ME);
    expect(resolveProfile("fantasma")).toBe(ME);
  });
});

describe("setActiveProfile", () => {
  beforeEach(() => window.localStorage.clear());

  it("guarda un perfil válido", () => {
    setActiveProfile("mei");
    expect(window.localStorage.getItem("nostos.profile")).toBe("mei");
  });

  it("ignora un id que no es de la tripulación", () => {
    setActiveProfile("fantasma");
    expect(window.localStorage.getItem("nostos.profile")).toBeNull();
  });
});

describe("resetActiveProfile", () => {
  it("borra el perfil guardado", () => {
    setActiveProfile("mei");
    resetActiveProfile();
    expect(window.localStorage.getItem("nostos.profile")).toBeNull();
  });
});
