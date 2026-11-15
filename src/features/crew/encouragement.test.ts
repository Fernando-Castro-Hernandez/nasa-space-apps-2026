import { expect, test } from "vitest";
import {
  cheerDay,
  cheersFor,
  hasCheered,
  parseCheers,
  withCheer,
} from "./encouragement";

const today = "2026-11-15";

test("el día se guarda en hora local", () => {
  expect(cheerDay(new Date(2026, 10, 5, 23, 59))).toBe("2026-11-05");
});

test("un ánimo queda registrado para quien lo recibe", () => {
  const cheers = withCheer([], "ana", "luis", today);
  expect(hasCheered(cheers, "ana", "luis", today)).toBe(true);
  expect(hasCheered(cheers, "luis", "ana", today)).toBe(false);
  expect(cheersFor(cheers, "luis", today)).toEqual(["ana"]);
});

test("uno al día por pareja, y nadie se manda ánimo a sí mismo", () => {
  let cheers = withCheer([], "ana", "luis", today);
  cheers = withCheer(cheers, "ana", "luis", today);
  cheers = withCheer(cheers, "ana", "ana", today);
  expect(cheers).toHaveLength(1);
});

test("varios compañeros pueden animar a la misma persona", () => {
  let cheers = withCheer([], "ana", "luis", today);
  cheers = withCheer(cheers, "mei", "luis", today);
  expect(cheersFor(cheers, "luis", today)).toEqual(["ana", "mei"]);
});

test("los ánimos de ayer no cuentan hoy y se tiran al enviar uno nuevo", () => {
  const yesterday = [{ from: "ana", to: "luis", day: "2026-11-14" }];
  expect(hasCheered(yesterday, "ana", "luis", today)).toBe(false);
  expect(withCheer(yesterday, "mei", "omar", today)).toEqual([
    { from: "mei", to: "omar", day: today },
  ]);
});

test("descarta lo guardado que no tiene la forma esperada", () => {
  expect(parseCheers("no es json")).toEqual([]);
  expect(parseCheers('{"from":"ana"}')).toEqual([]);
  expect(
    parseCheers(
      JSON.stringify([
        { from: "ana", to: "luis", day: today },
        { from: 1 },
        null,
      ]),
    ),
  ).toEqual([{ from: "ana", to: "luis", day: today }]);
});
