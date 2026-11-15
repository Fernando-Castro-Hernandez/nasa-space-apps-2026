import { expect, test } from "@playwright/test";

for (const width of [390, 768, 1440]) {
  test(`Órbita navega sin desbordes a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Principal" });
    for (const label of ["Equipo", "Tareas", "Ajustes", "Inicio"]) {
      await nav.getByRole("link", { name: label, exact: true }).click();
      await expect(
        nav.getByRole("link", { name: label, exact: true }),
      ).toHaveAttribute("aria-current", "page");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await expect(
        page.getByRole("link", { name: "Emergencia", exact: true }),
      ).toBeVisible();
    }
    await page.getByRole("button", { name: /Pulso:.*Ver evolución/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("link", { name: "Hacer check-in con Lunito" }).click();
    await expect(
      page.getByRole("heading", { name: "¿Cómo amaneciste hoy?" }),
    ).toBeVisible();
    await expect(nav).toHaveCount(0);
  });
}
