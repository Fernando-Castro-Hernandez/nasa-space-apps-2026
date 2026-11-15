import { act, cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { finishDayStart } from "@/app/dayStart";
import { navigate } from "@/app/router";
import { ROUTES } from "@/app/routes";
import { crewMember } from "@/data/crew";
import { openCase, WHAT_HAPPENED } from "@/features/emergency/caseLogic";
import { saveCase } from "@/features/emergency/caseStore";
import { setActiveProfile } from "@/features/profiles/activeProfile";
import { saveVoiceLog } from "@/features/voice/voiceLogStore";
import { setLocale } from "@/i18n";
import { App } from "./App";

// jsdom no tiene WebGL: la escena 3D se prueba a mano, aquí se reemplaza.
vi.mock("@/features/lunito/LunitoScene", () => ({ LunitoScene: () => null }));

const fields = {
  sleepHours: 7,
  sleepQuality: "buena" as const,
  mood: 4,
  stress: 2,
  symptoms: [],
};

// El check-in de la mañana es de otra área: aquí solo importa el contrato
// con la estructura (terminar o posponer) y que guarda la bitácora a medio
// camino, antes del sensor y del resultado.
vi.mock("@/features/day-checkin/DayCheckInScreen", () => ({
  DayCheckInScreen: (props: { onDone: () => void; onSkip: () => void }) => (
    <main>
      <h1>Check-in de la mañana</h1>
      <button
        onClick={() =>
          saveVoiceLog("ana", { transcript: "Dormí bien", fields })
        }
      >
        Guardar bitácora
      </button>
      <button onClick={props.onDone}>Listo</button>
      <button onClick={props.onSkip}>Ahora no</button>
    </main>
  ),
}));

// Sin `globals: true` en Vitest, Testing Library no desmonta sola.
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState(null, "", "/");
});

const openCaseFor = (personId: string) =>
  saveCase(
    openCase(personId, crewMember(personId).name, WHAT_HAPPENED[0], Date.now()),
  );

test.each(ROUTES.filter((r) => r.shell))(
  "la ruta $path muestra el título $title",
  ({ path, title }) => {
    render(<App />);
    act(() => navigate(path));

    expect(
      screen.getByRole("heading", { level: 1, name: title }),
    ).toBeDefined();
  },
);

test("la información del build solo aparece al final del panel de la demo", () => {
  finishDayStart();
  render(<App />);
  for (const path of ["/", "/estado", "/botiquin", "/ajustes"]) {
    act(() => navigate(path));
    expect(screen.queryByTestId("build-info")).toBeNull();
  }
  act(() => navigate("/demo"));
  expect(screen.getByTestId("build-info").textContent).toContain("Entorno:");
});

test("el botón de emergencia está en todas las pantallas menos en la emergencia", () => {
  finishDayStart();
  render(<App />);
  expect(screen.getByRole("link", { name: "Emergencia" })).toBeDefined();

  act(() => navigate("/emergencia"));
  expect(screen.queryByRole("link", { name: "Emergencia" })).toBeNull();
});

test("en Emergencia el título queda para el lector y Salir vuelve a donde estabas", () => {
  render(<App />);
  act(() => navigate("/tareas"));
  act(() => navigate("/emergencia"));

  const title = screen.getByRole("heading", {
    level: 1,
    name: "Emergencia a bordo",
  });
  expect(title.className).toContain("sr-only");
  expect(screen.getByRole("link", { name: "Salir" }).getAttribute("href")).toBe(
    "/tareas",
  );
});

test("un día nuevo empieza con el check-in antes de Inicio", () => {
  render(<App />);

  expect(
    screen.getByRole("heading", { name: "Check-in de la mañana" }),
  ).toBeDefined();
  expect(document.title).toBe("Check-in del día · Nóstos");
});

test("al terminar el check-in, Inicio abre Así estás hoy", () => {
  render(<App />);
  act(() => screen.getByRole("button", { name: "Listo" }).click());

  expect(screen.getByRole("heading", { name: "Así estás hoy" })).toBeDefined();
});

test("'Ahora no' pospone el check-in en esta sesión y lleva a Inicio", () => {
  render(<App />);
  act(() => navigate("/buenos-dias"));
  act(() => screen.getByRole("button", { name: "Ahora no" }).click());

  expect(window.location.pathname).toBe("/");
  expect(screen.getByRole("heading", { name: "Así estás hoy" })).toBeDefined();

  // Volver a Inicio ya no lo pide, pero desde Configuración se puede hacer.
  act(() => navigate("/tareas"));
  act(() => navigate("/"));
  expect(screen.getByRole("heading", { name: "Así estás hoy" })).toBeDefined();
  act(() => navigate("/buenos-dias"));
  expect(
    screen.getByRole("heading", { name: "Check-in de la mañana" }),
  ).toBeDefined();
});

test("el check-in viejo redirige al único check-in, el de la mañana", () => {
  finishDayStart();
  render(<App />);
  act(() => navigate("/check-in"));

  expect(window.location.pathname).toBe("/buenos-dias");
  expect(
    screen.getByRole("heading", { name: "Check-in de la mañana" }),
  ).toBeDefined();
});

