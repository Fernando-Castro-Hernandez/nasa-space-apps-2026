import { describe, expect, test } from "vitest";
import { CAMERA, placeCamera, PORTRAIT } from "./framing";

const distance = ({ position, target }: ReturnType<typeof placeCamera>) =>
  Math.hypot(
    position[0] - target[0],
    position[1] - target[1],
    position[2] - target[2],
  );

/** Alto que ve la cámara a la distancia del cuadro. */
const visibleHeight = (placement: ReturnType<typeof placeCamera>) =>
  2 * distance(placement) * Math.tan((CAMERA.fov * Math.PI) / 360);

describe("encuadre del avatar", () => {
  test("en un lienzo cuadrado, el cuadro de la imagen lo llena justo", () => {
    const placement = placeCamera(1, 0);
    expect(visibleHeight(placement)).toBeCloseTo(PORTRAIT.size);
    expect(placement.target[1]).toBe(PORTRAIT.centerY);
  });

  test("ancho: manda el alto; angosto: manda el ancho (como contain)", () => {
    expect(distance(placeCamera(2, 0))).toBeCloseTo(
      distance(placeCamera(1, 0)),
    );
    expect(distance(placeCamera(0.5, 0))).toBeCloseTo(
      2 * distance(placeCamera(1, 0)),
    );
  });

  test("si el lienzo se sale de la caja, el cuadro sigue ocupando la caja", () => {
    const bleed = 0.1;
    expect(visibleHeight(placeCamera(1, bleed))).toBeCloseTo(
      PORTRAIT.size * (1 + 2 * bleed),
    );
  });

  test("mira apenas desde arriba", () => {
    const { position, target } = placeCamera(1);
    expect(position[1]).toBeGreaterThan(target[1]);
    expect(position[2]).toBeGreaterThan(position[1] - target[1]);
  });

  test("los planos de corte abrazan al modelo", () => {
    const placement = placeCamera(1);
    expect(placement.near).toBeGreaterThan(0);
    expect(placement.near).toBeLessThan(distance(placement) - 1);
    expect(placement.far).toBeGreaterThan(distance(placement) + 1);
  });
});
