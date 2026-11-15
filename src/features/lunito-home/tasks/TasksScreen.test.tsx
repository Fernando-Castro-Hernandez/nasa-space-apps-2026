import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, test } from "vitest";
import { CREW } from "@/data/crew";
import { DAY_ACTIONS } from "@/data/actions";
import { setActiveProfile } from "@/features/profiles/activeProfile";
import { saveVoiceLog } from "@/features/voice/voiceLogStore";
import { ReferenceTasksScreen } from "./TasksScreen";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

const total = DAY_ACTIONS.length + 1;
const actionName = DAY_ACTIONS[0]!.text;
const isChecked = () =>
  (screen.getByRole("checkbox", { name: actionName }) as HTMLInputElement)
    .checked;

const checkIn = () =>
  screen.getByRole("checkbox", {
    name: /Check-in del día/,
  }) as HTMLInputElement;
const lunito = () =>
  screen.queryByRole("img", { name: "Todo listo por hoy. Lunito lo celebra." });

/** El check-in del día se da por hecho cuando su bitácora está guardada. */
const saveCheckIn = (profile = "ana") =>
  saveVoiceLog(profile, {
    transcript: "Dormí bien",
    fields: {
      sleepHours: 7,
      sleepQuality: null,
      mood: null,
      stress: null,
      symptoms: [],
    },
  });

test("el contador cambia al marcar y desmarcar una tarea", () => {
  saveCheckIn();
  render(<ReferenceTasksScreen />);
  expect(screen.getByText(`1 de ${total} completadas`)).toBeDefined();
  const box = screen.getByRole("checkbox", { name: actionName });
  fireEvent.click(box);
  expect(screen.getByText(`2 de ${total} completadas`)).toBeDefined();
  expect(screen.getByRole("progressbar").getAttribute("value")).toBe(
    String(Math.round((2 / total) * 100)),
  );
  fireEvent.click(box);
  expect(screen.getByText(`1 de ${total} completadas`)).toBeDefined();
});

test("marcar persiste por perfil", () => {
  render(<ReferenceTasksScreen />);
  act(() => setActiveProfile(CREW[0]!.id));
  fireEvent.click(screen.getByRole("checkbox", { name: actionName }));
  expect(isChecked()).toBe(true);
  act(() => setActiveProfile(CREW[1]!.id));
  expect(isChecked()).toBe(false);
  act(() => setActiveProfile(CREW[0]!.id));
  expect(isChecked()).toBe(true);
});

test("el check-in se marca con la bitácora de hoy del perfil, no con el inicio del día", () => {
  const { unmount } = render(<ReferenceTasksScreen />);
  expect(checkIn().checked).toBe(false);
  expect(
    screen.getByRole("link", { name: /Comenzar/ }).getAttribute("href"),
  ).toBe("/buenos-dias");
  unmount();

  saveCheckIn("luis");
  render(<ReferenceTasksScreen />);
  expect(checkIn().checked).toBe(false);
  act(() => setActiveProfile("luis"));
  expect(checkIn().checked).toBe(true);
  expect(screen.queryByRole("link", { name: /Comenzar/ })).toBeNull();
  // La bitácora guarda su hora: "Completado · 09:24".
  expect(screen.getByText(/^Completado · \d{2}:\d{2}$/)).toBeDefined();
});

test("al completar todo lo del día aparece Lunito celebrando", () => {
  saveCheckIn();
  render(<ReferenceTasksScreen />);
  for (const action of DAY_ACTIONS.slice(0, -1))
    fireEvent.click(screen.getByRole("checkbox", { name: action.text }));
  expect(lunito()).toBeNull();
  fireEvent.click(
    screen.getByRole("checkbox", { name: DAY_ACTIONS.at(-1)!.text }),
  );
  expect(screen.getByText(`${total} de ${total} completadas`)).toBeDefined();
  expect(lunito()).not.toBeNull();
});

test("los bloques Próximamente se ven pero no tienen nada que tocar", () => {
  render(<ReferenceTasksScreen />);
  for (const name of ["Aurora, próximamente", "Recordatorio, próximamente"]) {
    const block = screen.getByRole("region", { name });
    expect(block.textContent).toContain("Próximamente");
    expect(block.querySelectorAll("button, a, input")).toHaveLength(0);
  }
  expect(screen.queryByRole("button", { name: "Editar" })).toBeNull();
});

test("el acceso al botiquín está justo bajo la lista de hoy", () => {
  render(<ReferenceTasksScreen />);
  const kit = screen.getByRole("link", { name: /Botiquín/ });
  expect(kit.getAttribute("href")).toBe("/botiquin");
  const aurora = screen.getByRole("region", { name: "Aurora, próximamente" });
  expect(
    kit.compareDocumentPosition(aurora) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});
