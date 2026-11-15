import { expect, test } from "vitest";
import { CREW } from "@/data/crew";
import { teamEntries } from "./teamMembers";

test("excluye al perfil activo", () => {
  const ids = teamEntries(CREW, "ana", {}).map((e) => e.id);
  expect(ids).not.toContain("ana");
  expect(ids).toHaveLength(CREW.length - 1);
});

test("quien no comparte aparece sin estado", () => {
  const luis = teamEntries(CREW, "ana", { luis: false }).find(
    (e) => e.id === "luis",
  );
  expect(luis).toMatchObject({ status: null, label: "Sin compartir" });
});

test("quien comparte muestra su estado en palabras", () => {
  const luis = teamEntries(CREW, "mei", {}).find((e) => e.id === "luis");
  expect(luis).toMatchObject({ status: "verde", label: "Bien" });
});

test("un rojo se ve igual que quien no comparte", () => {
  const crew = CREW.map((m) =>
    m.id === "omar" ? { ...m, status: "rojo" as const } : m,
  );
  const omar = teamEntries(crew, "ana", {}).find((e) => e.id === "omar");
  expect(omar).toMatchObject({ status: null, label: "Sin compartir" });
});
