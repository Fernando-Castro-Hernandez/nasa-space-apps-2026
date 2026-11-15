import { afterEach, expect, test } from "vitest";
import { CREW } from "@/data/crew";
import { setLocale } from "@/i18n";
import { cheersMessage, openEmergency, teamEntries } from "./teamMembers";

afterEach(() => localStorage.clear());

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

test("quien recibe ánimo ve quién se lo mandó, en una frase", () => {
  expect(cheersMessage([])).toBeNull();
  expect(cheersMessage(["Ana"])).toBe("Ana te mandó ánimo");
  expect(cheersMessage(["Ana", "Mei"])).toBe("Ana y Mei te mandaron ánimo");
  setLocale("en");
  expect(cheersMessage(["Ana", "Mei", "Omar"])).toBe(
    "Ana, Mei, and Omar sent you encouragement",
  );
});

test("solo un caso abierto marca a la persona en emergencia", () => {
  const open = {
    id: "c1",
    personId: "luis",
    what: "x",
    openedAt: 1000,
    steps: {},
    events: [],
    orders: [],
  };
  expect(openEmergency(open)).toEqual({ personId: "luis", since: 1000 });
  expect(openEmergency({ ...open, closedAt: 2000 })).toBeNull();
  expect(openEmergency(null)).toBeNull();
});

test("un rojo se ve igual que quien no comparte", () => {
  const crew = CREW.map((m) =>
    m.id === "omar" ? { ...m, status: "rojo" as const } : m,
  );
  const omar = teamEntries(crew, "ana", {}).find((e) => e.id === "omar");
  expect(omar).toMatchObject({ status: null, label: "Sin compartir" });
});
