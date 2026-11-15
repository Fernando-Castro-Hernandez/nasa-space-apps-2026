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
import { saveVoiceLog } from "@/features/voice/voiceLogStore";
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
  fireEvent.click(screen.getByRole("button", { name: "lun: 71 lpm" }));
  expect(screen.getByText("71 lpm")).toBeDefined();
  fireEvent.click(screen.getByRole("tab", { name: /Variabilidad\s*cardíaca/ }));
  expect(
    screen.getByRole("tabpanel", { name: /Variabilidad\s*cardíaca/ })
      .textContent,
  ).toContain("45 ms");
  expect(
    screen.getByRole("figure", { name: /Variabilidad cardíaca, semana/ }),
  ).toBeDefined();
  fireEvent.click(screen.getByRole("tab", { name: "Oxígeno en sangre" }));
  // El oxígeno es un porcentaje con el formato del idioma.
  expect(
    screen.getByRole("tabpanel", { name: "Oxígeno en sangre" }).textContent,
  ).toContain("98%");
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
});

test("Tu misión: la autonomía de Equipo, casos bien atendidos y un ánimo que se envía", () => {
  openData();
  // La misma cuenta que Equipo: 11 de 12 casos cerrados, con un solo redondeo.
  // Con los mismos nombres que la tarjeta de Equipo.
  expect(screen.getByText("Autonomía de la tripulación")).toBeDefined();
  expect(
    screen.getByRole("figure", { name: "Autonomía 92%, meta 100%" }),
  ).toBeDefined();
  expect(screen.getByText("11 de 12 casos bien atendidos")).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Enviar ánimo" }));
  expect(
    screen
      .getByRole("button", { name: "Ánimo enviado a Luis" })
      .hasAttribute("disabled"),
  ).toBe(true);
  // Sin el aviso falso de "sin conexión a un backend".
  expect(screen.queryByText(/backend/)).toBeNull();
});

test("RIDGE solo aparece para el perfil comandante y no expone motivos privados", () => {
  openData();
  expect(screen.queryByRole("list", { name: "Panel RIDGE" })).toBeNull();
  act(() => setActiveProfile("mei"));
  const ridge = within(screen.getByRole("list", { name: "Panel RIDGE" }));
  expect(ridge.getAllByRole("listitem")).toHaveLength(5);
  // Los cinco peligros con sus nombres de siempre (common.hazards).
  expect(ridge.getByText("Distancia")).toBeDefined();
  expect(ridge.getByText("Ambiente")).toBeDefined();
  expect(screen.queryByText(/Sueño bajo en Ana/)).toBeNull();
  act(() => setActiveProfile("ana"));
  expect(screen.queryByRole("list", { name: "Panel RIDGE" })).toBeNull();
});

test("Tus datos muestra lo que la persona contó en su check-in de hoy; sin check-in, no aparece", () => {
  const first = render(<LunitoHomeScreen />);
  fireEvent.click(screen.getByRole("button", { name: "Tus datos" }));
  expect(
    screen.queryByRole("region", { name: "Tu check-in de hoy" }),
  ).toBeNull();
  first.unmount();

  saveVoiceLog("ana", {
    transcript: "Dormí cinco horas y me duele la cabeza",
    fields: {
      sleepHours: 5,
      sleepQuality: "mala",
      mood: 2,
      stress: 4,
      symptoms: ["dolor_cabeza"],
    },
  });
  render(<LunitoHomeScreen />);
  fireEvent.click(screen.getByRole("button", { name: "Tus datos" }));
  const summary = screen.getByRole("region", { name: "Tu check-in de hoy" });
  expect(within(summary).getByText(/^Guardado · \d{2}:\d{2}$/)).toBeDefined();
  const row = (label: string) =>
    within(summary).getByText(label).nextElementSibling?.textContent;
  expect(row("Sueño")).toBe("5 h · Mala");
  expect(row("Ánimo")).toBe("2 de 5 · bajo");
  expect(row("Estrés")).toBe("4 de 5 · bastante");
  expect(row("Síntomas")).toBe("Dolor de cabeza");
  // Es de la persona activa: otro perfil no la ve.
  act(() => setActiveProfile("luis"));
  expect(
    screen.queryByRole("region", { name: "Tu check-in de hoy" }),
  ).toBeNull();
});
