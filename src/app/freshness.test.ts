import { expect, test } from "vitest";
import { watchForNewVersion } from "./freshness";

/** Un `navigator.serviceWorker` de mentira. */
const fakeWorkers = (controller: object | null) =>
  Object.assign(new EventTarget(), { controller }) as unknown as Parameters<
    typeof watchForNewVersion
  >[0] &
    EventTarget;

test("sin service worker (navegador sin soporte, pruebas) la pestaña nunca queda atrás", () => {
  expect(watchForNewVersion(undefined)()).toBe(false);
});

test("la primera instalación no cuenta como versión nueva", () => {
  const workers = fakeWorkers(null);
  const isStale = watchForNewVersion(workers);
  workers.dispatchEvent(new Event("controllerchange"));
  expect(isStale()).toBe(false);
  // El siguiente cambio sí: ya había una versión al mando.
  workers.dispatchEvent(new Event("controllerchange"));
  expect(isStale()).toBe(true);
});

test("si ya había un service worker al mando, el cambio deja la pestaña atrás", () => {
  const workers = fakeWorkers({});
  const isStale = watchForNewVersion(workers);
  expect(isStale()).toBe(false);
  workers.dispatchEvent(new Event("controllerchange"));
  expect(isStale()).toBe(true);
});
