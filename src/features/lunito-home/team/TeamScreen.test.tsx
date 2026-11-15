import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, test } from "vitest";
import { sendEncouragement } from "@/features/crew/encouragement";
import { setShared } from "@/features/crew/privacy";
import { saveCase } from "@/features/emergency/caseStore";
import { setActiveProfile } from "@/features/profiles/activeProfile";
import { TeamScreen } from "./TeamScreen";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

test("no muestra el perfil activo", () => {
  setActiveProfile("ana");
  render(<TeamScreen />);
  expect(screen.queryByRole("button", { name: "Ver a Ana" })).toBeNull();
  expect(screen.getByRole("button", { name: "Ver a Luis" })).toBeDefined();
});

test("quien no comparte muestra Sin compartir y no su estado", () => {
  setActiveProfile("ana");
  setShared("luis", false);
  render(<TeamScreen />);
  fireEvent.click(screen.getByRole("button", { name: "Ver a Luis" }));
  expect(screen.getByText("Luis · Sin compartir")).toBeDefined();
  expect(screen.getByText("No comparte su estado")).toBeDefined();
  expect(screen.queryByText(/Luis · Bien/)).toBeNull();
});

test("tocar abre la hoja; Cerrar y Escape la cierran", () => {
  setActiveProfile("ana");
  render(<TeamScreen />);
  expect(screen.getByText(/Compañero del día/)).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Ver a Luis" }));
  expect(screen.getByText("Luis · Bien")).toBeDefined();
  expect(screen.getByText("Estado compartido")).toBeDefined();
  expect(screen.queryByText(/Compañero del día/)).toBeNull();

  fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
  expect(screen.queryByText("Luis · Bien")).toBeNull();
  // El foco vuelve al Lunito que abrió la hoja, no se pierde en la página.
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Ver a Luis" }),
  );

  fireEvent.click(screen.getByRole("button", { name: "Ver a Mei" }));
  expect(screen.getByText("Mei · Bien")).toBeDefined();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByText("Mei · Bien")).toBeNull();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Ver a Mei" }),
  );
});

test("Enviar ánimo funciona y lo confirma en el mismo botón", () => {
  setActiveProfile("ana");
  render(<TeamScreen />);
  fireEvent.click(screen.getByRole("button", { name: "Ver a Mei" }));
  const cheer = screen.getByRole("button", { name: "Enviar ánimo" });
  expect((cheer as HTMLButtonElement).disabled).toBe(false);
  fireEvent.click(cheer);
  const sent = screen.getByRole("button", { name: "Ánimo enviado a Mei" });
  expect((sent as HTMLButtonElement).disabled).toBe(true);
  expect(sent.hasAttribute("data-sent")).toBe(true);
});

test("quien recibe ánimo ve quién se lo mandó hoy", () => {
  sendEncouragement("ana", "luis");
  sendEncouragement("mei", "luis");
  setActiveProfile("ana");
  const { unmount } = render(<TeamScreen />);
  expect(screen.queryByText(/te mandó ánimo|te mandaron ánimo/)).toBeNull();
  unmount();

  setActiveProfile("luis");
  render(<TeamScreen />);
  expect(screen.getByText("Ana y Mei te mandaron ánimo")).toBeDefined();
});

test("con un caso abierto se marca a la persona y su hoja lleva al caso", () => {
  saveCase({
    id: "c1",
    personId: "luis",
    what: "Se desmayó",
    openedAt: Date.now(),
    steps: {},
    events: [],
    orders: [],
  });
  setActiveProfile("ana");
  render(<TeamScreen />);
  const luis = screen.getByRole("button", { name: "Ver a Luis" });
  expect(luis.hasAttribute("data-emergency")).toBe(true);
  expect(luis.textContent).toContain("Emergencia");
  // Nada lúdico compite con el caso: no se ofrece el compañero del día.
  expect(screen.queryByText(/Compañero del día/)).toBeNull();

  fireEvent.click(luis);
  const sheet = screen.getByRole("region", { name: "Detalle de Luis" });
  expect(within(sheet).getByText("Luis · Emergencia")).toBeDefined();
  expect(
    within(sheet)
      .getByRole("link", { name: /Ver caso/ })
      .getAttribute("href"),
  ).toBe("/emergencia");
  expect(
    within(sheet).queryByRole("button", { name: "Enviar ánimo" }),
  ).toBeNull();
  saveCase(null);
});

test("todos ven la autonomía; solo el comandante ve el balanceador", () => {
  const { unmount } = render(<TeamScreen />);
  expect(screen.getByText("Autonomía de la tripulación")).toBeDefined();
  expect(screen.queryByText("Balanceador de carga")).toBeNull();
  unmount();

  setActiveProfile("mei");
  render(<TeamScreen />);
  expect(screen.getByText("Autonomía de la tripulación")).toBeDefined();
  expect(screen.getByText("Balanceador de carga")).toBeDefined();
});

test("la autonomía da un solo número y nombra cada peligro", () => {
  render(<TeamScreen />);
  expect(screen.getAllByText(/^92\s?%$/)).toHaveLength(1);
  expect(screen.getByText("11 de 12 casos bien atendidos")).toBeDefined();
  expect(screen.getByText("Radiación")).toBeDefined();
  expect(screen.queryByText(/91[.,]7/)).toBeNull();
});

test("el balanceador usa las palabras del glosario y se puede deshacer", () => {
  setActiveProfile("mei");
  render(<TeamScreen />);
  expect(
    screen.getByText(
      "Ana: Precaución por Aislamiento. ¿Intercambiar su caminata espacial con Luis?",
    ),
  ).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Aprobar" }));
  expect(
    screen.getByText("Aprobado: Luis hará la caminata espacial."),
  ).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Deshacer" }));
  expect(screen.getByRole("button", { name: "Aprobar" })).toBeDefined();
});
