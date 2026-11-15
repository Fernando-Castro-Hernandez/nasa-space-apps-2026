import { expect, test } from "vitest";
import { exitTo, pagePlace, redirectFor } from "./pages";

test.each([
  ["/estado", "/", "/"],
  ["/botiquin", "/tareas", "/tareas"],
  ["/demo", "/ajustes", "/ajustes"],
])("%s vuelve a %s con su pestaña marcada", (path, back, tab) => {
  const place = pagePlace(path);
  expect(place.back.href).toBe(back);
  expect(place.tab).toBe(tab);
  expect(place.emergency).not.toBe(false);
});

test("Emergencia no tiene barra, ni botón Emergencia, ni título visible", () => {
  const place = pagePlace("/emergencia", "/tareas");
  expect(place.tab).toBeUndefined();
  expect(place.emergency).toBe(false);
  expect(place.hideTitle).toBe(true);
  expect(place.back).toEqual({ href: "/tareas", label: "Salir" });
});

test("Salir vuelve a la pantalla de donde se vino o, si no hay, a Inicio", () => {
  expect(exitTo("/tripulacion")).toBe("/tripulacion");
  expect(exitTo(null)).toBe("/");
  expect(exitTo("/emergencia")).toBe("/");
});

test("una pantalla desconocida vuelve a Inicio", () => {
  expect(pagePlace("/otra").back.href).toBe("/");
});

test("el check-in viejo redirige al único check-in, el de la mañana", () => {
  expect(redirectFor("/check-in")).toBe("/buenos-dias");
  expect(redirectFor("/tareas")).toBeNull();
});
