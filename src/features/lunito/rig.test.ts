import { expect, test } from "vitest";
import { addRig, mixRig, neutralRig, settleRig } from "./rig";

test("addRig suma solo los canales que trae, por un factor", () => {
  const rig = addRig(
    { ...neutralRig(), smile: 0.2 },
    { smile: 0.4, lift: 1 },
    0.5,
  );
  expect(rig.smile).toBeCloseTo(0.4);
  expect(rig.lift).toBeCloseTo(0.5);
  expect(rig.wide).toBe(0);
});

test("mixRig lleva los canales hacia un valor en proporción", () => {
  const rig = mixRig(
    { ...neutralRig(), armLRaise: 0.2 },
    { armLRaise: 0.6 },
    0.5,
  );
  expect(rig.armLRaise).toBeCloseTo(0.4);
});

test("settleRig no deja pasar los límites del modelo", () => {
  const rig = settleRig({
    ...neutralRig(),
    armLRaise: 3,
    gillPerk: 0.2,
    smile: 1.4,
    tempo: 0,
  });
  expect(rig.armLRaise).toBe(1);
  expect(rig.gillPerk).toBe(0);
  expect(rig.smile).toBe(1);
  expect(rig.tempo).toBeGreaterThan(0);
});

test("parpadear y ojos felices no se suman (LUNITO-ARTE.md §4)", () => {
  const rig = settleRig({ ...neutralRig(), blink: 1, happy: 0.7 });
  expect(rig.blink + rig.happy).toBeCloseTo(1);
});
