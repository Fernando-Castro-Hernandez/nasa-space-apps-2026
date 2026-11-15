import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, test } from "vitest";
import { setActiveProfile } from "@/features/profiles/activeProfile";
import { LunitoHomeScreen } from "./LunitoHomeScreen";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

function openData() {
  render(<LunitoHomeScreen />);
  fireEvent.click(screen.getByRole("button", { name: "Tus datos" }));
  return screen.getByRole("tabpanel");
}

test("las dos páginas de Inicio mantienen el punto activo y la navegación", () => {
  render(<LunitoHomeScreen />);
  const pagination = screen.getByRole("group", { name: "Páginas de Inicio" });
  expect(within(pagination).getAllByRole("button")).toHaveLength(2);
  expect(screen.getByRole("heading", { name: "Así estás hoy" })).toBeDefined();
  expect(
    screen
      .getByRole("button", { name: "Así estás hoy" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "Tus datos" }));
  expect(screen.queryByRole("heading", { name: "Así estás hoy" })).toBeNull();
  expect(screen.getByRole("heading", { name: "Tus datos" })).toBeDefined();
  expect(
    screen
      .getByRole("button", { name: "Tus datos" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  expect(
    screen.getByRole("link", { name: "Inicio" }).getAttribute("aria-current"),
  ).toBe("page");
});

test("el teclado cambia la página desde los puntos sin capturar controles internos", () => {
  render(<LunitoHomeScreen />);
  const carousel = screen.getByRole("button", { name: "Así estás hoy" });
  fireEvent.keyDown(carousel, { key: "ArrowRight" });
  fireEvent.keyDown(screen.getByRole("tab", { name: "Pulso" }), {
    key: "ArrowLeft",
  });
  expect(screen.getByRole("heading", { name: "Tus datos" })).toBeDefined();
  fireEvent.keyDown(carousel, { key: "Home" });
  expect(screen.getByRole("heading", { name: "Así estás hoy" })).toBeDefined();
  fireEvent.keyDown(carousel, { key: "End" });
  expect(screen.getByRole("heading", { name: "Tus datos" })).toBeDefined();
});

test("el gesto horizontal cambia página y el vertical permite continuar en Tus datos", () => {
  render(<LunitoHomeScreen />);
  const carousel = screen.getByRole("main", { name: "Inicio" });
  fireEvent.touchStart(carousel, { touches: [{ clientX: 300, clientY: 300 }] });
  fireEvent.touchEnd(carousel, {
    changedTouches: [{ clientX: 80, clientY: 310 }],
  });
  expect(screen.getByRole("heading", { name: "Tus datos" })).toBeDefined();
  fireEvent.touchStart(carousel, { touches: [{ clientX: 250, clientY: 650 }] });
  const uncancelled = fireEvent.touchEnd(carousel, {
    changedTouches: [{ clientX: 230, clientY: 180 }],
  });
  expect(uncancelled).toBe(true);
  expect(screen.getByRole("heading", { name: "Tus datos" })).toBeDefined();
  fireEvent.touchStart(carousel, { touches: [{ clientX: 80, clientY: 300 }] });
  fireEvent.touchEnd(carousel, {
    changedTouches: [{ clientX: 300, clientY: 300 }],
  });
  expect(screen.getByRole("heading", { name: "Así estás hoy" })).toBeDefined();
});

test("Pulso solo muestra su indicador y cada selector cambia valor y gráfica", () => {
  openData();
  expect(screen.getByRole("tabpanel", { name: "Pulso" }).textContent).toContain(
    "72 lpm",
  );
  expect(screen.getByRole("tabpanel").textContent).not.toContain("45 ms");
  expect(screen.getByRole("tabpanel").textContent).not.toContain("98 %");
  fireEvent.click(screen.getByRole("button", { name: "L: 71 lpm" }));
  expect(screen.getByText("71 lpm")).toBeDefined();
  fireEvent.click(screen.getByRole("tab", { name: /Variabilidad\s*cardíaca/ }));
  expect(
    screen.getByRole("tabpanel", { name: /Variabilidad\s*cardíaca/ })
      .textContent,
  ).toContain("45 ms");
  expect(
    screen.getByRole("figure", { name: /Variabilidad cardíaca, semana/ }),
  ).toBeDefined();
  fireEvent.click(screen.getByRole("tab", { name: /Oxígeno\s*en sangre/ }));
  expect(
    screen.getByRole("tabpanel", { name: /Oxígeno\s*en sangre/ }).textContent,
  ).toContain("98 %");
  expect(screen.getByRole("tabpanel").textContent).not.toContain("45 ms");
});

test("Mes cambia la serie y conserva Tu misión dentro de Inicio", () => {
  openData();
  fireEvent.click(screen.getByRole("button", { name: "Mes" }));
  expect(
    screen.getByRole("button", { name: "Mes" }).getAttribute("aria-pressed"),
  ).toBe("true");
  expect(screen.getByText("Últimas 4 semanas")).toBeDefined();
  expect(screen.getByRole("figure", { name: /Pulso, mes/ })).toBeDefined();
  expect(screen.getByRole("heading", { name: "Tu misión" })).toBeDefined();
  expect(
    screen.getByRole("figure", { name: "Autonomía 68 %, objetivo 100 %" }),
  ).toBeDefined();
  expect(
    screen
      .getByRole("button", { name: "Enviar ánimo" })
      .hasAttribute("disabled"),
  ).toBe(true);
  expect(screen.getByText(/Datos de demostración/)).toBeDefined();
});

test("RIDGE solo aparece para el perfil comandante y no expone motivos privados", () => {
  openData();
  expect(screen.queryByRole("list", { name: "Panel RIDGE" })).toBeNull();
  act(() => setActiveProfile("mei"));
  expect(
    within(screen.getByRole("list", { name: "Panel RIDGE" })).getAllByRole(
      "listitem",
    ),
  ).toHaveLength(5);
  expect(screen.queryByText(/Sueño bajo en Ana/)).toBeNull();
  act(() => setActiveProfile("ana"));
  expect(screen.queryByRole("list", { name: "Panel RIDGE" })).toBeNull();
});
