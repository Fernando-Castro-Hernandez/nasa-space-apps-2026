import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { setReadingIndex } from "@/features/demo/readingStore";
import { openCase } from "./caseLogic";
import { saveCase } from "./caseStore";
import { EscalationCard } from "./EscalationCard";

afterEach(() => {
  cleanup();
  setReadingIndex(0);
  saveCase(null);
  localStorage.clear();
});

const title = "¿Avisar al cirujano de vuelo?";

test("en Bien no propone nada", () => {
  render(<EscalationCard />);
  expect(screen.queryByRole("heading", { name: title })).toBeNull();
});

test("en Atención propone avisar a Tierra y, con un toque, abre el caso con el motivo y los signos", () => {
  setReadingIndex(2); // La demo pone Atención.
  render(<EscalationCard />);
  expect(screen.getByRole("heading", { name: title })).toBeDefined();
  expect(screen.getByText(/14 min/)).toBeDefined();

  fireEvent.click(
    screen.getByRole("button", { name: "Enviar reporte a Tierra" }),
  );
  const saved = JSON.parse(localStorage.getItem("nostos.case")!);
  expect(saved.what).toBe("redStatus");
  expect(saved.events.map((e: { kind: string }) => e.kind)).toEqual([
    "open",
    "vitals",
  ]);
  expect(saved.events[0].params.reason).toBeTruthy();
  expect(window.location.pathname).toBe("/emergencia");
});

test("'Todavía no' la oculta y no manda nada", () => {
  setReadingIndex(2);
  render(<EscalationCard />);
  fireEvent.click(screen.getByRole("button", { name: "Todavía no" }));
  expect(screen.queryByRole("heading", { name: title })).toBeNull();
  expect(localStorage.getItem("nostos.case")).toBeNull();
});

test("con un caso ya abierto no se vuelve a proponer", () => {
  setReadingIndex(2);
  saveCase(openCase("ana", "Ana", "fainted", Date.now()));
  render(<EscalationCard />);
  expect(screen.queryByRole("heading", { name: title })).toBeNull();
});
