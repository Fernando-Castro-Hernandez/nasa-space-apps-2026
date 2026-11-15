import { expect, test } from "@playwright/test";

// Prueba de humo: la app compilada carga y cada pantalla principal abre con
// su título. Cuando exista el recorrido del demo completo, debe cubrirlo.
test("la app carga en el saludo del día", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /Qué gusto verte/ }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Emergencia" })).toBeVisible();
});

test("las pantallas con barra lateral muestran la información del build", async ({
  page,
}) => {
  await page.goto("/estado");
  await expect(page.getByTestId("build-info")).toContainText("Entorno:");
});

test("el dashboard muestra los datos que salen de Lunito", async ({ page }) => {
  await page.goto("/estado");

  await expect(
    page.getByRole("heading", { level: 1, name: "Mi estado" }),
  ).toBeVisible();
  await expect(page.locator(".callout", { hasText: "Oxígeno" })).toBeVisible();
});

for (const [path, title] of [
  ["/check-in", "Check-in"],
  ["/tripulacion", "Tu tripulación"],
  ["/botiquin", "Botiquín"],
  ["/emergencia", "Emergencia a bordo"],
]) {
  test(`${path} abre con su título`, async ({ page }) => {
    await page.goto(path);
    await expect(
      page.getByRole("heading", { level: 1, name: title }),
    ).toBeVisible();
  });
}

test("la consola de Tierra abre sin la barra lateral", async ({ page }) => {
  await page.goto("/tierra");
  await expect(page.getByText("Consola médica · Tierra")).toBeVisible();
  await expect(page.getByTestId("build-info")).toHaveCount(0);
});
