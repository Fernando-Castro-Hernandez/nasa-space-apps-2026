import { expect, test } from "@playwright/test";

// Prueba de humo: la app compilada carga y muestra su pantalla principal.
// Cuando exista el recorrido del demo, esta prueba debe cubrirlo.
test("la app carga", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Health Monitor" }),
  ).toBeVisible();
  await expect(page.getByTestId("build-info")).toContainText("Entorno:");
});
