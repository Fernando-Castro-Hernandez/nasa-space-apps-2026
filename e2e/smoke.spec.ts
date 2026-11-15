import { expect, test } from "@playwright/test";
import { emergencyButton, morningDone, scrollToEnd } from "./app";

// Prueba de humo sobre el build: cada pantalla abre con su título, tiene una
// salida visible y Emergencia está siempre a un toque, también al bajar.

test("la app abre en el check-in de la mañana, con Emergencia y 'Not now'", async ({
  page,
}) => {
  await page.goto("/");
  // Lunito saluda y, un momento después, pregunta.
  await expect(
    page.getByRole("heading", {
      name: /Hi! Great to see you|How are you feeling this morning\?/,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "How are you feeling this morning?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Talk to Lunito" }),
  ).toBeVisible();
  await expect(emergencyButton(page)).toBeVisible();
  await expect(page.getByRole("button", { name: "Not now" })).toBeVisible();
  await expect(page).toHaveTitle("Morning check-in · Nóstos");
});

test("/check-in lleva al único check-in, el de la mañana", async ({ page }) => {
  await page.goto("/check-in");
  await expect(page).toHaveURL(/\/buenos-dias$/);
  await expect(
    page.getByRole("heading", {
      name: /Great to see you|How are you feeling this morning\?/,
    }),
  ).toBeVisible();
});

const SCREENS = [
  { path: "/", title: "How you're doing today", tab: "Home" },
  { path: "/tripulacion", title: "Your crew", tab: "Crew" },
  { path: "/tareas", title: "Today", tab: "Tasks" },
  { path: "/ajustes", title: "Settings", tab: "Settings" },
  { path: "/estado", title: "My status", tab: "Home", back: "Home" },
  { path: "/botiquin", title: "Med kit", tab: "Tasks", back: "Tasks" },
  { path: "/demo", title: "Demo panel", tab: "Settings", back: "Settings" },
];

for (const width of [390, 820, 1280]) {
  test(`a ${width} px, cada pantalla dice dónde se está y Emergencia se ve antes y después de bajar`, async ({
    page,
  }) => {
    await morningDone(page);
    await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
    for (const screen of SCREENS) {
      await page.goto(screen.path);
      await expect(
        page.getByRole("heading", { level: 1, name: screen.title }),
      ).toBeVisible();
      const nav = page.getByRole("navigation", { name: "Main navigation" });
      await expect(
        nav.getByRole("link", { name: screen.tab, exact: true }),
      ).toHaveAttribute("aria-current", "page");
      if (screen.back)
        await expect(
          page
            .getByRole("banner")
            .getByRole("link", { name: screen.back, exact: true }),
        ).toBeVisible();
      await expect(emergencyButton(page)).toBeInViewport();
      await scrollToEnd(page);
      await expect(emergencyButton(page)).toBeInViewport();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${screen.path} no se desborda a lo ancho`,
      ).toBe(true);
    }
  });
}

test("Emergencia no se repite a sí misma y tiene una salida visible", async ({
  page,
}) => {
  await morningDone(page);
  await page.goto("/tareas");
  await emergencyButton(page).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Emergency on board" }),
  ).toBeAttached();
  await expect(
    page.getByRole("heading", { name: "Who needs help?" }),
  ).toBeVisible();
  await expect(emergencyButton(page)).toHaveCount(0);
  await page.getByRole("link", { name: "Exit" }).click();
  await expect(page).toHaveURL(/\/tareas$/);
});

test("la consola de Tierra abre sin la barra de la app y con salida a la nave", async ({
  page,
}) => {
  await page.goto("/tierra");
  await expect(
    page.getByRole("heading", { level: 1, name: "Ground medical console" }),
  ).toBeVisible();
  await expect(page.getByText("No open cases")).toBeVisible();
  await expect(page.getByRole("navigation")).toHaveCount(0);
  await expect(page.getByTestId("build-info")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Back to the ship" }),
  ).toBeVisible();
});

test("la información del build solo sale al final del panel de la demo", async ({
  page,
}) => {
  await morningDone(page);
  await page.goto("/demo");
  await expect(page.getByTestId("build-info")).toContainText("Environment:");
  await page.goto("/ajustes");
  await expect(page.getByTestId("build-info")).toHaveCount(0);
});
