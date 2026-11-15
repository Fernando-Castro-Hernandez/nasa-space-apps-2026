import { expect, test, type Page } from "@playwright/test";
import {
  chooseProfile,
  emergencyButton,
  showReading,
  typedCheckIn,
} from "./app";

// El recorrido de la demo en vivo (SISTEMA.md §11), en inglés y hasta donde se
// puede sin el sensor real: el panel /demo pone la lectura y los eventos.

const tab = (page: Page, name: string) =>
  page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name, exact: true })
    .click();

test.describe("a 390 px", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("pasos 1 a 4: check-in en verde, el pulso sube, respiración guiada y CO₂ resuelto a bordo", async ({
    page,
  }) => {
    // 1. Check-in en reposo: queda en Good.
    await page.goto("/");
    await typedCheckIn(page);
    await expect(page.locator(".status-word")).toHaveText("Good");

    // 2. Tras las sentadillas el pulso sube y la app lo detecta (G).
    await showReading(page, "Caution");
    await page.goto("/");
    await expect(page.locator(".status-word")).toHaveText("Caution");
    const pulse = page.getByRole("link", { name: /^Pulse: 79 bpm, Caution/ });
    await expect(pulse).toBeVisible();
    // El motivo es una frase completa, con el nombre del glosario.
    await expect(page.locator(".today-reason")).toHaveText(
      /heart rate variability \(HRV\) below your usual range/i,
    );
    await pulse.click();
    await expect(
      page.getByRole("heading", { level: 1, name: "My status" }),
    ).toBeVisible();
    await expect(page.getByText("RIDGE · Gravity")).toBeVisible();

    // 3. Respiración guiada (I): la tarea del día se marca.
    await tab(page, "Tasks");
    await expect(page.getByText("1 of 3 completed")).toBeVisible();
    await page
      .getByRole("checkbox", { name: "Guided breathing · 5 min" })
      .check();
    await expect(page.getByText("2 of 3 completed")).toBeVisible();

    // 4. CO₂ alto en un módulo: la luz E cambia para la comandante.
    await page.goto("/demo");
    await page.getByRole("button", { name: "Raise CO₂ in a module" }).click();
    await chooseProfile(page, "Mei");
    await page.getByRole("button", { name: "Your data", exact: true }).click();
    const ridge = page.getByRole("list", { name: "RIDGE panel" });
    const light = ridge
      .getByRole("listitem")
      .filter({ hasText: "Environment" });
    await expect(light).toContainText("Caution");
    // La tripulación lo resuelve a bordo y la autonomía sube.
    await tab(page, "Crew");
    await expect(page.getByText("11 of 12 cases handled well")).toBeVisible();
    await page.goto("/demo");
    await page
      .getByRole("button", { name: /^High CO₂ in the lab module/ })
      .click();
    await expect(
      page.getByRole("button", { name: "CO₂ solved on board" }),
    ).toBeDisabled();
    await tab(page, "Crew");
    await expect(page.getByText("12 of 13 cases handled well")).toBeVisible();
    await tab(page, "Home");
    await page.getByRole("button", { name: "Your data", exact: true }).click();
    await expect(light).toContainText("Good");
  });
});

