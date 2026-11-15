import { describe, expect, test } from "vitest";
import {
  addPoseLoop,
  LUNITO_POSES,
  POSE_TARGETS,
  resolvePose,
  restingPose,
} from "./poses";
import { neutralRig, RIG_LIMITS, type RigChannel } from "./rig";

const inLimits = (values: Partial<Record<RigChannel, number>>) =>
  Object.entries(values).every(([c, v]) => {
    const [min, max] = RIG_LIMITS[c as RigChannel] ?? [-Infinity, Infinity];
    return v >= min && v <= max;
  });

describe("poses", () => {
  test.each(LUNITO_POSES)(
    "%s no pasa de lo que el modelo aguanta sin verse roto",
    (pose) => {
      expect(inLimits(POSE_TARGETS[pose])).toBe(true);
    },
  );

  test.each(LUNITO_POSES)(
    "%s nunca está triste: sonríe o hace el gesto de pensar",
    (pose) => {
      const { smile = 0, pucker = 0 } = POSE_TARGETS[pose];
      expect(smile + pucker).toBeGreaterThan(0);
    },
  );

  test.each(LUNITO_POSES)(
    "%s sube las manos adelantándolas, para tapar el corte del brazo",
    (pose) => {
      const t = POSE_TARGETS[pose];
      for (const [raise, reach] of [
        [t.armLRaise ?? 0, t.armLReach ?? 0],
        [t.armRRaise ?? 0, t.armRReach ?? 0],
      ] as const) {
        if (raise > 0.3) expect(reach).toBeGreaterThanOrEqual(0.25);
      }
    },
  );

  test.each(LUNITO_POSES)(
    "%s usa los ojos felices completos o nada (a medias se ven con sueño)",
    (pose) => {
      expect([0, 1]).toContain(POSE_TARGETS[pose].happy ?? 0);
    },
  );

  test("cuidar es calma y atención, no alegría ni tristeza", () => {
    const caring = POSE_TARGETS.caring;
    expect(caring.happy ?? 0).toBe(0);
    expect(caring.smile).toBeGreaterThan(0);
    expect(caring.wide).toBeGreaterThan(0);
    expect(caring.energy).toBeLessThan(POSE_TARGETS.idle.energy!);
  });

  test("la pose de reposo sale del semáforo", () => {
    expect(restingPose("verde")).toBe("idle");
    expect(restingPose("ambar")).toBe("caring");
    expect(restingPose("rojo")).toBe("caring");
  });

  test("hablar o pensar manda sobre la pose, salvo que se pida lo contrario", () => {
    expect(resolvePose("asking", "speaking", true)).toBe("speaking");
    expect(resolvePose("listening", "thinking", true)).toBe("thinking");
    expect(resolvePose("listening", "idle", true)).toBe("listening");
    expect(resolvePose("caring", "speaking", false)).toBe("caring");
  });

  test("saluda y festeja mientras habla; pensar sí lo interrumpe", () => {
    expect(resolvePose("greeting", "speaking", true)).toBe("greeting");
    expect(resolvePose("celebrating", "speaking", true)).toBe("celebrating");
    expect(resolvePose("greeting", "thinking", true)).toBe("thinking");
  });

  test("al saludar la mano va y viene; en reposo no hay vaivén extra", () => {
    const a = addPoseLoop("greeting", 0.1, 1, neutralRig());
    const b = addPoseLoop("greeting", 0.4, 1, neutralRig());
    expect(a.armLRaise).not.toBeCloseTo(b.armLRaise, 2);
    expect(addPoseLoop("idle", 0.4, 1, neutralRig())).toEqual(neutralRig());
  });

  test("el vaivén de cada pose se suma en proporción a su peso", () => {
    const full = addPoseLoop("celebrating", 0.2, 1, neutralRig());
    const half = addPoseLoop("celebrating", 0.2, 0.5, neutralRig());
    expect(half.lift).toBeCloseTo(full.lift / 2);
    expect(addPoseLoop("celebrating", 0.2, 0, neutralRig())).toEqual(
      neutralRig(),
    );
  });
});
