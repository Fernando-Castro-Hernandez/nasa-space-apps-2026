import { describe, expect, test } from "vitest";
import {
  blinkCurve,
  createLunitoAnimator,
  POSE_BLEND,
  type AnimatorInput,
} from "./animator";
import { GESTURE_DURATION } from "./gestures";
import { POSE_TARGETS, type LunitoPose } from "./poses";
import { neutralRig, type Rig } from "./rig";

const FRAME = 1 / 60;
/** Siempre el mismo azar: el primer parpadeo cae a los 2.5 s. */
const fixedRandom = () => 0.5;

const input = (pose: LunitoPose, extra: Partial<AnimatorInput> = {}) => ({
  pose,
  pointer: null,
  still: false,
  ...extra,
});

/** Corre `seconds` a 60 cuadros por segundo y devuelve cada cuadro. */
function run(
  animator: ReturnType<typeof createLunitoAnimator>,
  seconds: number,
  i: AnimatorInput,
): Rig[] {
  const frames: Rig[] = [];
  for (let t = 0; t < seconds - 1e-9; t += FRAME)
    frames.push({ ...animator.step(FRAME, i, neutralRig()) });
  return frames;
}

describe("animador de Lunito", () => {
  test("la primera pose entra sin transición, igual que la imagen", () => {
    const animator = createLunitoAnimator("asking", fixedRandom);
    const [first] = run(animator, FRAME, input("asking"));
    expect(first!.wide).toBeCloseTo(POSE_TARGETS.asking.wide!);
  });

  test("cambiar de pose es una transición suave, sin saltos", () => {
    const animator = createLunitoAnimator("idle", fixedRandom);
    run(animator, 0.5, input("idle"));
    const frames = run(animator, POSE_BLEND + 0.2, input("asking"));
    // `wide` no lo toca la vida de fondo: solo la transición.
    const wide = frames.map((f) => f.wide);
    const target = POSE_TARGETS.asking.wide!;
    expect(wide[0]).toBeLessThan(0.02);
    const half = wide[Math.round(POSE_BLEND / 2 / FRAME)]!;
    expect(half).toBeGreaterThan(target * 0.3);
    expect(half).toBeLessThan(target * 0.7);
    expect(wide.at(-1)).toBeCloseTo(target);
    for (let i = 1; i < wide.length; i++)
      expect(Math.abs(wide[i]! - wide[i - 1]!)).toBeLessThan(0.03);
  });

  test("una pausa larga (pestaña dormida) no salta la transición", () => {
    const animator = createLunitoAnimator("idle", fixedRandom);
    const rig = animator.step(5, input("asking"), neutralRig());
    expect(rig.wide).toBeLessThan(POSE_TARGETS.asking.wide! * 0.2);
  });

  test("con movimiento reducido la pose cambia de una vez y queda quieta", () => {
    const animator = createLunitoAnimator("idle", fixedRandom);
    const still = input("listening", { still: true });
    const frames = run(animator, 3, still);
    expect(frames[0]!.tilt).toBeCloseTo(POSE_TARGETS.listening.tilt!);
    expect(new Set(frames.map((f) => JSON.stringify(f))).size).toBe(1);
    expect(Math.max(...frames.map((f) => f.blink))).toBe(0);
  });

  test("con movimiento reducido no hay gestos", () => {
    const animator = createLunitoAnimator("idle", fixedRandom);
    animator.play("cheer");
    const frames = run(animator, 1, input("idle", { still: true }));
    expect(Math.max(...frames.map((f) => f.lift))).toBe(0);
  });

  test("un gesto se suma a la pose y luego vuelve a ella", () => {
    const animator = createLunitoAnimator("idle", fixedRandom);
    animator.play("cheer");
    const during = run(animator, GESTURE_DURATION.cheer, input("idle"));
    expect(Math.max(...during.map((f) => f.lift))).toBeGreaterThan(0.1);
    expect(Math.max(...during.map((f) => f.happy))).toBeGreaterThan(0.9);
    const after = run(animator, 0.5, input("idle"));
    // Solo queda la vida de fondo: flota apenas.
    expect(Math.max(...after.map((f) => f.lift))).toBeLessThan(0.025);
    expect(Math.max(...after.map((f) => f.happy))).toBe(0);
  });

  test("tocarlo muchas veces seguidas no reinicia el gesto", () => {
    const animator = createLunitoAnimator("idle", fixedRandom);
    animator.play("cheer");
    run(animator, 0.3, input("idle"));
    animator.play("cheer");
    const rest = run(
      animator,
      GESTURE_DURATION.cheer - 0.3 + 0.1,
      input("idle"),
    );
    expect(rest.at(-1)!.happy).toBe(0);
  });

  test("un gesto nuevo desvanece al anterior sin saltos", () => {
    const animator = createLunitoAnimator("idle", fixedRandom);
    animator.play("cheer");
    const before = run(animator, 0.6, input("idle")).at(-1)!;
    animator.play("nod");
    const [next] = run(animator, FRAME, input("idle"));
    expect(Math.abs(next!.lift - before.lift)).toBeLessThan(0.03);
  });

  test("parpadea solo, cada pocos segundos", () => {
    const animator = createLunitoAnimator("idle", fixedRandom);
    const blinks = run(animator, 6, input("idle")).map((f) => f.blink);
    expect(Math.max(...blinks)).toBeGreaterThan(0.9);
    expect(blinks.filter((b) => b > 0.5).length).toBeLessThan(40);
  });

  test("con los ojos felices no parpadea encima", () => {
    const animator = createLunitoAnimator("celebrating", fixedRandom);
    const frames = run(animator, 6, input("celebrating"));
    expect(Math.max(...frames.map((f) => f.blink))).toBe(0);
  });

  test("gira hacia el puntero y vuelve cuando se va", () => {
    // Dos Lunitos iguales; solo uno ve el puntero.
    const plain = createLunitoAnimator("asking", fixedRandom);
    const follower = createLunitoAnimator("asking", fixedRandom);
    const right = input("asking", { pointer: { x: 1, y: 0 } });
    const turn = (seconds: number, followerInput: AnimatorInput) =>
      run(follower, seconds, followerInput).at(-1)!.turn -
      run(plain, seconds, input("asking")).at(-1)!.turn;
    expect(turn(1, right)).toBeGreaterThan(0.15);
    expect(Math.abs(turn(2, input("asking")))).toBeLessThan(0.01);
  });

  test("el parpadeo cierra rápido y abre más despacio", () => {
    expect(blinkCurve(0)).toBe(0);
    expect(blinkCurve(0.09)).toBe(1);
    expect(blinkCurve(0.3)).toBe(0);
    // A los 0.02 s de empezar a cerrar va más lejos que a los 0.02 s de
    // empezar a abrir.
    expect(blinkCurve(0.02)).toBeGreaterThan(1 - blinkCurve(0.13));
  });
});
