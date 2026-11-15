import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, expect, test, vi } from "vitest";
import { LunitoAvatar, type LunitoAvatarHandle } from "./LunitoAvatar";

// Sin `globals: true` en Vitest, Testing Library no desmonta sola.
afterEach(cleanup);

// jsdom no tiene WebGL: el avatar se queda con su imagen, como un navegador
// sin 3D.
test("sin WebGL se ve la imagen de respaldo con su nombre accesible", () => {
  render(<LunitoAvatar fallbackSrc="/saludo.webp" label="Lunito te saluda" />);
  const avatar = screen.getByRole("img", { name: "Lunito te saluda" });
  const image = avatar.querySelector("img")!;
  expect(image.getAttribute("src")).toBe("/saludo.webp");
  expect(image.style.opacity).toBe("1");
  expect(avatar.querySelector("canvas")).toBeNull();
});

test("con onTap es un botón con el mismo nombre", () => {
  const onTap = vi.fn();
  render(
    <LunitoAvatar
      fallbackSrc="/x.webp"
      label="Hablar con Lunito"
      onTap={onTap}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Hablar con Lunito" }));
  expect(onTap).toHaveBeenCalledOnce();
  expect(screen.queryByRole("img", { name: "Hablar con Lunito" })).toBeNull();
});

test("es cuadrado por defecto y acepta su propio tamaño", () => {
  render(
    <LunitoAvatar
      fallbackSrc="/x.webp"
      label="Lunito"
      className="today-lunito"
      style={{ width: 120 }}
    />,
  );
  const avatar = screen.getByRole("img", { name: "Lunito" });
  expect(avatar.className).toContain("today-lunito");
  expect(avatar.style.aspectRatio).toBe("1 / 1");
  expect(avatar.style.width).toBe("120px");
});

test("pedirle un gesto sin 3D no rompe nada", () => {
  const ref = createRef<LunitoAvatarHandle>();
  render(<LunitoAvatar ref={ref} fallbackSrc="/x.webp" label="Lunito" />);
  expect(() => ref.current!.play("wave")).not.toThrow();
});