test("con la bitácora de hoy guardada, Inicio ya no pide el check-in aunque se haya salido a medias", () => {
  saveVoiceLog("ana", { transcript: "Dormí bien", fields });
  render(<App />);

  expect(screen.getByRole("heading", { name: "Así estás hoy" })).toBeDefined();
});

test("guardar la bitácora no corta el check-in: sigue hasta terminarlo", () => {
  render(<App />);
  act(() => screen.getByRole("button", { name: "Guardar bitácora" }).click());
  expect(
    screen.getByRole("heading", { name: "Check-in de la mañana" }),
  ).toBeDefined();

  act(() => screen.getByRole("button", { name: "Listo" }).click());
  expect(screen.getByRole("heading", { name: "Así estás hoy" })).toBeDefined();
});

test("si sale a Emergencia a medio check-in, al volver a Inicio ya no empieza de cero", () => {
  render(<App />);
  act(() => screen.getByRole("button", { name: "Guardar bitácora" }).click());
  act(() => navigate("/emergencia"));
  act(() => navigate("/"));

  expect(screen.getByRole("heading", { name: "Así estás hoy" })).toBeDefined();
});

test("el check-in de la mañana es de cada perfil: tras el de Ana, Luis tiene el suyo", () => {
  render(<App />);
  act(() => screen.getByRole("button", { name: "Listo" }).click());
  expect(screen.getByRole("heading", { name: "Así estás hoy" })).toBeDefined();

  act(() => setActiveProfile("luis"));
  act(() => navigate("/"));
  expect(
    screen.getByRole("heading", { name: "Check-in de la mañana" }),
  ).toBeDefined();
});

test("el formato viejo de la marca (una fecha suelta) salta el check-in en todo el dispositivo", () => {
  const d = new Date();
  localStorage.setItem(
    "nostos.day-start",
    `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
  );
  setActiveProfile("luis");
  render(<App />);

  expect(screen.getByRole("heading", { name: "Así estás hoy" })).toBeDefined();
});

test("con el día ya iniciado, Inicio abre Así estás hoy", () => {
  finishDayStart();
  render(<App />);

  expect(screen.getByRole("heading", { name: "Así estás hoy" })).toBeDefined();
  expect(document.title).toBe("Inicio · Nóstos");
});

test.each([
  ["/tripulacion", "Tu tripulación", "Equipo"],
  ["/tareas", "Hoy", "Tareas"],
  ["/ajustes", "Configuración", "Ajustes"],
])("%s abre %s con su pestaña activa", (path, heading, tab) => {
  render(<App />);
  act(() => navigate(path));

  expect(
    screen.getByRole("heading", { level: 1, name: heading }),
  ).toBeDefined();
  expect(
    screen.getByRole("link", { name: tab }).getAttribute("aria-current"),
  ).toBe("page");
});

test("con un caso abierto, toda la app muestra la franja roja con quién y el caso", () => {
  finishDayStart();
  openCaseFor("luis");
  render(<App />);

  for (const path of ["/", "/tareas", "/estado", "/demo"]) {
    act(() => navigate(path));
    const banner = screen.getByRole("link", {
      name: /Emergencia en curso · Luis · Se desmayó/,
    });
    expect(banner.getAttribute("href")).toBe("/emergencia");
    expect(screen.getByRole("link", { name: "Ver caso" })).toBeDefined();
    // "Ver caso" una sola vez: el botón de la cabecera; la franja es su enlace.
    expect(screen.getAllByText("Ver caso")).toHaveLength(1);
    expect(screen.queryByRole("link", { name: "Emergencia" })).toBeNull();
  }

  for (const path of ["/emergencia", "/tierra"]) {
    act(() => navigate(path));
    expect(screen.queryByText(/Emergencia en curso/)).toBeNull();
  }
});

test("con un caso abierto, Inicio no se detiene en el check-in", () => {
  openCaseFor("ana");
  render(<App />);

  expect(screen.getByRole("heading", { name: "Así estás hoy" })).toBeDefined();
  expect(screen.getByText(/Emergencia en curso · Ana/)).toBeDefined();
});

test("en inglés, la cabecera, la barra, la franja y el título del navegador cambian de idioma", () => {
  setLocale("en");
  finishDayStart();
  openCaseFor("luis");
  render(<App />);
  act(() => navigate("/botiquin"));

  const nav = screen.getByRole("navigation", { name: "Main navigation" });
  for (const tab of ["Home", "Crew", "Tasks", "Settings"])
    expect(within(nav).getByRole("link", { name: tab })).toBeDefined();
  const header = screen.getByRole("banner");
  expect(within(header).getByRole("link", { name: "Tasks" })).toBeDefined();
  expect(
    screen.getByRole("link", {
      name: /Emergency in progress · Luis · Fainted/,
    }),
  ).toBeDefined();
  expect(screen.getByRole("link", { name: "View case" })).toBeDefined();
  expect(document.title).toBe("Med kit · Nóstos");
});

test("una ruta desconocida cae en Inicio", () => {
  finishDayStart();
  render(<App />);
  act(() => navigate("/no-existe"));

  expect(screen.getByRole("heading", { name: "Así estás hoy" })).toBeDefined();
});
