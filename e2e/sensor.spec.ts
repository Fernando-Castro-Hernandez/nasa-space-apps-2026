import { expect, test, type Page } from "@playwright/test";

// La lectura real del sensor (HU-04 y HU-07), de punta a punta. La estación
// es de mentira pero habla como el firmware: mismo servicio, misma
// característica y un mensaje "pulso,spo2" por aviso. Para no esperar 60 s,
// manda un aviso cada 40 ms; la app cuenta un segundo por aviso.

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

/** Pone una estación falsa en `navigator.bluetooth` antes de cargar la app.
 *  Manda 5 avisos sin señal ("0,0") y después pulso de 70 a 72 y SpO2 de 98. */
async function fakeStation(page: Page) {
  await page.addInitScript(() => {
    const characteristic = Object.assign(new EventTarget(), {
      value: undefined as DataView | undefined,
      startNotifications: async () => {
        let sent = 0;
        setInterval(() => {
          const text = sent < 5 ? "0,0" : `${70 + (sent % 3)},98`;
          sent++;
          characteristic.value = new DataView(
            new TextEncoder().encode(text).buffer,
          );
          characteristic.dispatchEvent(new Event("characteristicvaluechanged"));
        }, 40);
      },
    });
    const gatt = {
      connected: false,
      connect: async () => {
        gatt.connected = true;
        return gatt;
      },
      disconnect: () => {
        gatt.connected = false;
      },
      getPrimaryService: async () => ({
        getCharacteristic: async () => characteristic,
      }),
    };
    const device = Object.assign(new EventTarget(), {
      name: "ESP32C3-Salud",
      gatt,
    });
    Object.defineProperty(navigator, "bluetooth", {
      configurable: true,
      value: { requestDevice: async () => device },
    });
  });
}

test("el check-in mide con la estación y esa lectura es la de Inicio, Mi estado y /demo", async ({
  page,
}) => {
  await fakeStation(page);
  await page.goto("/");

  // La bitácora, escrita; después viene el paso del sensor.
  await page.getByRole("button", { name: "Type your answer" }).click();
  const sheet = page.getByRole("dialog", {
    name: "How are you feeling this morning?",
  });
  await sheet
    .getByRole("textbox", { name: "Your answer" })
    .fill("I slept well");
  await sheet.getByRole("button", { name: "Mood 4 of 5: good" }).click();
  await sheet.getByRole("button", { name: "Stress 2 of 5: a little" }).click();
  await sheet.getByRole("button", { name: "Done", exact: true }).click();

  // Sin conectar se ofrece conectar, simular o saltar.
  await expect(
    page.getByRole("button", { name: "Use a simulated reading" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Skip the sensor" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Connect sensor" }).click();

  await expect(
    page.getByText("Live reading from the station sensor.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByText("Reading complete")).toBeVisible({
    timeout: 15_000,
  });
  // La mediana de 70, 71 y 72.
  const values = page.locator(".sensor-values");
  await expect(values).toContainText("71");
  await expect(values).toContainText("98");

  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Skip the test" }).click();
  await page.getByRole("button", { name: "Go to Home" }).click();

  // Inicio muestra la lectura medida; la HRV, que esta estación no mide,
  // queda sin medir en vez de rellenarse.
  await expect(
    page.getByRole("link", { name: /^Pulse: 71\sbpm, Good/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /^Blood oxygen: 98%, Good/ }),
  ).toBeVisible();
  const hrv = page.getByRole("link", {
    name: /^Heart rate variability: not measured/,
  });
  await expect(hrv).toBeVisible();

  await hrv.click();
  await expect(
    page.getByText(/^Measured with the sensor · \d\d:\d\d$/),
  ).toBeVisible();

  // El panel de la demo dice que hay una lectura real y deja quitarla.
  await page.goto("/demo");
  await expect(
    page.getByText(/^Ana has a sensor reading from today \(71\sbpm, 98%\)/),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Discard the sensor reading" })
    .click();
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: /^Pulse: 72\sbpm, Good/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /^Heart rate variability: 45\sms, Good/ }),
  ).toBeVisible();
});

test("en Emergencia, el paso del sensor registra lo que la estación mide en ese momento", async ({
  page,
}) => {
  await fakeStation(page);
  await page.goto("/demo");
  await page
    .getByRole("button", { name: "Simulate an emergency for Ana" })
    .click();
  await page.getByRole("link", { name: "See it in Emergency" }).click();

  const protocol = page.getByRole("list", { name: "Protocol" });
  const step = protocol.getByRole("button", {
    name: /Put the sensor on their finger/,
  });
  // Antes de conectar avisa que registraría una muestra simulada.
  await expect(step).toContainText("records a simulated sample");
  await page.getByRole("button", { name: "Connect sensor" }).click();
  await expect(step).toContainText(/Live: 7[0-2]\sbpm · 98%\sSpO2/);

  await step.click();
  await expect(
    page.getByText(/^Sensor vitals: 7[0-2]\sbpm, 98%\sSpO2$/),
  ).toBeVisible();
});
