import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { App } from "./App";

test("muestra el título y la información del build", () => {
  render(<App />);

  expect(
    screen.getByRole("heading", { level: 1, name: "Health Monitor" }),
  ).toBeDefined();
  expect(screen.getByTestId("build-info").textContent).toContain("Entorno:");
});