test("paso 5: la emergencia se abre en la nave, llega a Tierra, Tierra responde y se cierra", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Not now" }).click();

  // Alguien pulsa Emergencia: a quién le pasa y qué pasó.
  await emergencyButton(page).click();
  const open = page.getByRole("button", { name: /^Choose the person/ });
  await expect(open).toBeDisabled();
  await page.getByRole("button", { name: /^Omar/ }).click();
  await page.getByRole("button", { name: "Fainted", exact: true }).click();
  await page.getByRole("button", { name: "Open emergency · Omar" }).click();
  await expect(
    page.getByRole("heading", { name: "Omar · Fainted" }),
  ).toBeVisible();
  await expect(
    page.getByText(/^Case sent to Ground · \d{2}:\d{2}$/),
  ).toBeVisible();
  await expect(page.getByText("Ground reply in")).toBeVisible();
  await page
    .getByRole("list", { name: "Protocol" })
    .getByRole("button", { name: /Put the sensor on their finger/ })
    .click();
  await expect(
    page.getByText(/^Sensor vitals: 58\sbpm, 97%\sSpO2$/),
  ).toBeVisible();

  // Salir no cierra el caso: toda la app lo muestra.
  await page.getByRole("link", { name: "Exit" }).click();
  const strip = page.getByRole("link", {
    name: /Emergency in progress · Omar · Fainted/,
  });
  await expect(strip).toBeVisible();
  await tab(page, "Crew");
  await expect(strip).toBeVisible();
  await expect(page.getByText("Emergency", { exact: true })).toBeVisible();

  // El caso llega a la consola del cirujano de vuelo.
  await page.goto("/tierra");
  await expect(
    page.getByRole("heading", { name: "Omar · Fainted" }),
  ).toBeVisible();
  await expect(page.getByText("S · Situation")).toBeVisible();
  await expect(page.getByText(/^Omar fainted at \d{2}:\d{2}\./)).toBeVisible();
  await expect(page.getByText("Timeline")).toBeVisible();
  await expect(
    page.getByText("Link active · 14-min delay each way"),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Instruction for the medical officer" })
    .fill("Keep him at rest and repeat the reading in 10 min");
  await page.getByRole("button", { name: "Send to the ship" }).click();
  await expect(
    page.getByText(
      "Ground instruction: Keep him at rest and repeat the reading in 10 min",
    ),
  ).toBeVisible();

  // En la nave, la indicación llega como un paso de la checklist.
  await page.getByRole("link", { name: "Back to the ship" }).click();
  await strip.click();
  const orders = page.getByRole("list", { name: "Ground instructions" });
  await orders.getByRole("button").first().click();
  await expect(
    page.getByText("Done: Keep him at rest and repeat the reading in 10 min"),
  ).toBeVisible();

  // Cerrar pide confirmación; cerrado, la franja desaparece.
  await page.getByRole("button", { name: "Close case" }).click();
  await expect(page.getByText("Close Omar's case?")).toBeVisible();
  await page.getByRole("button", { name: "Yes, close it" }).click();
  await expect(page.getByRole("button", { name: "New case" })).toBeVisible();
  await page.getByRole("link", { name: "Exit" }).click();
  await expect(strip).toHaveCount(0);
  await expect(emergencyButton(page)).toBeVisible();
});

test("el panel de la demo abre el caso con quién y qué pasó, y el reinicio lo borra todo", async ({
  page,
}) => {
  await page.goto("/demo");
  await page
    .getByRole("button", { name: "Simulate an emergency for Ana" })
    .click();
  await expect(
    page.getByRole("link", { name: /Emergency in progress · Ana · Fainted/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await page.getByRole("button", { name: "Yes, reset" }).click();
  await expect(page.getByText("Demo data reset.")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Emergency in progress/ }),
  ).toHaveCount(0);
  // Vuelve el check-in de la mañana (saluda y después pregunta).
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: /Great to see you|How are you feeling this morning\?/,
    }),
  ).toBeVisible();
});

test("el idioma se cambia en Settings, se recuerda y vuelve", async ({
  page,
}) => {
  await page.goto("/ajustes");
  await page.getByRole("button", { name: "Español", exact: true }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Configuración" }),
  ).toBeVisible();
  const nav = page.getByRole("navigation", { name: "Navegación principal" });
  for (const name of ["Inicio", "Equipo", "Tareas", "Ajustes"])
    await expect(nav.getByRole("link", { name, exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Emergencia" })).toBeVisible();
  await expect(page).toHaveTitle("Configuración · Nóstos");
  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: "Configuración" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Settings" }),
  ).toBeVisible();
  await expect(emergencyButton(page)).toBeVisible();
});
