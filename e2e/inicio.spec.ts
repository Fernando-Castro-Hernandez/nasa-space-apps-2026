import { expect, test, type Page } from "@playwright/test";
import { chooseProfile, emergencyButton, typedCheckIn } from "./app";

// Inicio, Equipo, Tareas y Settings según las referencias Marea, en inglés.

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

async function completeStart(page: Page) {
  await page.goto("/");
  await typedCheckIn(page);
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

test("puntos, teclado y selectores muestran solo la métrica elegida", async ({
  page,
}) => {
  await completeStart(page);
  const carousel = page.getByRole("button", {
    name: "How you're doing today",
    exact: true,
  });
  await expect(
    page.getByRole("group", { name: "Home pages" }).getByRole("button"),
  ).toHaveCount(2);
  await page.getByRole("button", { name: "Your data", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Your data", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const panel = page.getByRole("tabpanel");
  await expect(panel).toContainText("72 bpm");
  await expect(panel).not.toContainText("45 ms");
  await expect(panel).not.toContainText("98%");
  // Los días del eje se distinguen: tres letras, sin "T" ni "S" repetidas.
  await expect(
    panel.getByRole("button", { name: "Tue: 77 bpm" }),
  ).toBeAttached();
  await page.getByRole("tab", { name: /Heart\s*rate\s*variability/ }).click();
  await expect(panel).toContainText("45 ms");
  await page.getByRole("tab", { name: /Blood\s*oxygen/ }).click();
  await expect(panel).toContainText("98%");
  await page.getByRole("button", { name: "Month", exact: true }).click();
  await expect(
    page.getByRole("figure", { name: /Blood oxygen, month/ }),
  ).toBeVisible();
  await carousel.focus();
  await carousel.press("Home");
  await expect(
    page.getByRole("heading", { name: "How you're doing today" }),
  ).toBeVisible();
  await carousel.press("ArrowRight");
  await expect(page.getByRole("heading", { name: "Your data" })).toBeVisible();
});

test("tap y deslizamiento horizontal funcionan sin impedir el scroll vertical", async ({
  page,
}) => {
  await completeStart(page);
  const dataDot = page.getByRole("button", { name: "Your data", exact: true });
  await dataDot.tap();
  await expect(dataDot).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "How you're doing today", exact: true })
    .tap();
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
    page.getByRole("link", { name: "Home", exact: true }),
  ).toBeVisible();
  await expect(emergencyButton(page)).toBeInViewport();
});

test("tocar una burbuja abre Mi estado en esa métrica, con salida a Inicio", async ({
  page,
}) => {
  await completeStart(page);
  await page
    .getByRole("link", { name: /^Heart rate variability: 45 ms, Good/ })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: "My status" }),
  ).toBeVisible();
  await expect(
    page.getByRole("tab", { name: /Heart rate variability/ }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("banner").getByRole("link", { name: "Home" }).click();
  await expect(
    page.getByRole("heading", { name: "How you're doing today" }),
  ).toBeVisible();
});

test("el selector de perfiles concede RIDGE solo a la comandante", async ({
  page,
}) => {
  await completeStart(page);
  await page.getByRole("button", { name: "Your data", exact: true }).click();
  await expect(page.getByRole("list", { name: "RIDGE panel" })).toHaveCount(0);
  await chooseProfile(page, "Mei");
  await page.getByRole("button", { name: "Your data", exact: true }).click();
  const ridge = page.getByRole("list", { name: "RIDGE panel" });
  await ridge.scrollIntoViewIfNeeded();
  await expect(ridge.getByRole("listitem")).toHaveCount(5);
  await chooseProfile(page, "Ana");
  await page.getByRole("button", { name: "Your data", exact: true }).click();
  await expect(page.getByRole("list", { name: "RIDGE panel" })).toHaveCount(0);
});

test("el ánimo enviado en Equipo le llega a quien lo recibe", async ({
  page,
}) => {
  await completeStart(page);
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Crew", exact: true })
    .click();
  await page.getByRole("button", { name: "See Luis" }).click();
  const sheet = page.getByRole("region", { name: "Luis's details" });
  await sheet.getByRole("button", { name: "Send encouragement" }).click();
  await expect(sheet.getByText("Sent to Luis")).toBeVisible();
  await chooseProfile(page, "Luis");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Crew", exact: true })
    .click();
  await expect(page.getByText("Ana sent you encouragement")).toBeVisible();
});

for (const width of [390, 768, 1440]) {
  test(`la barra inferior recorre las cuatro áreas sin desbordes a ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await completeStart(page);
    for (const [tab, heading] of [
      ["Crew", "Your crew"],
      ["Tasks", "Today"],
      ["Settings", "Settings"],
      ["Home", "How you're doing today"],
    ]) {
      const nav = page.getByRole("navigation", {
        name: "Main navigation",
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
      await expect(emergencyButton(page)).toBeVisible();
    }
  });
}
