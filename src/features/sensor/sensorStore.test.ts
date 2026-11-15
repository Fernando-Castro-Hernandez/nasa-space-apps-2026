import { afterEach, expect, test, vi } from "vitest";
import type { Bluetooth } from "./bluetooth";
import { fakeStation } from "./fakeStation";
import { SENSOR_NAME, SENSOR_SERVICE } from "./protocol";
import {
  connectSensor,
  disconnectSensor,
  onSensorSample,
  sensorLink,
} from "./sensorStore";

afterEach(() => {
  disconnectSensor();
  vi.useRealTimers();
});

test("sin Web Bluetooth el sensor no está disponible", async () => {
  await connectSensor(null);
  expect(sensorLink()).toBe("unsupported");
});

test("conecta buscando la estación por su servicio o su nombre y entrega las lecturas", async () => {
  const station = fakeStation();
  const samples: unknown[] = [];
  const stop = onSensorSample((sample) => samples.push(sample));

  await connectSensor(station.bluetooth);
  expect(sensorLink()).toBe("on");
  expect(station.requestDevice).toHaveBeenCalledWith({
    filters: [{ services: [SENSOR_SERVICE] }, { name: SENSOR_NAME }],
    optionalServices: [SENSOR_SERVICE],
  });

  station.notify("72,98");
  station.notify("basura");
  station.notify("0,0");
  expect(samples).toEqual([
    { bpm: 72, spo2: 98, contact: true, intervals: [] },
    { bpm: null, spo2: null, contact: false, intervals: [] },
  ]);

  stop();
  station.notify("73,98");
  expect(samples).toHaveLength(2);
});

test("cerrar el selector sin elegir deja el sensor sin conectar, sin error", async () => {
  const bluetooth: Bluetooth = {
    requestDevice: async () => {
      throw Object.assign(new Error("cancelado"), { name: "NotFoundError" });
    },
  };
  await connectSensor(bluetooth);
  expect(sensorLink()).toBe("off");
});

test("si la estación no responde, queda en 'se perdió' para reintentar", async () => {
  const station = fakeStation({ failures: 1 });
  await connectSensor(station.bluetooth);
  expect(sensorLink()).toBe("lost");
  // El reintento usa la estación ya elegida: no vuelve a abrir el selector.
  await connectSensor(station.bluetooth);
  expect(sensorLink()).toBe("on");
  expect(station.requestDevice).toHaveBeenCalledTimes(1);
});

test("al perder la conexión se reconecta sola y sigue entregando lecturas", async () => {
  vi.useFakeTimers();
  const station = fakeStation();
  const samples: unknown[] = [];
  const stop = onSensorSample((sample) => samples.push(sample));
  await connectSensor(station.bluetooth);

  station.drop(1);
  expect(sensorLink()).toBe("lost");
  await vi.advanceTimersByTimeAsync(1000);
  expect(sensorLink()).toBe("lost");
  await vi.advanceTimersByTimeAsync(1000);
  expect(sensorLink()).toBe("on");

  station.notify("70,97");
  expect(samples).toHaveLength(1);
  stop();
});

test("si no vuelve, se queda en 'se perdió'; reintentar abre el selector otra vez", async () => {
  vi.useFakeTimers();
  const station = fakeStation();
  await connectSensor(station.bluetooth);

  station.drop(99);
  await vi.advanceTimersByTimeAsync(5000);
  expect(sensorLink()).toBe("lost");

  // Primer reintento a mano con la misma estación: sigue sin responder.
  await connectSensor(station.bluetooth);
  expect(sensorLink()).toBe("lost");
  station.drop(0);
  await connectSensor(station.bluetooth);
  expect(sensorLink()).toBe("on");
  expect(station.requestDevice).toHaveBeenCalledTimes(2);
});

test("desconectar suelta la estación y no intenta reconectar", async () => {
  vi.useFakeTimers();
  const station = fakeStation();
  await connectSensor(station.bluetooth);

  disconnectSensor();
  expect(station.gatt.disconnect).toHaveBeenCalled();
  expect(sensorLink()).toBe("off");
  await vi.advanceTimersByTimeAsync(5000);
  expect(sensorLink()).toBe("off");
});
