import { describe, expect, it } from "vitest";
import type { CrewMember } from "@/data/crew";
import { proposeSwap, type Task } from "./swap";

const member = (id: string, status: CrewMember["status"]): CrewMember => ({
  id,
  name: id,
  role: "",
  status,
  mood: "",
});
const walk: Task = { personId: "a", name: "caminata espacial", heavy: true };

describe("proposeSwap", () => {
  it("propone cambiar la tarea pesada de quien está en ámbar a alguien en verde", () => {
    const p = proposeSwap(
      [member("a", "ambar"), member("b", "verde")],
      [walk],
      {
        a: "I",
      },
    );
    expect(p).toEqual({
      fromId: "a",
      toId: "b",
      task: "caminata espacial",
      hazard: "I",
    });
  });

  it("no propone nada si la tarea no es pesada o no hay peligro asociado", () => {
    const crew = [member("a", "ambar"), member("b", "verde")];
    expect(
      proposeSwap(crew, [{ ...walk, heavy: false }], { a: "I" }),
    ).toBeNull();
    expect(proposeSwap(crew, [walk], {})).toBeNull();
  });

  it("no pasa la tarea a alguien que ya tiene otra pesada", () => {
    const crew = [member("a", "ambar"), member("b", "verde")];
    const tasks = [walk, { personId: "b", name: "reparación", heavy: true }];
    expect(proposeSwap(crew, tasks, { a: "I" })).toBeNull();
  });

  it("no propone nada si nadie está en verde", () => {
    const crew = [member("a", "ambar"), member("b", "rojo")];
    expect(proposeSwap(crew, [walk], { a: "I" })).toBeNull();
  });
});
