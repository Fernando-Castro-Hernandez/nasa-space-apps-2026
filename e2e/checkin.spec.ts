import { expect, test } from "@playwright/test";
import { emergencyButton, typedCheckIn } from "./app";

// El único check-in, el de la mañana (/buenos-dias), escribiendo. Sin Worker
// en el build de prueba: la IA no ordena el texto y los campos se eligen a mano.

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

test("el check-in escrito llega al resultado, a Inicio y a Tareas, y no se repite", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "How are you feeling this morning?" }),
  ).toBeVisible();
  await typedCheckIn(page, "I slept seven hours and I feel calm");

  // Inicio ya no invita al check-in: ofrece hablar con Lunito.
  await expect(page.getByRole("link", { name: "Do my check-in" })).toHaveCount(
    0,
  );
  await page
    .getByRole("button", { name: "Talk to Lunito", exact: true })
    .click();
  const chat = page.getByRole("region", { name: "Talk to Lunito" });
  await expect(
    chat.getByText(/^Hi, Ana\. Your status today is Good/),
  ).toBeVisible();
  // La hoja tapa la cabecera: trae su propio Emergencia.
  await expect(
    page.getByRole("dialog").getByRole("link", { name: "Emergency" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(emergencyButton(page)).toBeVisible();

  // Tareas lo marca hecho, con su hora.
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Tasks", exact: true })
    .click();
  await expect(page.getByText(/^Completed · \d{2}:\d{2}$/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Start" })).toHaveCount(0);

  // Al volver a abrir la app, Inicio no repite el check-in.
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "How you're doing today" }),
  ).toBeVisible();
});

test("la hoja de escribir guarda el foco, se cierra con Escape y no sale sin ánimo ni estrés", async ({
  page,
}) => {
  await page.goto("/buenos-dias");
  const write = page.getByRole("button", { name: "Type your answer" });
  await write.click();
  const sheet = page.getByRole("dialog", {
    name: "How are you feeling this morning?",
  });
  const field = sheet.getByRole("textbox", { name: "Your answer" });
  await expect(field).toBeFocused();
  // Emergencia sigue a un toque con la hoja abierta.
  await expect(sheet.getByRole("link", { name: "Emergency" })).toBeVisible();
  // El foco no se escapa de la hoja.
  for (let i = 0; i < 25; i++) await page.keyboard.press("Tab");
  expect(
    await page.evaluate(() => !!document.activeElement?.closest("dialog")),
  ).toBe(true);
  await field.fill("I slept well");
  await expect(
    sheet.getByRole("button", { name: "Done", exact: true }),
  ).toBeDisabled();
  await expect(
    sheet.getByText("Choose your mood and stress to finish."),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await expect(write).toBeFocused();
});

test("'Not now' pospone el check-in: Inicio se abre y Tareas lo deja pendiente", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Not now" }).click();
  await expect(
    page.getByRole("heading", { name: "How you're doing today" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Do my check-in" }),
  ).toBeVisible();
  await page.goto("/tareas");
  await expect(page.getByRole("link", { name: "Start" })).toHaveAttribute(
    "href",
    "/buenos-dias",
  );
});
