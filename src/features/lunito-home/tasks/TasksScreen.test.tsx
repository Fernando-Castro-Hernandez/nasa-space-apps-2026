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
import { finishDayStart } from "@/app/dayStart";
import { setActiveProfile } from "@/features/profiles/activeProfile";
import { ReferenceTasksScreen } from "./TasksScreen";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

const total = DAY_ACTIONS.length + 1;
const actionName = DAY_ACTIONS[0]!.text;
const isChecked = () =>
  (screen.getByRole("checkbox", { name: actionName }) as HTMLInputElement)
    .checked;

test("el contador cambia al marcar y desmarcar una tarea", () => {
  finishDayStart();
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

test("el check-in pendiente enlaza a /buenos-dias y el completado no", () => {
  const { unmount } = render(<ReferenceTasksScreen />);
  expect(
    screen.getByRole("link", { name: /Comenzar/ }).getAttribute("href"),
  ).toBe("/buenos-dias");
  unmount();
  finishDayStart();
  render(<ReferenceTasksScreen />);
  expect(screen.queryByRole("link", { name: /Comenzar/ })).toBeNull();
  expect(screen.getByText("Completado")).toBeDefined();
});

test("los bloques Próximamente no tienen controles habilitados", () => {
  render(<ReferenceTasksScreen />);
  for (const name of ["Aurora, próximamente", "Recordatorio, próximamente"]) {
    const block = screen.getByRole("region", { name });
    expect(block.textContent).toContain("Próximamente");
    for (const control of block.querySelectorAll("button, a, input"))
      expect((control as HTMLButtonElement).disabled).toBe(true);
  }
  expect(
    (screen.getByRole("button", { name: "Editar" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
});

test("conserva el acceso al botiquín", () => {
  render(<ReferenceTasksScreen />);
  expect(
    screen.getByRole("link", { name: /Botiquín/ }).getAttribute("href"),
  ).toBe("/botiquin");
});
