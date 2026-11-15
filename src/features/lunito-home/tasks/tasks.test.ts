import { expect, test } from "vitest";
import { taskProgress } from "./tasks";

test("cuenta las tareas completadas y calcula el porcentaje", () => {
  expect(taskProgress([true, false, false])).toEqual({
    count: 1,
    total: 3,
    percent: 33,
    label: "1 de 3 completadas",
  });
});

test("sin tareas el progreso es cero y no divide entre cero", () => {
  expect(taskProgress([]).percent).toBe(0);
  expect(taskProgress([true, true]).percent).toBe(100);
});
