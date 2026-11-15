import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { navigate } from "@/app/router";
import { Sheet, SheetContent, SheetTitle } from "./sheet";

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

const renderSheet = () =>
  render(
    <Sheet open>
      <SheetContent side="bottom">
        <SheetTitle>Qué significa cada estado</SheetTitle>
      </SheetContent>
    </Sheet>,
  );

test("una hoja abierta conserva Emergencia a un toque y se cierra con un botón traducido", () => {
  renderSheet();

  expect(
    screen.getByRole("link", { name: "Emergencia" }).getAttribute("href"),
  ).toBe("/emergencia");
  expect(screen.getByRole("button", { name: "Cerrar" })).toBeDefined();
});

test("dentro de la emergencia la hoja no repite el acceso", () => {
  act(() => navigate("/emergencia"));
  renderSheet();

  expect(screen.queryByRole("link", { name: "Emergencia" })).toBeNull();
  expect(screen.getByRole("button", { name: "Cerrar" })).toBeDefined();
});
