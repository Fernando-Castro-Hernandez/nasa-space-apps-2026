// Ayudas para las pruebas E2E. Describen la app como la ve quien la abre: en
// inglés, el idioma oficial.
import { expect, type Page } from "@playwright/test";

/** El check-in de la mañana ya se hizo hoy: "/" abre Inicio. */
export async function morningDone(page: Page) {
  await page.addInitScript(() => {
    const d = new Date();
    localStorage.setItem(
      "nostos.day-start",
      `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
    );
  });
}

/** Baja hasta el final de la página y de cada zona con su propio scroll. */
export async function scrollToEnd(page: Page) {
  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
    for (const el of document.querySelectorAll<HTMLElement>("body *")) {
      const { overflowY } = getComputedStyle(el);
      if (
        (overflowY === "auto" || overflowY === "scroll") &&
        el.scrollHeight > el.clientHeight
      )
        el.scrollTop = el.scrollHeight;
    }
  });
}

/** El botón Emergencia de la cabecera, a un toque. */
export const emergencyButton = (page: Page) =>
  page.getByRole("link", { name: "Emergency", exact: true });

/**
 * Elige un perfil en Settings; la app vuelve a Inicio. El check-in de la
 * mañana es de cada perfil: si el nuevo no lo ha hecho hoy, aparece y se
 * pospone con "Not now".
 */
export async function chooseProfile(page: Page, name: string) {
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Settings", exact: true })
    .click();
  await page.getByRole("button", { name: /^Change profile/ }).click();
  await page.getByRole("button", { name: new RegExp(`^${name}`) }).click();
  const home = page.getByRole("heading", { name: "How you're doing today" });
  const notNow = page.getByRole("button", { name: "Not now" });
  await expect(home.or(notNow)).toBeVisible();
  if (await notNow.isVisible()) await notNow.click();
  await expect(home).toBeVisible();
}

/** En el panel /demo, elige la lectura que muestra Inicio. */
export async function showReading(page: Page, status: string) {
  await page.goto("/demo");
  await page
    .getByRole("group", { name: "Reading shown on Home" })
    .getByRole("button", { name: status, exact: true })
    .click();
}

/** Check-in de la mañana escribiendo, sin sensor ni prueba de reacción. */
export async function typedCheckIn(page: Page, answer = "I slept well") {
  await page.getByRole("button", { name: "Type your answer" }).click();
  const sheet = page.getByRole("dialog", {
    name: "How are you feeling this morning?",
  });
  await sheet.getByRole("textbox", { name: "Your answer" }).fill(answer);
  // Sin IA, ánimo y estrés se eligen a mano (son obligatorios).
  await sheet.getByRole("button", { name: "Mood 4 of 5: good" }).click();
  await sheet.getByRole("button", { name: "Stress 2 of 5: a little" }).click();
  await sheet.getByRole("button", { name: "Done", exact: true }).click();
  await page.getByRole("button", { name: "Skip the sensor" }).click();
  await page.getByRole("button", { name: "Skip the test" }).click();
  await expect(
    page.getByRole("heading", { name: "Thanks for telling me" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Go to Home" }).click();
  await expect(
    page.getByRole("heading", { name: "How you're doing today" }),
  ).toBeVisible();
}
