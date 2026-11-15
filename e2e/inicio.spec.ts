import { expect, test, type Page } from "@playwright/test";

// Inicio, Equipo, Tareas y Configuración según las referencias Marea.

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

async function completeStart(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Escribir respuesta" }).click();
  await page.getByRole("textbox").fill("Dormí bien y me siento tranquilo");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Así estás hoy" }),
  ).toBeVisible();
}

async function swipe(page: Page, from: [number, number], to: [number, number]) {
  const client = await page.context().newCDPSession(page);
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: from[0], y: from[1] }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: (from[0] + to[0]) / 2, y: (from[1] + to[1]) / 2 }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: to[0], y: to[1] }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await client.detach();
}

test("inicio escrito conserva foco, entrega Inicio y no se repite al recargar", async ({
  page,
}) => {
  await page.goto("/buenos-dias");
  await expect(
    page.getByRole("heading", { name: /Qué gusto verte/ }),
  ).toBeVisible();
  await expect(page.getByRole("navigation")).toHaveCount(0);
  const write = page.getByRole("button", { name: "Escribir respuesta" });
  await write.click();
  const field = page.getByRole("textbox");
  await expect(field).toBeFocused();
  await field.press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "Cerrar", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "Cancelar", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(write).toBeFocused();
  await write.click();
  await field.fill("Dormí bien");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Así estás hoy" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Así estás hoy" }),
  ).toBeVisible();
});

test("puntos, teclado y selectores muestran solo la métrica elegida", async ({
  page,
}) => {
  await completeStart(page);
  const carousel = page.getByRole("button", {
    name: "Así estás hoy",
    exact: true,
  });
  await expect(
    page.getByRole("group", { name: "Páginas de Inicio" }).getByRole("button"),
  ).toHaveCount(2);
  await page.getByRole("button", { name: "Tus datos", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Tus datos", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const panel = page.getByRole("tabpanel");
  await expect(panel).toContainText("72 lpm");
  await expect(panel).not.toContainText("45 ms");
  await expect(panel).not.toContainText("98 %");
  await page.getByRole("tab", { name: /Variabilidad\s*cardíaca/ }).click();
  await expect(panel).toContainText("45 ms");
  await page.getByRole("tab", { name: /Oxígeno\s*en sangre/ }).click();
  await expect(panel).toContainText("98 %");
  await page.getByRole("button", { name: "Mes", exact: true }).click();
  await expect(
    page.getByRole("figure", { name: /Oxígeno en sangre, mes/ }),
  ).toBeVisible();
  await carousel.focus();
  await carousel.press("Home");
  await expect(
    page.getByRole("heading", { name: "Así estás hoy" }),
  ).toBeVisible();
  await carousel.press("ArrowRight");
  await expect(page.getByRole("heading", { name: "Tus datos" })).toBeVisible();
});

test("tap y deslizamiento horizontal funcionan sin impedir el scroll vertical", async ({
  page,
}) => {
  await completeStart(page);
  const dataDot = page.getByRole("button", { name: "Tus datos", exact: true });
  await dataDot.tap();
  await expect(dataDot).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Así estás hoy", exact: true }).tap();
  await swipe(page, [300, 400], [80, 400]);
  await expect(dataDot).toHaveAttribute("aria-pressed", "true");
  await swipe(page, [220, 550], [220, 240]);
  await expect
    .poll(() =>
      page.locator(".data-page").evaluate((element) => element.scrollTop),
    )
    .toBeGreaterThan(0);
  await expect(dataDot).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("link", { name: "Inicio", exact: true }),
  ).toBeVisible();
});

test("el selector real de perfiles concede RIDGE solo al comandante", async ({
  page,
}) => {
  await completeStart(page);
  await page.getByRole("button", { name: "Tus datos", exact: true }).click();
  await expect(page.getByRole("list", { name: "Panel RIDGE" })).toHaveCount(0);
  await choose(page, /Mei Comandante/);
  await page.getByRole("button", { name: "Tus datos", exact: true }).click();
  const ridge = page.getByRole("list", { name: "Panel RIDGE" });
  await ridge.scrollIntoViewIfNeeded();
  await expect(ridge.getByRole("listitem")).toHaveCount(5);
  await expect(page.getByText(/Sueño bajo en Ana/)).toHaveCount(0);
  await choose(page, /Ana Especialista de misión/);
  await page.getByRole("button", { name: "Tus datos", exact: true }).click();
  await expect(page.getByRole("list", { name: "Panel RIDGE" })).toHaveCount(0);
});

// Choosing a profile in Configuración returns to Inicio (ProfilesScreen).
async function choose(page: Page, profile: RegExp) {
  await page.getByRole("link", { name: "Ajustes", exact: true }).click();
  await page.getByRole("button", { name: /Cambiar perfil/ }).click();
  await page.getByRole("button", { name: profile }).click();
  await expect(
    page.getByRole("heading", { name: "Así estás hoy" }),
  ).toBeVisible();
}

for (const width of [390, 768, 1440]) {
  test(`la barra inferior recorre las cuatro áreas sin desbordes a ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await completeStart(page);
    for (const [tab, heading] of [
      ["Equipo", "Tu tripulación"],
      ["Tareas", "Hoy"],
      ["Ajustes", "Configuración"],
      ["Inicio", "Así estás hoy"],
    ]) {
      const nav = page.getByRole("navigation", {
        name: "Navegación principal",
      });
      await nav.getByRole("link", { name: tab, exact: true }).click();
      await expect(
        nav.getByRole("link", { name: tab, exact: true }),
      ).toHaveAttribute("aria-current", "page");
      await expect(
        page.getByRole("heading", { level: 1, name: heading }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await expect(
        page.getByRole("link", { name: "Emergencia", exact: true }),
      ).toBeVisible();
    }
  });
}
